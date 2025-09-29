"use client";

import { useState, useTransition } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  MessageCircle,
  Send,
  Loader2,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";
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

interface PostCommentsProps {
  post: PostWithDetails;
  onUpdate?: (post: PostWithDetails) => void;
  children: React.ReactNode;
}

export function PostComments({ post, onUpdate, children }: PostCommentsProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [isDeletingComment, setIsDeletingComment] = useState<string | null>(
    null
  );

  // Load comments when modal opens
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

  // Handle modal open
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && comments.length === 0) {
      loadComments();
    }
  };

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
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MessageCircle className="size-5" />
            Comments ({post._count.comments})
          </SheetTitle>
          <SheetDescription>
            Join the conversation about this post
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full mb-6 mt-6 mx-4">
          {/* Comments List */}
          <ScrollArea className="flex-1 pr-4">
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
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Link href={`/${comment.user.username}`}>
                      <Avatar className="size-8 cursor-pointer">
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

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
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
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Comment Input */}
          {user ? (
            <div className="border-t pt-4 mt-4">
              <div className="flex gap-3">
                <Avatar className="size-8">
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
                    className="min-h-[80px] resize-none"
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
            <div className="border-t pt-4 mt-4 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Sign in to join the conversation
              </p>
              <Button asChild size="sm">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Cursor rules applied correctly.
