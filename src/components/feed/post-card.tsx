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
  [PostType.UPDATE]: {
    icon: MessageSquare,
    label: "Update",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950",
  },
  [PostType.REVENUE]: {
    icon: DollarSign,
    label: "Revenue",
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950",
  },
  [PostType.ACHIEVEMENT]: {
    icon: Trophy,
    label: "Achievement",
    color: "text-yellow-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-950",
  },
  [PostType.STREAK]: {
    icon: Flame,
    label: "Streak",
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950",
  },
  [PostType.GITHUB]: {
    icon: GitCommit,
    label: "Code",
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950",
  },
  [PostType.MILESTONE]: {
    icon: Target,
    label: "Milestone",
    color: "text-indigo-500",
    bgColor: "bg-indigo-50 dark:bg-indigo-950",
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

          {/* Type-specific content */}
          {post.type === PostType.REVENUE && post.revenueAmount && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <DollarSign className="size-5 text-green-500" />
              <span className="font-semibold text-green-700 dark:text-green-300">
                {formatCurrency(post.revenueAmount, post.currency || "USD")}{" "}
                revenue milestone
              </span>
            </div>
          )}

          {post.type === PostType.GITHUB && (
            <div className="space-y-2">
              {post.commitsCount && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <GitCommit className="size-4" />
                  <span>{post.commitsCount} commits</span>
                </div>
              )}
              {post.repoUrl && (
                <Link
                  href={post.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-500 hover:underline"
                >
                  <ExternalLink className="size-4" />
                  View Repository
                </Link>
              )}
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
