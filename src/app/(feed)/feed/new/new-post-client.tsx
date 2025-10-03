"use client";

import { CreatePost } from "@/components/feed/create-post";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function NewPostClient() {
  const router = useRouter();

  // Handle new post creation
  const handlePostCreated = () => {
    toast.success("Post created successfully!");
    // Redirect to main feed
    router.push("/feed");
  };

  return (
    <div className="w-full px-2">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-6">
          Create New Post
        </h1>
        <CreatePost onPostCreated={handlePostCreated} />
      </div>
    </div>
  );
}
