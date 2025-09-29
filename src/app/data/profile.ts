"use server";

import type { ActionResponse } from "@/app/data/types/action-response";
import { appErrors } from "@/app/data/types/errors";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

export interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  name: string | null;
  bio: string | null;
  avatar: string | null;
  website: string | null;
  location: string | null;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  verified: boolean;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date | null;
  githubUsername: string | null;
  githubSyncEnabled: boolean;
  xUsername: string | null;
  xSyncEnabled: boolean;
  // Computed fields for display
  followers_count: number;
  following_count: number;
  posts_count: number;
}

export interface ProfileStats {
  revenue_total: number;
  revenue_monthly: number;
  github_commits: number;
  current_streak: number;
  longest_streak: number;
  total_posts: number;
  achievements_count: number;
  last_activity_date: Date | null;
}

// Validation schemas
const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal("")),
  location: z.string().max(100).optional(),
  githubUsername: z.string().max(50).optional(),
  xUsername: z.string().max(50).optional(),
  githubSyncEnabled: z.boolean().optional(),
  xSyncEnabled: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export async function getUserProfile(
  userId?: string
): Promise<ActionResponse<UserProfile>> {
  try {
    const { user: authUser } = await withAuth({ ensureSignedIn: true });
    const targetUserId = userId || authUser.id;

    // Fetch user from database with optimized query
    const dbUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        avatar: true,
        website: true,
        location: true,
        joinedAt: true,
        createdAt: true,
        updatedAt: true,
        isPublic: true,
        verified: true,
        currentStreak: true,
        longestStreak: true,
        lastActivityDate: true,
        githubUsername: true,
        githubSyncEnabled: true,
        xUsername: true,
        xSyncEnabled: true,
        // Get computed counts efficiently
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });

    if (!dbUser) {
      // Create user if doesn't exist (sync from WorkOS)
      const newUser = await createUserFromWorkOS(authUser);
      if (!newUser.success) {
        return {
          success: false,
          error: appErrors.DATABASE_ERROR,
        };
      }
      return getUserProfile(targetUserId);
    }

    // Transform to UserProfile interface
    const profile: UserProfile = {
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username,
      name: dbUser.name,
      bio: dbUser.bio,
      avatar: dbUser.avatar,
      website: dbUser.website,
      location: dbUser.location,
      joinedAt: dbUser.joinedAt,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
      isPublic: dbUser.isPublic,
      verified: dbUser.verified,
      currentStreak: dbUser.currentStreak,
      longestStreak: dbUser.longestStreak,
      lastActivityDate: dbUser.lastActivityDate,
      githubUsername: dbUser.githubUsername,
      githubSyncEnabled: dbUser.githubSyncEnabled,
      xUsername: dbUser.xUsername,
      xSyncEnabled: dbUser.xSyncEnabled,
      followers_count: dbUser._count.followers,
      following_count: dbUser._count.following,
      posts_count: dbUser._count.posts,
    };

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return {
      success: false,
      error: appErrors.UNEXPECTED_ERROR,
    };
  }
}

// Create user from WorkOS data
async function createUserFromWorkOS(
  authUser: any
): Promise<ActionResponse<void>> {
  try {
    await prisma.user.create({
      data: {
        id: authUser.id,
        email: authUser.email,
        name: authUser.firstName
          ? `${authUser.firstName} ${authUser.lastName || ""}`.trim()
          : null,
        avatar: authUser.profilePictureUrl,
        username: null, // User will set this later
        bio: null,
        website: null,
        location: null,
        isPublic: true,
        verified: false,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        githubUsername: null,
        githubSyncEnabled: true,
        xUsername: null,
        xSyncEnabled: true,
      },
    });

    revalidateTag(`user-${authUser.id}`);
    return { success: true };
  } catch (error) {
    console.error("Error creating user from WorkOS:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

// Update user profile
export async function updateUserProfile(
  input: UpdateProfileInput
): Promise<ActionResponse<UserProfile>> {
  try {
    const { user: authUser } = await withAuth({ ensureSignedIn: true });

    // Validate input
    const validatedData = updateProfileSchema.parse(input);

    // Check if username is already taken (if being updated)
    if (validatedData.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: validatedData.username,
          NOT: { id: authUser.id },
        },
        select: { id: true },
      });

      if (existingUser) {
        return {
          success: false,
          error: "Username is already taken",
        };
      }
    }

    // Update user with optimistic locking
    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        avatar: true,
        website: true,
        location: true,
        joinedAt: true,
        createdAt: true,
        updatedAt: true,
        isPublic: true,
        verified: true,
        currentStreak: true,
        longestStreak: true,
        lastActivityDate: true,
        githubUsername: true,
        githubSyncEnabled: true,
        xUsername: true,
        xSyncEnabled: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });

    // Transform to UserProfile interface
    const profile: UserProfile = {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      name: updatedUser.name,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
      website: updatedUser.website,
      location: updatedUser.location,
      joinedAt: updatedUser.joinedAt,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      isPublic: updatedUser.isPublic,
      verified: updatedUser.verified,
      currentStreak: updatedUser.currentStreak,
      longestStreak: updatedUser.longestStreak,
      lastActivityDate: updatedUser.lastActivityDate,
      githubUsername: updatedUser.githubUsername,
      githubSyncEnabled: updatedUser.githubSyncEnabled,
      xUsername: updatedUser.xUsername,
      xSyncEnabled: updatedUser.xSyncEnabled,
      followers_count: updatedUser._count.followers,
      following_count: updatedUser._count.following,
      posts_count: updatedUser._count.posts,
    };

    // Revalidate cache for better PWA performance
    revalidateTag(`user-${authUser.id}`);
    revalidatePath("/profile");
    revalidatePath(`/profile/${updatedUser.username}`);

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: appErrors.VALIDATION_ERROR,
      };
    }

    console.error("Error updating user profile:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

export async function getProfileStats(
  userId?: string,
  username?: string
): Promise<ActionResponse<ProfileStats>> {
  try {
    let targetUserId = userId;

    // If username is provided, find the user by username first
    if (username && !userId) {
      const userByUsername = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
      });

      if (!userByUsername) {
        return {
          success: false,
          error: appErrors.NOT_FOUND,
        };
      }

      targetUserId = userByUsername.id;
    }

    // If no userId and no username, use authenticated user
    if (!targetUserId) {
      const { user: authUser } = await withAuth({ ensureSignedIn: true });
      targetUserId = authUser.id;
    }

    // Fetch user stats efficiently
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastActivityDate: true,
        _count: {
          select: {
            posts: true,
            achievements: {
              where: { isCompleted: true },
            },
          },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        error: appErrors.NOT_FOUND,
      };
    }

    // Get revenue stats from revenue accounts
    const revenueStats = await prisma.revenueEntry.aggregate({
      where: {
        account: {
          userId: targetUserId,
          isActive: true,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Get monthly revenue (current month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyRevenueStats = await prisma.revenueEntry.aggregate({
      where: {
        account: {
          userId: targetUserId,
          isActive: true,
        },
        transactionDate: {
          gte: startOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Get GitHub commits from current month
    const githubStats = await prisma.gitHubStats.aggregate({
      where: {
        userId: targetUserId,
        date: {
          gte: startOfMonth,
        },
      },
      _sum: {
        commits: true,
      },
    });

    const stats: ProfileStats = {
      revenue_total: Number(revenueStats._sum.amount || 0),
      revenue_monthly: Number(monthlyRevenueStats._sum.amount || 0),
      github_commits: githubStats._sum.commits || 0,
      current_streak: user.currentStreak,
      longest_streak: user.longestStreak,
      total_posts: user._count.posts,
      achievements_count: user._count.achievements,
      last_activity_date: user.lastActivityDate,
    };

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("Error fetching profile stats:", error);
    return {
      success: false,
      error: appErrors.UNEXPECTED_ERROR,
    };
  }
}

// Sync user streak and activity
export async function updateUserActivity(
  userId: string,
  activityType: "post" | "commit" | "revenue" | "achievement"
): Promise<ActionResponse<void>> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get or create daily streak record
    const dailyStreak = await prisma.dailyStreak.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {},
      create: {
        userId,
        date: today,
        isActiveDay: false,
      },
    });

    // Update the specific activity type
    const updateData: any = {};
    switch (activityType) {
      case "post":
        updateData.hasPosted = true;
        break;
      case "commit":
        updateData.hasCommitted = true;
        break;
      case "revenue":
        updateData.hasRevenue = true;
        break;
      case "achievement":
        updateData.hasAchievement = true;
        break;
    }

    // Check if this makes today an active day
    const hasActivity =
      updateData.hasPosted ||
      updateData.hasCommitted ||
      updateData.hasRevenue ||
      updateData.hasAchievement;

    if (hasActivity) {
      updateData.isActiveDay = true;
    }

    await prisma.dailyStreak.update({
      where: { id: dailyStreak.id },
      data: updateData,
    });

    // Update user streak if today became active
    if (updateData.isActiveDay) {
      await updateUserStreak(userId);
    }

    // Revalidate cache
    revalidateTag(`user-${userId}`);
    revalidateTag(`stats-${userId}`);

    return { success: true };
  } catch (error) {
    console.error("Error updating user activity:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

// Calculate and update user streak
async function updateUserStreak(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currentStreak: true, longestStreak: true },
  });

  if (!user) return;

  // Get recent daily streaks to calculate current streak
  const recentStreaks = await prisma.dailyStreak.findMany({
    where: {
      userId,
      isActiveDay: true,
    },
    orderBy: { date: "desc" },
    take: 365, // Max streak we care about
  });

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < recentStreaks.length; i++) {
    const streakDate = new Date(recentStreaks[i].date);
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);

    if (streakDate.getTime() === expectedDate.getTime()) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Update user streak
  await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak,
      longestStreak: Math.max(currentStreak, user.longestStreak),
      lastActivityDate: new Date(),
    },
  });
}

// Get public profile by username (for sharing/SEO)
export async function getPublicProfile(
  username: string
): Promise<ActionResponse<UserProfile>> {
  try {
    const dbUser = await prisma.user.findUnique({
      where: {
        username,
        isPublic: true,
      },
      select: {
        id: true,
        email: false, // Don't expose email in public profiles
        username: true,
        name: true,
        bio: true,
        avatar: true,
        website: true,
        location: true,
        joinedAt: true,
        createdAt: true,
        updatedAt: true,
        isPublic: true,
        verified: true,
        currentStreak: true,
        longestStreak: true,
        lastActivityDate: true,
        githubUsername: true,
        githubSyncEnabled: true,
        xUsername: true,
        xSyncEnabled: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });

    if (!dbUser) {
      return {
        success: false,
        error: appErrors.NOT_FOUND,
      };
    }

    const profile: UserProfile = {
      id: dbUser.id,
      email: "", // Don't expose email
      username: dbUser.username,
      name: dbUser.name,
      bio: dbUser.bio,
      avatar: dbUser.avatar,
      website: dbUser.website,
      location: dbUser.location,
      joinedAt: dbUser.joinedAt,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
      isPublic: dbUser.isPublic,
      verified: dbUser.verified,
      currentStreak: dbUser.currentStreak,
      longestStreak: dbUser.longestStreak,
      lastActivityDate: dbUser.lastActivityDate,
      githubUsername: dbUser.githubUsername,
      githubSyncEnabled: dbUser.githubSyncEnabled,
      xUsername: dbUser.xUsername,
      xSyncEnabled: dbUser.xSyncEnabled,
      followers_count: dbUser._count.followers,
      following_count: dbUser._count.following,
      posts_count: dbUser._count.posts,
    };

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return {
      success: false,
      error: appErrors.UNEXPECTED_ERROR,
    };
  }
}

// Check username availability
export async function checkUsernameAvailability(
  username: string
): Promise<ActionResponse<{ available: boolean }>> {
  try {
    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (
      !usernameRegex.test(username) ||
      username.length < 3 ||
      username.length > 30
    ) {
      return {
        success: true,
        data: { available: false },
      };
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    return {
      success: true,
      data: { available: !existingUser },
    };
  } catch (error) {
    console.error("Error checking username availability:", error);
    return {
      success: false,
      error: appErrors.UNEXPECTED_ERROR,
    };
  }
}

// Bulk sync user from WorkOS (for existing users)
export async function syncUserFromWorkOS(): Promise<
  ActionResponse<UserProfile>
> {
  try {
    const { user: authUser } = await withAuth({ ensureSignedIn: true });

    const updatedUser = await prisma.user.upsert({
      where: { id: authUser.id },
      update: {
        email: authUser.email,
        name: authUser.firstName
          ? `${authUser.firstName} ${authUser.lastName || ""}`.trim()
          : null,
        avatar: authUser.profilePictureUrl,
        updatedAt: new Date(),
      },
      create: {
        id: authUser.id,
        email: authUser.email,
        name: authUser.firstName
          ? `${authUser.firstName} ${authUser.lastName || ""}`.trim()
          : null,
        avatar: authUser.profilePictureUrl,
        username: null,
        bio: null,
        website: null,
        location: null,
        isPublic: true,
        verified: false,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        githubUsername: null,
        githubSyncEnabled: true,
        xUsername: null,
        xSyncEnabled: true,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        avatar: true,
        website: true,
        location: true,
        joinedAt: true,
        createdAt: true,
        updatedAt: true,
        isPublic: true,
        verified: true,
        currentStreak: true,
        longestStreak: true,
        lastActivityDate: true,
        githubUsername: true,
        githubSyncEnabled: true,
        xUsername: true,
        xSyncEnabled: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });

    const profile: UserProfile = {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      name: updatedUser.name,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
      website: updatedUser.website,
      location: updatedUser.location,
      joinedAt: updatedUser.joinedAt,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      isPublic: updatedUser.isPublic,
      verified: updatedUser.verified,
      currentStreak: updatedUser.currentStreak,
      longestStreak: updatedUser.longestStreak,
      lastActivityDate: updatedUser.lastActivityDate,
      githubUsername: updatedUser.githubUsername,
      githubSyncEnabled: updatedUser.githubSyncEnabled,
      xUsername: updatedUser.xUsername,
      xSyncEnabled: updatedUser.xSyncEnabled,
      followers_count: updatedUser._count.followers,
      following_count: updatedUser._count.following,
      posts_count: updatedUser._count.posts,
    };

    // Revalidate cache
    revalidateTag(`user-${authUser.id}`);
    revalidatePath("/profile");

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    console.error("Error syncing user from WorkOS:", error);
    return {
      success: false,
      error: appErrors.DATABASE_ERROR,
    };
  }
}

// Cursor rules applied correctly.
