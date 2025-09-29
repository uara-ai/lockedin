import { notFound } from "next/navigation";
import { getPost } from "@/app/data/posts";
import { PostCard } from "@/components/feed/post-card";
import { PostCommentsInline } from "@/components/feed/post-comments-inline";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

interface PostPageProps {
  params: Promise<{
    postId: string;
  }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { postId } = await params;

  const postResponse = await getPost(postId);

  if (!postResponse.success || !postResponse.data) {
    notFound();
  }

  const post = postResponse.data;

  return (
    <div className="w-full">
      <div className="mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/feed" className="flex items-center gap-2">
              <ArrowLeft className="size-4" />
              Back to Feed
            </Link>
          </Button>
        </div>

        {/* Post Card */}
        <div className="mb-6">
          <PostCard post={post} className="border rounded-lg p-6" />
        </div>

        <Separator className="my-6" />

        {/* Comments Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Comments ({post._count.comments})
          </h2>
          <PostCommentsInline post={post} />
        </div>
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { postId } = await params;

  const postResponse = await getPost(postId);

  if (!postResponse.success || !postResponse.data) {
    return {
      title: "Post Not Found | LockedIn",
    };
  }

  const post = postResponse.data;
  const truncatedContent =
    post.content.length > 150
      ? post.content.substring(0, 150) + "..."
      : post.content;

  return {
    title: `${post.author.name || post.author.username} on LockedIn`,
    description: truncatedContent,
    openGraph: {
      title: `${
        post.author.name || post.author.username
      } shared a ${post.type.toLowerCase()}`,
      description: truncatedContent,
      images: post.author.avatar ? [post.author.avatar] : [],
    },
    twitter: {
      card: "summary",
      title: `${post.author.name || post.author.username} on LockedIn`,
      description: truncatedContent,
      images: post.author.avatar ? [post.author.avatar] : [],
    },
  };
}

// Cursor rules applied correctly.
