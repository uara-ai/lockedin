"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Loader2,
  Send,
  DollarSign,
  GitCommit,
  Trophy,
  Flame,
  Target,
  MessageSquare,
  Hash,
  X,
} from "lucide-react";
import { createPost, type CreatePostInput } from "@/app/data/posts";
import { PostType } from "@prisma/client";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import Link from "next/link";
import { IconLock } from "@tabler/icons-react";

// Validation schema matching the server-side schema
const createPostSchema = z.object({
  content: z
    .string()
    .min(1, "Post content is required")
    .max(2000, "Post content must be less than 2000 characters"),
  type: z.nativeEnum(PostType),
  revenueAmount: z.number().positive("Revenue must be positive").optional(),
  currency: z.string().length(3, "Currency must be 3 characters").optional(),
  commitsCount: z
    .number()
    .min(0, "Commits count cannot be negative")
    .optional(),
  repoUrl: z.string().url("Please enter a valid repository URL").optional(),
  tags: z.array(z.string()).max(5, "Maximum 5 tags allowed"),
});

type CreatePostFormData = z.infer<typeof createPostSchema>;

// Post type configurations with icons and descriptions
const postTypeConfig = {
  [PostType.UPDATE]: {
    icon: MessageSquare,
    label: "General Update",
    description: "Share your progress or thoughts",
    color: "text-blue-500",
  },
  [PostType.REVENUE]: {
    icon: DollarSign,
    label: "Revenue Milestone",
    description: "Share your revenue achievement",
    color: "text-green-500",
  },
  [PostType.ACHIEVEMENT]: {
    icon: Trophy,
    label: "Achievement",
    description: "Celebrate a major accomplishment",
    color: "text-yellow-500",
  },
  [PostType.STREAK]: {
    icon: Flame,
    label: "Streak Milestone",
    description: "Share your consistency milestone",
    color: "text-orange-500",
  },
  [PostType.GITHUB]: {
    icon: GitCommit,
    label: "Code Contribution",
    description: "Share your development work",
    color: "text-purple-500",
  },
  [PostType.MILESTONE]: {
    icon: Target,
    label: "Project Milestone",
    description: "Mark an important project moment",
    color: "text-indigo-500",
  },
};

interface CreatePostProps {
  onPostCreated?: () => void;
  className?: string;
}

export function CreatePost({ onPostCreated, className }: CreatePostProps) {
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [tagInput, setTagInput] = useState("");

  const form = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      content: "",
      type: PostType.UPDATE,
      tags: [],
    },
  });

  const watchedType = form.watch("type");
  const watchedTags = form.watch("tags");
  const watchedContent = form.watch("content");

  // Add tag functionality
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (
      trimmedTag &&
      !watchedTags.includes(trimmedTag) &&
      watchedTags.length < 5
    ) {
      form.setValue("tags", [...watchedTags, trimmedTag]);
      setTagInput("");
    }
  };

  // Remove tag functionality
  const removeTag = (tagToRemove: string) => {
    form.setValue(
      "tags",
      watchedTags.filter((tag) => tag !== tagToRemove)
    );
  };

  // Handle tag input key press
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const onSubmit = async (data: CreatePostFormData) => {
    if (!user) {
      toast.error("You must be logged in to create a post");
      return;
    }

    startTransition(async () => {
      try {
        // Clean data: remove empty optional fields
        const cleanData: CreatePostInput = {
          content: data.content,
          type: data.type,
          ...(data.revenueAmount && { revenueAmount: data.revenueAmount }),
          ...(data.currency && { currency: data.currency }),
          ...(data.commitsCount !== undefined && {
            commitsCount: data.commitsCount,
          }),
          ...(data.repoUrl && { repoUrl: data.repoUrl }),
          ...(data.tags && data.tags.length > 0 && { tags: data.tags }),
        };

        const response = await createPost(cleanData);

        if (response.success) {
          toast.success("Post created successfully!");
          form.reset();
          setTagInput("");
          onPostCreated?.();
        } else {
          toast.error(response.error || "Failed to create post");
        }
      } catch (error) {
        console.error("Error creating post:", error);
        toast.error("An unexpected error occurred");
      }
    });
  };

  if (!user) {
    return (
      <Card className={`p-6 text-center ${className}`}>
        <p className="text-muted-foreground">
          Please sign in to create posts and share your journey.
        </p>
        <Button
          variant="default"
          size="sm"
          className="text-sm font-semibold"
          asChild
        >
          <Link href="/login">
            <span className="flex items-center gap-2">
              <IconLock className="size-4" />
              Sign in
            </span>
          </Link>
        </Button>
      </Card>
    );
  }

  const selectedConfig = postTypeConfig[watchedType];
  const IconComponent = selectedConfig.icon;

  return (
    <div className={`w-full ${className} bg-transparent`}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Header with Avatar */}
          <div className="flex items-center gap-3">
            <Avatar className="size-10 border-2 border-background">
              <AvatarImage
                src={user.profilePictureUrl || undefined}
                alt={user.firstName || "User"}
              />
              <AvatarFallback>
                {user.firstName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {user.firstName} {user.lastName}
              </p>
              <div className="flex items-center gap-2">
                <IconComponent className={`size-4 ${selectedConfig.color}`} />
                <span className="text-xs text-muted-foreground">
                  {selectedConfig.description}
                </span>
              </div>
            </div>
          </div>

          {/* Post Type Selection */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Post Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select post type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(postTypeConfig).map(([type, config]) => {
                      const Icon = config.icon;
                      return (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center gap-2">
                            <Icon className={`size-4 ${config.color}`} />
                            <span>{config.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Content Textarea */}
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder={`What's happening with your ${selectedConfig.label.toLowerCase()}?`}
                    className="min-h-[100px] resize-none border-0 focus-visible:ring-0 px-3 py-2"
                    {...field}
                  />
                </FormControl>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{watchedContent.length}/2000 characters</span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Type-specific fields */}
          {watchedType === PostType.REVENUE && (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="revenueAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Revenue Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="1000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Currency</FormLabel>
                    <FormControl>
                      <Input placeholder="USD" maxLength={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {watchedType === PostType.GITHUB && (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="commitsCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Commits Count</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="5"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="repoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Repository URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://github.com/user/repo"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Tags Section */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Hash className="size-4" />
              Tags (optional)
            </Label>

            {/* Display existing tags */}
            {watchedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {watchedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Tag input */}
            {watchedTags.length < 5 && (
              <Input
                placeholder="Add tags (press Enter or comma to add)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyPress}
                onBlur={() => {
                  if (tagInput.trim()) {
                    addTag(tagInput);
                  }
                }}
              />
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              type="submit"
              disabled={isPending || !watchedContent.trim()}
              className="flex items-center gap-2"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {isPending ? "Publishing..." : "Publish Post"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

// Cursor rules applied correctly.
