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

// Enhanced post type configurations with better UX
const postTypeConfig = {
  [PostType.COMMITMENT]: {
    icon: Target,
    label: "New Commitment",
    description: "Set a goal with accountability stakes",
    color: "text-red-500",
    bgColor:
      "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900",
    borderColor: "border-red-200 dark:border-red-800",
    accentColor: "bg-red-500",
    statusColor: "text-red-600 dark:text-red-400",
  },
  [PostType.PROGRESS]: {
    icon: Flame,
    label: "Progress Update",
    description: "Share your journey and milestones",
    color: "text-orange-500",
    bgColor:
      "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900",
    borderColor: "border-orange-200 dark:border-orange-800",
    accentColor: "bg-orange-500",
    statusColor: "text-orange-600 dark:text-orange-400",
  },
  [PostType.COMPLETION]: {
    icon: Trophy,
    label: "Goal Achieved",
    description: "Celebrate your success publicly",
    color: "text-green-500",
    bgColor:
      "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900",
    borderColor: "border-green-200 dark:border-green-800",
    accentColor: "bg-green-500",
    statusColor: "text-green-600 dark:text-green-400",
  },
  [PostType.FAILURE]: {
    icon: X,
    label: "Goal Missed",
    description: "Acknowledge failure and learn",
    color: "text-red-600",
    bgColor:
      "bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800",
    borderColor: "border-red-300 dark:border-red-700",
    accentColor: "bg-red-600",
    statusColor: "text-red-700 dark:text-red-300",
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
      <div className="mb-6 flex items-center gap-2 rounded-xl border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/30 px-4 py-2 text-sm text-yellow-900 dark:text-yellow-100 shadow-sm">
        <span className="font-semibold">Beta</span>
        <span className="text-yellow-800 dark:text-yellow-200">
          Post creation is work in progress. Join Discord to give feedback.
        </span>
      </div>
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Header with Avatar and Type Selection */}
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              <Avatar className="size-12 sm:size-14 border-2 border-background shadow-sm flex-shrink-0">
                <AvatarImage
                  src={user.profilePictureUrl || undefined}
                  alt={user.firstName || "User"}
                />
                <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-muted to-muted/80">
                  {user.firstName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4 sm:space-y-6 w-full">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Create a public commitment
                  </p>
                </div>

                {/* Enhanced Commitment Type Selector */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-foreground mb-4 block">
                        Choose your commitment type
                      </FormLabel>

                      {/* Custom Radio Group Style Selector */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(postTypeConfig).map(
                          ([type, config]) => {
                            const Icon = config.icon;
                            const isSelected = field.value === type;

                            return (
                              <div
                                key={type}
                                onClick={() => field.onChange(type)}
                                className={`
                                relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group
                                ${
                                  isSelected
                                    ? `${config.bgColor} ${config.borderColor} border-2 shadow-md`
                                    : "bg-background/50 border-border/50 hover:border-border hover:bg-muted/30"
                                }
                              `}
                              >
                                {/* Selection Indicator */}
                                <div
                                  className={`
                                absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                                ${
                                  isSelected
                                    ? `${config.accentColor} border-current`
                                    : "border-muted-foreground/30 group-hover:border-muted-foreground/60"
                                }
                              `}
                                >
                                  {isSelected && (
                                    <div className="w-2 h-2 bg-white rounded-full" />
                                  )}
                                </div>

                                {/* Icon and Content */}
                                <div className="flex items-start gap-3 pr-6">
                                  <div
                                    className={`
                                  p-2 rounded-lg flex-shrink-0 transition-all duration-200
                                  ${
                                    isSelected
                                      ? `${config.accentColor}`
                                      : "bg-muted/50 group-hover:bg-muted"
                                  }
                                `}
                                  >
                                    <Icon
                                      className={`
                                    size-5 transition-colors duration-200
                                    ${isSelected ? "text-white" : config.color}
                                  `}
                                    />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <h3
                                      className={`
                                    font-semibold text-sm mb-1 transition-colors duration-200
                                    ${
                                      isSelected
                                        ? config.statusColor
                                        : "text-foreground"
                                    }
                                  `}
                                    >
                                      {config.label}
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                      {config.description}
                                    </p>
                                  </div>
                                </div>

                                {/* Hover Effect */}
                                <div
                                  className={`
                                absolute inset-0 rounded-xl transition-opacity duration-200 pointer-events-none
                                ${
                                  isSelected
                                    ? "opacity-0"
                                    : "opacity-0 group-hover:opacity-100"
                                }
                                bg-gradient-to-r from-transparent via-white/5 to-transparent
                              `}
                                />
                              </div>
                            );
                          }
                        )}
                      </div>

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
                  <FormLabel className="text-base sm:text-lg font-bold flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-2 bg-red-50 dark:bg-red-950 rounded-lg flex-shrink-0">
                        <Target className="size-4 sm:size-5 text-red-500" />
                      </div>
                      <span className="text-sm sm:text-base">
                        What are you committing to achieve?
                      </span>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Reach $10k MRR by December 2025"
                      className="h-12 sm:h-14 text-base sm:text-lg border-2 border-border/50 focus:border-red-300 bg-background/50 transition-all duration-200"
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
                  <FormLabel className="text-base sm:text-lg font-bold flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg flex-shrink-0">
                        <CheckCircle className="size-4 sm:size-5 text-blue-500" />
                      </div>
                      <span className="text-sm sm:text-base">
                        Commitment Details
                      </span>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your commitment in detail. What will you do? How will you measure success? What's your plan?"
                      className="min-h-[120px] sm:min-h-[160px] resize-none text-sm sm:text-base border-2 border-border/50 focus:border-blue-300 bg-background/50 transition-all duration-200"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs sm:text-sm text-muted-foreground mt-2 gap-1">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Deadline */}
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm sm:text-base font-semibold flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 bg-orange-50 dark:bg-orange-950 rounded-lg flex-shrink-0">
                          <Calendar className="size-4 text-orange-500" />
                        </div>
                        <span className="text-sm sm:text-base">Deadline</span>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="h-11 sm:h-12 text-sm sm:text-base border-2 border-border/50 focus:border-orange-300 bg-background/50 transition-all duration-200"
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
                    <FormLabel className="text-sm sm:text-base font-semibold flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 bg-yellow-50 dark:bg-yellow-950 rounded-lg flex-shrink-0">
                          <DollarSign className="size-4 text-yellow-500" />
                        </div>
                        <span className="text-sm sm:text-base">
                          Stake Amount (Optional)
                        </span>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="500"
                        className="h-11 sm:h-12 text-sm sm:text-base border-2 border-border/50 focus:border-yellow-300 bg-background/50 transition-all duration-200"
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
            <div className="flex justify-center sm:justify-end pt-6 border-t border-border/30">
              <Button
                type="submit"
                disabled={isPending || !watchedContent.trim()}
                className="h-12 sm:h-14 px-6 sm:px-10 text-base sm:text-lg font-bold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group w-full sm:w-auto"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 sm:size-5 animate-spin mr-2 sm:mr-3" />
                    <span className="hidden sm:inline">
                      Creating Commitment...
                    </span>
                    <span className="sm:hidden">Creating...</span>
                  </>
                ) : (
                  <>
                    <Send className="size-4 sm:size-5 mr-2 sm:mr-3 group-hover:rotate-12 transition-transform duration-200" />
                    <span className="hidden sm:inline">Create Commitment</span>
                    <span className="sm:hidden">Create</span>
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
