"use client";

import { useState, useTransition } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  DollarSign,
  GitCommit,
  Trophy,
  Flame,
  Target,
  MessageSquare,
  ExternalLink,
  Loader2,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PostType } from "@prisma/client";
import {
  toggleLike,
  sharePost,
  deletePost,
  type PostWithDetails,
} from "@/app/data/posts";
import { PostComments } from "./post-comments";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { IconRosetteDiscountCheck } from "@tabler/icons-react";

// Post type configurations
const postTypeConfig = {
  [PostType.COMMITMENT]: {
    icon: Target,
    label: "Commitment",
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-950",
  },
  [PostType.PROGRESS]: {
    icon: Flame,
    label: "Progress",
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950",
  },
  [PostType.COMPLETION]: {
    icon: Trophy,
    label: "Completed",
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950",
  },
  [PostType.FAILURE]: {
    icon: X,
    label: "Failed",
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900",
  },
};

interface PostCardProps {
  post: PostWithDetails;
  onUpdate?: (post: PostWithDetails) => void;
  onDelete?: (postId: string) => void;
  className?: string;
}

export function PostCard({
  post,
  onUpdate,
  onDelete,
  className,
}: PostCardProps) {
  const { user } = useAuth();
  const [isLiking, startLikeTransition] = useTransition();
  const [isSharing, startShareTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [localLikeState, setLocalLikeState] = useState({
    isLiked: post.isLiked || false,
    likesCount: post._count.likes,
  });

  const config = postTypeConfig[post.type];
  const IconComponent = config.icon;

  // Format currency for revenue posts
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Handle like toggle
  const handleLike = () => {
    if (!user) {
      toast.error("Please sign in to like posts");
      return;
    }

    // Optimistic update
    setLocalLikeState((prev) => ({
      isLiked: !prev.isLiked,
      likesCount: prev.isLiked ? prev.likesCount - 1 : prev.likesCount + 1,
    }));

    startLikeTransition(async () => {
      try {
        const response = await toggleLike(post.id);

        if (response.success && response.data) {
          setLocalLikeState({
            isLiked: response.data.isLiked,
            likesCount: response.data.likesCount,
          });

          // Update parent component if callback provided
          onUpdate?.({
            ...post,
            isLiked: response.data.isLiked,
            _count: { ...post._count, likes: response.data.likesCount },
          });
        } else {
          // Revert optimistic update on error
          setLocalLikeState({
            isLiked: post.isLiked || false,
            likesCount: post._count.likes,
          });
          toast.error(response.error || "Failed to update like");
        }
      } catch (error) {
        // Revert optimistic update on error
        setLocalLikeState({
          isLiked: post.isLiked || false,
          likesCount: post._count.likes,
        });
        console.error("Error toggling like:", error);
        toast.error("Something went wrong");
      }
    });
  };

  // Handle share
  const handleShare = () => {
    startShareTransition(async () => {
      try {
        const response = await sharePost(post.id);

        if (response.success) {
          // Copy link to clipboard
          const shareUrl = `${window.location.origin}/post/${post.id}`;
          await navigator.clipboard.writeText(shareUrl);
          toast.success("Link copied to clipboard!");
        } else {
          toast.error("Failed to share post");
        }
      } catch (error) {
        console.error("Error sharing post:", error);
        toast.error("Something went wrong");
      }
    });
  };

  // Handle delete
  const handleDelete = () => {
    startDeleteTransition(async () => {
      try {
        const response = await deletePost(post.id);

        if (response.success) {
          toast.success("Post deleted successfully");
          onDelete?.(post.id);
        } else {
          toast.error(response.error || "Failed to delete post");
        }
      } catch (error) {
        console.error("Error deleting post:", error);
        toast.error("Something went wrong");
      }
    });
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Link href={`/${post.author.username}`}>
            <Avatar className="size-10 border-2 border-background cursor-pointer">
              <AvatarImage
                src={post.author.avatar || undefined}
                alt={post.author.name || "User"}
              />
              <AvatarFallback>
                {post.author.name
                  ? post.author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                  : "U"}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/${post.author.username}`}
                className="hover:underline"
              >
                <span className="font-medium text-foreground">
                  {post.author.name || "Unknown User"}
                </span>
              </Link>
              {post.author.verified && (
                <Tooltip>
                  <TooltipTrigger>
                    <IconRosetteDiscountCheck className="size-4 fill-blue-500 text-white" />
                  </TooltipTrigger>
                  <TooltipContent>Verified</TooltipContent>
                </Tooltip>
              )}
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                {(() => {
                  const diffMs =
                    Date.now() - new Date(post.createdAt).getTime();
                  const diffSec = Math.floor(diffMs / 1000);
                  const diffMin = Math.floor(diffSec / 60);
                  const diffHr = Math.floor(diffMin / 60);
                  const diffDay = Math.floor(diffHr / 24);

                  if (diffDay >= 1) {
                    return `${diffDay}d`;
                  }
                  if (diffHr >= 1) {
                    return `${diffHr}h`;
                  }
                  return `${diffMin}m`;
                })()}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <div
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${config.bgColor}`}
              >
                <IconComponent className={`size-3 ${config.color}`} />
                <span className={config.color}>{config.label}</span>
              </div>
              {post.author.username && (
                <span className="text-xs text-muted-foreground">
                  @{post.author.username}
                </span>
              )}
            </div>
          </div>

          {/* Post actions menu (only for post author) */}
          {user?.id === post.author.id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-8 p-0 text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="size-4 mr-2" />
                  Delete Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content */}
        <Link
          href={`/post/${post.id}`}
          className="block space-y-3 hover:bg-muted/30 rounded-lg -mx-2 px-2 py-1 transition-colors"
        >
          <p className="text-foreground whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>

          {/* Commitment-specific content */}
          {post.type === PostType.COMMITMENT && (
            <div className="space-y-4">
              {/* Goal */}
              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="size-5 text-red-500" />
                  <span className="font-semibold text-red-700 dark:text-red-300">
                    Goal
                  </span>
                </div>
                <p className="text-red-800 dark:text-red-200 font-medium">
                  {post.goal}
                </p>
              </div>

              {/* Deadline and Stake */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Deadline */}
                {post.deadline && (
                  <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <Calendar className="size-4 text-orange-500" />
                    <div>
                      <p className="text-xs text-orange-600 dark:text-orange-400">
                        Deadline
                      </p>
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                        {new Date(post.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Stake */}
                {post.stakeAmount && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <AlertTriangle className="size-4 text-yellow-500" />
                    <div>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">
                        Stake
                      </p>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        {formatCurrency(
                          post.stakeAmount,
                          post.stakeCurrency || "USD"
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Stake Details */}
              {post.stakeDescription && (
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    If I fail:
                  </p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {post.stakeDescription}
                  </p>
                  {post.stakeRecipient && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Stake recipient: {post.stakeRecipient}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Progress Update */}
          {post.type === PostType.PROGRESS && (
            <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="size-5 text-orange-500" />
                <span className="font-semibold text-orange-700 dark:text-orange-300">
                  Progress Update
                </span>
              </div>
              {post.progressPercentage !== undefined && (
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-orange-600 dark:text-orange-400">
                      Progress
                    </span>
                    <span className="text-orange-800 dark:text-orange-200 font-medium">
                      {post.progressPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-orange-200 dark:bg-orange-800 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${post.progressPercentage}%` }}
                    />
                  </div>
                </div>
              )}
              {post.progressNotes && (
                <p className="text-orange-800 dark:text-orange-200 text-sm">
                  {post.progressNotes}
                </p>
              )}
            </div>
          )}

          {/* Completion */}
          {post.type === PostType.COMPLETION && (
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="size-5 text-green-500" />
                <span className="font-semibold text-green-700 dark:text-green-300">
                  Commitment Completed!
                </span>
              </div>
              <p className="text-green-800 dark:text-green-200 text-sm">
                🎉 Congratulations on achieving your goal!
              </p>
            </div>
          )}

          {/* Failure */}
          {post.type === PostType.FAILURE && (
            <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="size-5 text-red-500" />
                <span className="font-semibold text-red-700 dark:text-red-300">
                  Commitment Failed
                </span>
              </div>
              <p className="text-red-800 dark:text-red-200 text-sm">
                The stake has been activated. Better luck next time!
              </p>
            </div>
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag.tag.id}
                  className="inline-flex items-center px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full"
                >
                  #{tag.tag.name}
                </span>
              ))}
            </div>
          )}
        </Link>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-4">
            {/* Like Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLiking}
              className={cn(
                "flex items-center gap-2 text-muted-foreground hover:text-red-500",
                localLikeState.isLiked && "text-red-500"
              )}
            >
              {isLiking ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Heart
                  className={cn(
                    "size-4",
                    localLikeState.isLiked && "fill-current"
                  )}
                />
              )}
              <span className="text-sm">{localLikeState.likesCount}</span>
            </Button>

            {/* Comment Button */}
            <PostComments post={post} onUpdate={onUpdate}>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-muted-foreground hover:text-blue-500"
              >
                <MessageCircle className="size-4" />
                <span className="text-sm">{post._count.comments}</span>
              </Button>
            </PostComments>

            {/* Share Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              disabled={isSharing}
              className="flex items-center gap-2 text-muted-foreground hover:text-green-500"
            >
              {isSharing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Share2 className="size-4" />
              )}
              <span className="text-sm">{post.sharesCount}</span>
            </Button>
          </div>

          {/* Views */}
          <div className="text-xs text-muted-foreground">
            {post.viewsCount} views
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be
              undone and will permanently remove the post along with all its
              comments and likes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="size-4 mr-2" />
                  Delete Post
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Cursor rules applied correctly.
