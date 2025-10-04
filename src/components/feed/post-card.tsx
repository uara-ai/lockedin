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
  AtSign,
  Hash,
  Command,
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

// Currency symbols to highlight
const CURRENCY_SYMBOLS = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CAD",
  "AUD",
  "CHF",
  "CNY",
  "INR",
  "BRL",
  "MXN",
  "KRW",
  "SGD",
  "HKD",
  "NZD",
  "SEK",
  "NOK",
  "DKK",
  "PLN",
  "CZK",
  "HUF",
  "RUB",
  "TRY",
  "ZAR",
  "BGN",
  "RON",
  "HRK",
  "ISK",
  "UAH",
  "PHP",
  "THB",
  "MYR",
  "IDR",
  "VND",
  "TWD",
  "AED",
  "SAR",
  "QAR",
  "KWD",
  "BHD",
  "OMR",
  "JOD",
  "LBP",
  "EGP",
  "MAD",
  "TND",
  "DZD",
  "LYD",
  "ETB",
  "KES",
  "UGX",
  "TZS",
  "ZMW",
  "BWP",
  "NAD",
  "SZL",
  "LSL",
  "MUR",
  "SCR",
  "MVR",
  "NPR",
  "PKR",
  "BDT",
  "LSL",
  "AFN",
  "IRR",
  "IQD",
  "KZT",
  "UZS",
  "KGS",
  "TJS",
  "TMT",
  "AZN",
  "GEL",
  "AMD",
  "BYN",
  "MDL",
  "UAH",
  "BGN",
  "RSD",
  "MKD",
  "ALL",
  "BAM",
  "MNT",
  "KHR",
  "LAK",
  "MMK",
  "BTN",
  "NPR",
  "PKR",
  "BDT",
  "LSL",
  "AFN",
  "IRR",
  "IQD",
  "KZT",
  "UZS",
  "KGS",
  "TJS",
  "TMT",
  "AZN",
  "GEL",
  "AMD",
  "BYN",
  "MDL",
  "UAH",
  "BGN",
  "RSD",
  "MKD",
  "ALL",
  "BAM",
  "MNT",
  "KHR",
  "LAK",
  "MMK",
  "BTN",
];

// Text highlighting component for currencies, mentions, and hashtags
function HighlightedText({ text }: { text: string }) {
  const parts = [];
  let lastIndex = 0;

  // Regex to match currencies, @mentions, and #hashtags
  const regex =
    /(\$[A-Z]{3}|\b[A-Z]{3}\b|@\w+|#\w+|\$[0-9]+(?:,[0-9]{3})*(?:\.[0-9]{2})?|\€[0-9]+(?:,[0-9]{3})*(?:\.[0-9]{2})?|\$|\€)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {text.slice(lastIndex, match.index)}
        </span>
      );
    }

    // Add the highlighted match
    const matchText = match[0];
    const isCurrency = CURRENCY_SYMBOLS.includes(matchText.replace("$", ""));
    const isMention = matchText.startsWith("@");
    const isHashtag = matchText.startsWith("#");
    const isCurrencySymbol = matchText === "$" || matchText === "€";
    const isCurrencyAmount =
      /^\$[0-9]+(?:,[0-9]{3})*(?:\.[0-9]{2})?$/.test(matchText) ||
      /^\€[0-9]+(?:,[0-9]{3})*(?:\.[0-9]{2})?$/.test(matchText);

    parts.push(
      <span
        key={`highlight-${match.index}`}
        className={cn(
          "font-bold text-primary",
          (isCurrency ||
            isMention ||
            isHashtag ||
            isCurrencySymbol ||
            isCurrencyAmount) &&
            "bg-primary/10 px-1 rounded"
        )}
      >
        {matchText}
      </span>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>);
  }

  return <>{parts}</>;
}

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
      {/* Clean Post Card */}
      <div className="bg-background border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Link href={`/${post.author.username}`}>
              <Avatar className="size-6 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
                <AvatarImage
                  src={post.author.avatar || undefined}
                  alt={post.author.name || "User"}
                />
                <AvatarFallback className="text-xs font-semibold">
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

            <div className="flex items-center gap-2">
              <Link
                href={`/${post.author.username}`}
                className="hover:underline"
              >
                <span className="font-semibold text-sm text-foreground">
                  {post.author.name || "Unknown User"}
                </span>
              </Link>
              {post.author.verified && (
                <IconRosetteDiscountCheck className="size-3 fill-blue-500 text-white" />
              )}
              <span className="text-muted-foreground text-xs">•</span>
              <span className="text-xs text-muted-foreground">
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
          </div>

          {/* Post actions menu (only for post author) */}
          {user?.id === post.author.id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-6 p-0 text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal className="size-3" />
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
          className="block p-4 hover:bg-muted/20 transition-colors"
        >
          <div className="text-sm leading-relaxed">
            <HighlightedText text={post.content} />
          </div>
        </Link>

        {/* Actions */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border/50">
          <div className="flex items-center gap-4">
            {/* Like Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLiking}
              className={cn(
                "flex items-center gap-1 text-muted-foreground hover:text-red-500 h-7 px-2",
                localLikeState.isLiked && "text-red-500"
              )}
            >
              {isLiking ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Heart
                  className={cn(
                    "size-3",
                    localLikeState.isLiked && "fill-current"
                  )}
                />
              )}
              <span className="text-xs">{localLikeState.likesCount}</span>
            </Button>

            {/* Comment Button */}
            <PostComments post={post} onUpdate={onUpdate}>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-muted-foreground hover:text-blue-500 h-7 px-2"
              >
                <MessageCircle className="size-3" />
                <span className="text-xs">{post._count.comments}</span>
              </Button>
            </PostComments>

            {/* Share Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              disabled={isSharing}
              className="flex items-center gap-1 text-muted-foreground hover:text-green-500 h-7 px-2"
            >
              {isSharing ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Share2 className="size-3" />
              )}
              <span className="text-xs">{post.sharesCount}</span>
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
