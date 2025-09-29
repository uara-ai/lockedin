"use client";

import { useState, useEffect, useTransition } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Loader2,
  Trash2,
  MoreHorizontal,
  MessageCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import {
  addComment,
  getPostComments,
  deleteComment,
  type PostComment,
  type PostWithDetails,
} from "@/app/data/posts";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { IconRosetteDiscountCheck } from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostCommentsInlineProps {
  post: PostWithDetails;
  onUpdate?: (post: PostWithDetails) => void;
}

export function PostCommentsInline({
  post,
  onUpdate,
}: PostCommentsInlineProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [isDeletingComment, setIsDeletingComment] = useState<string | null>(
    null
  );

  // Load comments on mount
  useEffect(() => {
    const loadComments = async () => {
      setIsLoading(true);
      try {
        const response = await getPostComments(post.id);
        if (response.success && response.data) {
          setComments(response.data);
        } else {
          toast.error("Failed to load comments");
        }
      } catch (error) {
        console.error("Error loading comments:", error);
        toast.error("Something went wrong loading comments");
      } finally {
        setIsLoading(false);
      }
    };

    loadComments();
  }, [post.id]);

  // Handle comment submission
  const handleSubmitComment = () => {
    if (!user) {
      toast.error("Please sign in to comment");
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    startSubmitTransition(async () => {
      try {
        const response = await addComment(post.id, {
          content: newComment.trim(),
        });

        if (response.success && response.data) {
          setComments((prev) => [...prev, response.data!]);
          setNewComment("");
          toast.success("Comment added!");

          // Update parent component with new comment count
          onUpdate?.({
            ...post,
            _count: { ...post._count, comments: post._count.comments + 1 },
          });
        } else {
          toast.error(response.error || "Failed to add comment");
        }
      } catch (error) {
        console.error("Error adding comment:", error);
        toast.error("Something went wrong");
      }
    });
  };

  // Handle comment deletion
  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;

    setIsDeletingComment(commentId);
    try {
      const response = await deleteComment(commentId);

      if (response.success) {
        setComments((prev) =>
          prev.filter((comment) => comment.id !== commentId)
        );
        toast.success("Comment deleted");

        // Update parent component with new comment count
        onUpdate?.({
          ...post,
          _count: { ...post._count, comments: post._count.comments - 1 },
        });
      } else {
        toast.error("Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Something went wrong");
    } finally {
      setIsDeletingComment(null);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  return (
    <div className="space-y-6">
      {/* Comment Input */}
      {user ? (
        <div className="space-y-4">
          <div className="flex gap-3">
            <Avatar className="size-10">
              <AvatarImage
                src={user.profilePictureUrl || undefined}
                alt={user.firstName || "User"}
              />
              <AvatarFallback>
                {user.firstName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Write a comment..."
                className="min-h-[100px] resize-none"
                disabled={isSubmitting}
              />

              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  Press Enter to send, Shift+Enter for new line
                </span>

                <Button
                  onClick={handleSubmitComment}
                  disabled={isSubmitting || !newComment.trim()}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  Comment
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-6 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Sign in to join the conversation
          </p>
          <Button asChild size="sm">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="size-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Link href={`/${comment.user.username}`}>
                <Avatar className="size-10 cursor-pointer">
                  <AvatarImage
                    src={comment.user.avatar || undefined}
                    alt={comment.user.name || "User"}
                  />
                  <AvatarFallback>
                    {comment.user.name
                      ? comment.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      : "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>

              <div className="flex-1 space-y-2">
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Link
                      href={`/${comment.user.username}`}
                      className="hover:underline"
                    >
                      <span className="text-sm font-medium">
                        {comment.user.name || "Unknown User"}
                      </span>
                    </Link>
                    {comment.user.verified && (
                      <IconRosetteDiscountCheck className="size-3 fill-blue-500" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                      })}
                    </span>

                    {/* Comment actions for author */}
                    {user?.id === comment.user.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-6 p-0 ml-auto"
                          >
                            <MoreHorizontal className="size-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={isDeletingComment === comment.id}
                            className="text-red-600 focus:text-red-600"
                          >
                            {isDeletingComment === comment.id ? (
                              <Loader2 className="size-4 animate-spin mr-2" />
                            ) : (
                              <Trash2 className="size-4 mr-2" />
                            )}
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Cursor rules applied correctly.
