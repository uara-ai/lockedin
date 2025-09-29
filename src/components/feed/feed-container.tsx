"use client";

import { useState, useEffect, useCallback } from "react";
import { PostCard } from "./post-card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { getPosts, type PostWithDetails } from "@/app/data/posts";
import { toast } from "sonner";

interface FeedContainerProps {
  initialPosts?: PostWithDetails[];
  onPostUpdate?: (post: PostWithDetails) => void;
  onPostDelete?: (postId: string) => void;
  className?: string;
}

export function FeedContainer({
  initialPosts = [],
  onPostUpdate,
  onPostDelete,
  className,
}: FeedContainerProps) {
  const [posts, setPosts] = useState<PostWithDetails[]>(initialPosts);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Load more posts
  const loadMorePosts = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getPosts(10, posts.length);

      if (response.success && response.data) {
        if (response.data.length === 0) {
          setHasMore(false);
        } else {
          setPosts((prev) => [...prev, ...response.data!]);
        }
      } else {
        setError(response.error || "Failed to load posts");
        toast.error("Failed to load more posts");
      }
    } catch (error) {
      console.error("Error loading posts:", error);
      setError("Something went wrong while loading posts");
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, posts.length]);

  // Refresh posts
  const refreshPosts = async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      const response = await getPosts(20, 0);

      if (response.success && response.data) {
        setPosts(response.data);
        setHasMore(response.data.length === 20);
        toast.success("Feed refreshed!");
      } else {
        setError(response.error || "Failed to refresh posts");
        toast.error("Failed to refresh feed");
      }
    } catch (error) {
      console.error("Error refreshing posts:", error);
      setError("Something went wrong while refreshing");
      toast.error("Something went wrong");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle post updates (likes, etc.)
  const handlePostUpdate = (updatedPost: PostWithDetails) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === updatedPost.id ? updatedPost : post))
    );
    onPostUpdate?.(updatedPost);
  };

  const handlePostDelete = (postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
    onPostDelete?.(postId);
  };

  // Load initial posts if none provided
  useEffect(() => {
    if (initialPosts.length === 0) {
      loadMorePosts();
    }
  }, [initialPosts.length, loadMorePosts]);

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Feed Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Recent Posts</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshPosts}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-lg">
          <AlertCircle className="size-5" />
          <span>{error}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setError(null);
              loadMorePosts();
            }}
            className="ml-auto"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onUpdate={handlePostUpdate}
            onDelete={handlePostDelete}
          />
        ))}
      </div>

      {/* Empty State */}
      {posts.length === 0 && !isLoading && !error && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <AlertCircle className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No posts yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Be the first to share your journey and inspire others!
          </p>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && posts.length > 0 && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={loadMorePosts}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Loading more posts...
              </>
            ) : (
              "Load more posts"
            )}
          </Button>
        </div>
      )}

      {/* End of Feed */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">You&apos;ve reached the end of the feed!</p>
        </div>
      )}
    </div>
  );
}

// Cursor rules applied correctly.
