"use server";

import type { ActionResponse } from "@/app/data/types/action-response";
import { appErrors } from "@/app/data/types/errors";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { PostType } from "@prisma/client";
import { updateUserActivity } from "./profile";

// Interfaces
export interface PostWithDetails {
  id: string;
  content: string;
  type: PostType;

  // Commitment-specific fields
  goal: string | null;
  deadline: Date | null;
  stakeAmount: number | null;
  stakeCurrency: string | null;
  stakeDescription: string | null;
  stakeRecipient: string | null;
  progressPercentage: number | null;
  progressNotes: string | null;
  isCompleted: boolean;
  isFailed: boolean;
  completedAt: Date | null;
  failedAt: Date | null;

  // Legacy fields (for backward compatibility)
  revenueAmount: number | null;
  currency: string | null;
  commitsCount: number | null;
  repoUrl: string | null;

  viewsCount: number;
  sharesCount: number;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    username: string | null;
    name: string | null;
    avatar: string | null;
    verified: boolean;
  };
  _count: {
    likes: number;
    comments: number;
  };
  tags: {
    tag: {
      id: string;
      name: string;
    };
  }[];
  isLiked?: boolean; // For current user
}

export interface PostComment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    username: string | null;
    name: string | null;
    avatar: string | null;
    verified: boolean;
  };
}

// Validation schemas
const createPostSchema = z.object({
  content: z.string().min(1).max(2000),
  type: z.nativeEnum(PostType).default(PostType.COMMITMENT),
  goal: z.string().min(1).max(200).optional(),
  deadline: z.date().optional(),
  stakeAmount: z.number().positive().optional(),
  stakeCurrency: z.string().length(3).optional(),
  stakeDescription: z.string().min(1).max(200).optional(),
  stakeRecipient: z.string().min(1).max(100).optional(),
  progressPercentage: z.number().min(0).max(100).optional(),
  progressNotes: z.string().max(1000).optional(),
  // Legacy fields
  revenueAmount: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  commitsCount: z.number().min(0).optional(),
  repoUrl: z.string().url().optional(),
  tags: z.array(z.string()).max(5).optional(),
});

const updatePostSchema = z.object({
  content: z.string().min(1).max(2000).optional(),
  revenueAmount: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  commitsCount: z.number().min(0).optional(),
  repoUrl: z.string().url().optional(),
  tags: z.array(z.string()).max(5).optional(),
});

const commentSchema = z.object({
  content: z.string().min(1).max(1000),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreateCommentInput = z.infer<typeof commentSchema>;

// Helper function to map database post to PostWithDetails
function mapPostToDetails(post: any): PostWithDetails {
  return {
    id: post.id,
    content: post.content,
    type: post.type,
    // Commitment fields
    goal: post.goal,
    deadline: post.deadline,
    stakeAmount: post.stakeAmount ? Number(post.stakeAmount) : null,
    stakeCurrency: post.stakeCurrency,
    stakeDescription: post.stakeDescription,
    stakeRecipient: post.stakeRecipient,
    progressPercentage: post.progressPercentage,
    progressNotes: post.progressNotes,
    isCompleted: post.isCompleted,
    isFailed: post.isFailed,
    completedAt: post.completedAt,
    failedAt: post.failedAt,
    // Legacy fields
    revenueAmount: post.revenueAmount ? Number(post.revenueAmount) : null,
    currency: post.currency,
    commitsCount: post.commitsCount,
    repoUrl: post.repoUrl,
    viewsCount: post.viewsCount,
    sharesCount: post.sharesCount,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: post.author,
    _count: post._count,
    tags: post.tags,
    isLiked: post.likes?.length > 0 || false,
  };
}

/**
 * Create a new post
 */
export async function createPost(
  input: CreatePostInput
): Promise<ActionResponse<PostWithDetails>> {
  try {
    const { user: authUser } = await withAuth({ ensureSignedIn: true });

    // Validate input
    const validatedData = createPostSchema.parse(input);

    // Get or create user in database
    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        verified: true,
      },
    });

    if (!dbUser) {
      return {
        success: false,
        error: appErrors.NOT_FOUND,
      };
    }

    // Create post with transaction for consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create the post
      const post = await tx.post.create({
        data: {
          content: validatedData.content,
          type: validatedData.type,
          goal: validatedData.goal,
          deadline: validatedData.deadline,
          stakeAmount: validatedData.stakeAmount,
          stakeCurrency: validatedData.stakeCurrency,
          stakeDescription: validatedData.stakeDescription,
          stakeRecipient: validatedData.stakeRecipient,
          progressPercentage: validatedData.progressPercentage,
          progressNotes: validatedData.progressNotes,
          // Legacy fields
          revenueAmount: validatedData.revenueAmount,
          currency: validatedData.currency,
          commitsCount: validatedData.commitsCount,
          repoUrl: validatedData.repoUrl,
          authorId: authUser.id,
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
              verified: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });

      // Handle tags if provided
      if (validatedData.tags && validatedData.tags.length > 0) {
        const tagOperations = validatedData.tags.map(async (tagName) => {
          // Get or create tag
          const tag = await tx.tag.upsert({
            where: { name: tagName.toLowerCase() },
            update: {},
            create: { name: tagName.toLowerCase() },
          });

          // Create post-tag relation
          await tx.postTag.create({
            data: {
              postId: post.id,
              tagId: tag.id,
            },
          });

          return tag;
        });

        await Promise.all(tagOperations);
      }

      return post;
    });

    // Update user activity for streak tracking
    await updateUserActivity(authUser.id, "post");

    // Revalidate relevant paths
    revalidatePath("/feed");
    revalidatePath("/profile");
    revalidateTag(`user-posts-${authUser.id}`);

    // Fetch the complete post with updated tags
    const completePost = await prisma.post.findUnique({
      where: { id: result.id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            verified: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!completePost) {
      return {
        success: false,
        error: appErrors.DATABASE_ERROR,
      };
    }

    const postWithDetails = mapPostToDetails(completePost);

    return {
      success: true,
      data: postWithDetails,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: appErrors.VALIDATION_ERROR,
      };
    }

    console.error("Error creating post:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

/**
 * Get posts for feed (with pagination)
 */
export async function getPosts(
  limit: number = 20,
  offset: number = 0,
  userId?: string
): Promise<ActionResponse<PostWithDetails[]>> {
  try {
    let currentUserId: string | null = null;

    // Get current user if authenticated (for like status)
    try {
      const { user: authUser } = await withAuth();
      currentUserId = authUser?.id || null;
    } catch {
      // Not authenticated, continue without user context
    }

    const posts = await prisma.post.findMany({
      where: userId ? { authorId: userId } : {},
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            verified: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        ...(currentUserId && {
          likes: {
            where: {
              userId: currentUserId,
            },
            select: {
              id: true,
            },
          },
        }),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    const postsWithDetails: PostWithDetails[] = posts.map(mapPostToDetails);

    return {
      success: true,
      data: postsWithDetails,
    };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

/**
 * Get a single post by ID
 */
export async function getPost(
  postId: string
): Promise<ActionResponse<PostWithDetails>> {
  try {
    let currentUserId: string | null = null;

    // Get current user if authenticated (for like status)
    try {
      const { user: authUser } = await withAuth();
      currentUserId = authUser?.id || null;
    } catch {
      // Not authenticated, continue without user context
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            verified: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        ...(currentUserId && {
          likes: {
            where: {
              userId: currentUserId,
            },
            select: {
              id: true,
            },
          },
        }),
      },
    });

    if (!post) {
      return {
        success: false,
        error: appErrors.NOT_FOUND,
      };
    }

    // Increment view count
    await prisma.post.update({
      where: { id: postId },
      data: { viewsCount: { increment: 1 } },
    });

    const postWithDetails = mapPostToDetails({
      ...post,
      viewsCount: post.viewsCount + 1, // Include the increment
    });

    return {
      success: true,
      data: postWithDetails,
    };
  } catch (error) {
    console.error("Error fetching post:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

/**
 * Update a post (only by author)
 */
export async function updatePost(
  postId: string,
  input: UpdatePostInput
): Promise<ActionResponse<PostWithDetails>> {
  try {
    const { user: authUser } = await withAuth({ ensureSignedIn: true });

    // Validate input
    const validatedData = updatePostSchema.parse(input);

    // Check if user owns the post
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!existingPost) {
      return {
        success: false,
        error: appErrors.NOT_FOUND,
      };
    }

    if (existingPost.authorId !== authUser.id) {
      return {
        success: false,
        error: appErrors.UNAUTHORIZED,
      };
    }

    // Update post with transaction for consistency
    const result = await prisma.$transaction(async (tx) => {
      // Separate tags from other data
      const { tags, ...updateData } = validatedData;

      // Update the post
      const updatedPost = await tx.post.update({
        where: { id: postId },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true,
              verified: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });

      // Handle tags if provided
      if (tags !== undefined) {
        // Remove existing tags
        await tx.postTag.deleteMany({
          where: { postId },
        });

        // Add new tags
        if (tags.length > 0) {
          const tagOperations = tags.map(async (tagName) => {
            const tag = await tx.tag.upsert({
              where: { name: tagName.toLowerCase() },
              update: {},
              create: { name: tagName.toLowerCase() },
            });

            await tx.postTag.create({
              data: {
                postId,
                tagId: tag.id,
              },
            });

            return tag;
          });

          await Promise.all(tagOperations);
        }
      }

      return updatedPost;
    });

    // Revalidate relevant paths
    revalidatePath("/feed");
    revalidatePath("/profile");
    revalidateTag(`post-${postId}`);

    // Fetch the complete updated post with tags
    const completeUpdatedPost = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            verified: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!completeUpdatedPost) {
      return {
        success: false,
        error: appErrors.DATABASE_ERROR,
      };
    }

    const postWithDetails = mapPostToDetails(completeUpdatedPost);

    return {
      success: true,
      data: postWithDetails,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: appErrors.VALIDATION_ERROR,
      };
    }

    console.error("Error updating post:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

/**
 * Delete a post (only by author)
 */
export async function deletePost(
  postId: string
): Promise<ActionResponse<void>> {
  try {
    const { user: authUser } = await withAuth({ ensureSignedIn: true });

    // Check if user owns the post
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!existingPost) {
      return {
        success: false,
        error: appErrors.NOT_FOUND,
      };
    }

    if (existingPost.authorId !== authUser.id) {
      return {
        success: false,
        error: appErrors.UNAUTHORIZED,
      };
    }

    // Delete post (cascade will handle related data)
    await prisma.post.delete({
      where: { id: postId },
    });

    // Revalidate relevant paths
    revalidatePath("/feed");
    revalidatePath("/profile");
    revalidateTag(`user-posts-${authUser.id}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting post:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

/**
 * Like or unlike a post
 */
export async function toggleLike(
  postId: string
): Promise<ActionResponse<{ isLiked: boolean; likesCount: number }>> {
  try {
    const { user: authUser } = await withAuth({ ensureSignedIn: true });

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return {
        success: false,
        error: appErrors.NOT_FOUND,
      };
    }

    // Check if user already liked this post
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: authUser.id,
          postId,
        },
      },
    });

    let isLiked: boolean;

    if (existingLike) {
      // Unlike the post
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      isLiked = false;
    } else {
      // Like the post
      await prisma.like.create({
        data: {
          userId: authUser.id,
          postId,
        },
      });
      isLiked = true;
    }

    // Get updated likes count
    const likesCount = await prisma.like.count({
      where: { postId },
    });

    // Revalidate relevant paths
    revalidateTag(`post-${postId}`);
    revalidatePath("/feed");

    return {
      success: true,
      data: { isLiked, likesCount },
    };
  } catch (error) {
    console.error("Error toggling like:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

/**
 * Add a comment to a post
 */
export async function addComment(
  postId: string,
  input: CreateCommentInput
): Promise<ActionResponse<PostComment>> {
  try {
    const { user: authUser } = await withAuth({ ensureSignedIn: true });

    // Validate input
    const validatedData = commentSchema.parse(input);

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return {
        success: false,
        error: appErrors.NOT_FOUND,
      };
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        userId: authUser.id,
        postId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            verified: true,
          },
        },
      },
    });

    // Revalidate relevant paths
    revalidateTag(`post-${postId}`);
    revalidatePath("/feed");

    return {
      success: true,
      data: comment,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: appErrors.VALIDATION_ERROR,
      };
    }

    console.error("Error adding comment:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

/**
 * Get comments for a post
 */
export async function getPostComments(
  postId: string,
  limit: number = 20,
  offset: number = 0
): Promise<ActionResponse<PostComment[]>> {
  try {
    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            verified: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: limit,
      skip: offset,
    });

    return {
      success: true,
      data: comments,
    };
  } catch (error) {
    console.error("Error fetching comments:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

/**
 * Delete a comment (only by author)
 */
export async function deleteComment(
  commentId: string
): Promise<ActionResponse<void>> {
  try {
    const { user: authUser } = await withAuth({ ensureSignedIn: true });

    // Check if user owns the comment
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId: true, postId: true },
    });

    if (!existingComment) {
      return {
        success: false,
        error: appErrors.NOT_FOUND,
      };
    }

    if (existingComment.userId !== authUser.id) {
      return {
        success: false,
        error: appErrors.UNAUTHORIZED,
      };
    }

    // Delete comment
    await prisma.comment.delete({
      where: { id: commentId },
    });

    // Revalidate relevant paths
    revalidateTag(`post-${existingComment.postId}`);
    revalidatePath("/feed");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

/**
 * Increment share count for a post
 */
export async function sharePost(
  postId: string
): Promise<ActionResponse<{ sharesCount: number }>> {
  try {
    // Check if post exists and increment share count
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { sharesCount: { increment: 1 } },
      select: { sharesCount: true },
    });

    return {
      success: true,
      data: { sharesCount: updatedPost.sharesCount },
    };
  } catch (error) {
    console.error("Error sharing post:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

/**
 * Get posts by tag
 */
export async function getPostsByTag(
  tagName: string,
  limit: number = 20,
  offset: number = 0
): Promise<ActionResponse<PostWithDetails[]>> {
  try {
    let currentUserId: string | null = null;

    // Get current user if authenticated
    try {
      const { user: authUser } = await withAuth();
      currentUserId = authUser?.id || null;
    } catch {
      // Not authenticated
    }

    const posts = await prisma.post.findMany({
      where: {
        tags: {
          some: {
            tag: {
              name: tagName.toLowerCase(),
            },
          },
        },
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            verified: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        ...(currentUserId && {
          likes: {
            where: {
              userId: currentUserId,
            },
            select: {
              id: true,
            },
          },
        }),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    const postsWithDetails: PostWithDetails[] = posts.map(mapPostToDetails);

    return {
      success: true,
      data: postsWithDetails,
    };
  } catch (error) {
    console.error("Error fetching posts by tag:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

/**
 * Get popular tags
 */
export async function getPopularTags(
  limit: number = 10
): Promise<ActionResponse<{ name: string; count: number }[]>> {
  try {
    const tags = await prisma.tag.findMany({
      select: {
        name: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
      orderBy: {
        posts: {
          _count: "desc",
        },
      },
      take: limit,
    });

    const popularTags = tags.map((tag) => ({
      name: tag.name,
      count: tag._count.posts,
    }));

    return {
      success: true,
      data: popularTags,
    };
  } catch (error) {
    console.error("Error fetching popular tags:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

/**
 * Get posts by user ID
 */
export async function getPostsByUser(
  userId: string,
  limit: number = 10,
  offset: number = 0
): Promise<ActionResponse<PostWithDetails[]>> {
  try {
    const posts = await prisma.post.findMany({
      where: {
        authorId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            verified: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    const postsWithDetails: PostWithDetails[] = posts.map(mapPostToDetails);

    return {
      success: true,
      data: postsWithDetails,
    };
  } catch (error) {
    console.error("Error fetching posts by user:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

/**
 * Get posts by username (public)
 */
export async function getPostsByUsername(
  username: string,
  limit: number = 10,
  offset: number = 0,
  currentUserId?: string
): Promise<ActionResponse<PostWithDetails[]>> {
  try {
    const posts = await prisma.post.findMany({
      where: {
        author: {
          username: username,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            verified: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        likes: currentUserId
          ? {
              where: {
                userId: currentUserId,
              },
              select: {
                id: true,
              },
            }
          : false,
      },
    });

    const postsWithDetails: PostWithDetails[] = posts.map(mapPostToDetails);

    return {
      success: true,
      data: postsWithDetails,
    };
  } catch (error) {
    console.error("Error fetching posts by username:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

// Cursor rules applied correctly.
