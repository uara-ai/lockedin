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
  Target,
  Trophy,
  Flame,
  X,
  Calendar,
  AlertTriangle,
  Hash,
  DollarSign,
  User,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { createPost, type CreatePostInput } from "@/app/data/posts";
import { PostType } from "@prisma/client";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import Link from "next/link";
import { IconLock } from "@tabler/icons-react";

// Validation schema for commitment posts
const createPostSchema = z.object({
  content: z
    .string()
    .min(1, "Commitment description is required")
    .max(2000, "Description must be less than 2000 characters"),
  type: z.nativeEnum(PostType),
  goal: z
    .string()
    .min(1, "Goal is required")
    .max(200, "Goal must be less than 200 characters"),
  deadline: z.date().min(new Date(), "Deadline must be in the future"),
  stakeAmount: z.number().positive("Stake amount must be positive").optional(),
  stakeCurrency: z
    .string()
    .length(3, "Currency must be 3 characters")
    .optional(),
  stakeDescription: z
    .string()
    .min(1, "Stake description is required")
    .max(200, "Stake description must be less than 200 characters")
    .optional(),
  stakeRecipient: z
    .string()
    .min(1, "Stake recipient is required")
    .max(100, "Recipient must be less than 100 characters")
    .optional(),
  tags: z.array(z.string()).max(5, "Maximum 5 tags allowed").optional(),
});

type CreatePostFormData = z.infer<typeof createPostSchema>;

// Post type configurations with icons and descriptions
const postTypeConfig = {
  [PostType.COMMITMENT]: {
    icon: Target,
    label: "Public Commitment",
    description: "Make a public commitment with accountability",
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-950",
    borderColor: "border-red-200 dark:border-red-800",
  },
  [PostType.PROGRESS]: {
    icon: Flame,
    label: "Progress Update",
    description: "Update progress on your commitment",
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950",
    borderColor: "border-orange-200 dark:border-orange-800",
  },
  [PostType.COMPLETION]: {
    icon: Trophy,
    label: "Commitment Completed",
    description: "Celebrate completing your commitment",
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950",
    borderColor: "border-green-200 dark:border-green-800",
  },
  [PostType.FAILURE]: {
    icon: X,
    label: "Commitment Failed",
    description: "Acknowledge failure and activate stake",
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900",
    borderColor: "border-red-300 dark:border-red-700",
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
      type: PostType.COMMITMENT,
      goal: "",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      stakeAmount: undefined,
      stakeCurrency: "USD",
      stakeDescription: "",
      stakeRecipient: "",
      tags: [],
    },
  });

  const watchedType = form.watch("type");
  const watchedTags = form.watch("tags") || [];
  const watchedContent = form.watch("content");
  const watchedStakeAmount = form.watch("stakeAmount");

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
          goal: data.goal,
          deadline: data.deadline,
          ...(data.stakeAmount && { stakeAmount: data.stakeAmount }),
          ...(data.stakeCurrency && { stakeCurrency: data.stakeCurrency }),
          ...(data.stakeDescription && {
            stakeDescription: data.stakeDescription,
          }),
          ...(data.stakeRecipient && { stakeRecipient: data.stakeRecipient }),
          ...(data.tags && data.tags.length > 0 && { tags: data.tags }),
        };

        const response = await createPost(cleanData);

        if (response.success) {
          toast.success("Commitment created successfully!");
          form.reset();
          setTagInput("");
          onPostCreated?.();
        } else {
          toast.error(response.error || "Failed to create commitment");
        }
      } catch (error) {
        console.error("Error creating commitment:", error);
        toast.error("An unexpected error occurred");
      }
    });
  };

  if (!user) {
    return (
      <div className={`w-full ${className}`}>
        <div className="text-center py-12 px-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-muted to-muted/50 rounded-2xl flex items-center justify-center mb-6">
            <IconLock className="size-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-bold mb-3">Ready to commit?</h3>
          <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
            Join the accountability community and start making public
            commitments that matter.
          </p>
          <Button
            variant="default"
            size="lg"
            className="h-12 px-8 text-base font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            asChild
          >
            <Link href="/login">
              <span className="flex items-center gap-2">
                <IconLock className="size-4" />
                Sign in to continue
              </span>
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const selectedConfig = postTypeConfig[watchedType];
  const IconComponent = selectedConfig.icon;

  return (
    <div className={`w-full ${className}`}>
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Header with Avatar and Type Selection */}
            <div className="flex items-start gap-4">
              <Avatar className="size-14 border-2 border-background shadow-sm">
                <AvatarImage
                  src={user.profilePictureUrl || undefined}
                  alt={user.firstName || "User"}
                />
                <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-muted to-muted/80">
                  {user.firstName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-muted-foreground">
                    Create a public commitment
                  </p>
                </div>

                {/* Commitment Type Selection */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-muted-foreground">
                        Commitment Type
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 bg-background/50 border-border/50 hover:border-border focus:border-red-300 transition-colors">
                            <SelectValue placeholder="Select commitment type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(postTypeConfig).map(
                            ([type, config]) => {
                              const Icon = config.icon;
                              return (
                                <SelectItem key={type} value={type}>
                                  <div className="flex items-center gap-3 py-2">
                                    <Icon
                                      className={`size-5 ${config.color}`}
                                    />
                                    <div>
                                      <div className="font-medium">
                                        {config.label}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {config.description}
                                      </div>
                                    </div>
                                  </div>
                                </SelectItem>
                              );
                            }
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Goal Input */}
            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-bold flex items-center gap-3 mb-3">
                    <div className="p-2 bg-red-50 dark:bg-red-950 rounded-lg">
                      <Target className="size-5 text-red-500" />
                    </div>
                    What are you committing to achieve?
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Reach $10k MRR by December 2025"
                      className="h-14 text-lg border-2 border-border/50 focus:border-red-300 bg-background/50 transition-all duration-200"
                      {...field}
                    />
                  </FormControl>
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
                  <FormLabel className="text-lg font-bold flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <CheckCircle className="size-5 text-blue-500" />
                    </div>
                    Commitment Details
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your commitment in detail. What will you do? How will you measure success? What's your plan?"
                      className="min-h-[160px] resize-none text-base border-2 border-border/50 focus:border-blue-300 bg-background/50 transition-all duration-200"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between items-center text-sm text-muted-foreground mt-2">
                    <span>Be specific about your goals and timeline</span>
                    <span className="font-medium">
                      {watchedContent.length}/2000
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Commitment-specific fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Deadline */}
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold flex items-center gap-3 mb-3">
                      <div className="p-2 bg-orange-50 dark:bg-orange-950 rounded-lg">
                        <Calendar className="size-4 text-orange-500" />
                      </div>
                      Deadline
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="h-12 text-base border-2 border-border/50 focus:border-orange-300 bg-background/50 transition-all duration-200"
                        {...field}
                        value={
                          field.value
                            ? field.value.toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          field.onChange(new Date(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Stake Amount */}
              <FormField
                control={form.control}
                name="stakeAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold flex items-center gap-3 mb-3">
                      <div className="p-2 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                        <DollarSign className="size-4 text-yellow-500" />
                      </div>
                      Stake Amount (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="500"
                        className="h-12 text-base border-2 border-border/50 focus:border-yellow-300 bg-background/50 transition-all duration-200"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Stake Currency - only show if stake amount is provided */}
            {watchedStakeAmount && (
              <FormField
                control={form.control}
                name="stakeCurrency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      Currency
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="USD"
                        maxLength={3}
                        className="h-12 text-base border-2 border-border/50 focus:border-yellow-300 bg-background/50 transition-all duration-200"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Stake Description */}
            <FormField
              control={form.control}
              name="stakeDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold flex items-center gap-3 mb-3">
                    <div className="p-2 bg-red-50 dark:bg-red-950 rounded-lg">
                      <AlertTriangle className="size-4 text-red-500" />
                    </div>
                    What happens if you fail?
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., I will pay $500 to my friend Federico"
                      className="h-12 text-base border-2 border-border/50 focus:border-red-300 bg-background/50 transition-all duration-200"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Stake Recipient */}
            <FormField
              control={form.control}
              name="stakeRecipient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <User className="size-4 text-purple-500" />
                    </div>
                    Who gets the stake if you fail?
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., @federico or federico@example.com"
                      className="h-12 text-base border-2 border-border/50 focus:border-purple-300 bg-background/50 transition-all duration-200"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags Section */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
                  <Hash className="size-4 text-indigo-500" />
                </div>
                Tags (optional)
              </Label>

              {/* Display existing tags */}
              {watchedTags && watchedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {watchedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-sm rounded-full border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-indigo-900 dark:hover:text-indigo-100 transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Tag input */}
              {watchedTags && watchedTags.length < 5 && (
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
                  className="h-12 text-base border-2 border-border/50 focus:border-indigo-300 bg-background/50 transition-all duration-200"
                />
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-border/30">
              <Button
                type="submit"
                disabled={isPending || !watchedContent.trim()}
                className="h-14 px-10 text-lg font-bold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-5 animate-spin mr-3" />
                    Creating Commitment...
                  </>
                ) : (
                  <>
                    <Send className="size-5 mr-3 group-hover:rotate-12 transition-transform duration-200" />
                    Create Commitment
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

// Cursor rules applied correctly.
