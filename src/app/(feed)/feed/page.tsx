"use client";

import { useState, useEffect } from "react";
import { getPosts, type PostWithDetails } from "@/app/data/posts";
import { FeedContainer } from "@/components/feed/feed-container";
import { Skeleton } from "@/components/ui/skeleton";

// Loading component for post cards
function PostCardSkeleton() {
  return (
    <div className="space-y-4 p-6 border rounded-lg">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-4 pt-3 border-t">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

// Loading skeleton for feed
function FeedSkeleton() {
  return (
    <div className="space-y-6">
      {/* Create Post Skeleton */}
      <div className="border rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <div className="flex justify-end">
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Posts List Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-9 w-20" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export default function FeedPage() {
  const [initialPosts, setInitialPosts] = useState<PostWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial posts
  useEffect(() => {
    const loadInitialPosts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const postsResponse = await getPosts(10, 0);

        if (postsResponse.success && postsResponse.data) {
          setInitialPosts(postsResponse.data);
        } else {
          setError(postsResponse.error || "Failed to load posts");
        }
      } catch (error) {
        console.error("Error loading initial posts:", error);
        setError("Something went wrong loading the posts");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialPosts();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full">
        <FeedSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-4 py-6">
        <div className="text-center py-12">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              Unable to Load Feed
            </h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-2">
      <div className="space-y-4">
        {/* Feed Container */}
        <FeedContainer initialPosts={initialPosts} />
      </div>
    </div>
  );
}
