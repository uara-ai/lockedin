"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  updateUserProfile,
  checkUsernameAvailability,
  type UpdateProfileInput,
} from "@/app/data/profile";
import type { UserProfile } from "@/app/data/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import {
  IconUser,
  IconMail,
  IconWorld,
  IconMapPin,
  IconBrandGithub,
  IconBrandX,
  IconLoader2,
  IconCheck,
  IconX,
  IconUpload,
} from "@tabler/icons-react";

// Validation schema matching the server-side schema
const profileEditSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .optional(),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  website: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  location: z
    .string()
    .max(100, "Location must be less than 100 characters")
    .optional(),
  githubUsername: z
    .string()
    .max(50, "GitHub username must be less than 50 characters")
    .optional(),
  xUsername: z
    .string()
    .max(50, "X username must be less than 50 characters")
    .optional(),
  githubSyncEnabled: z.boolean().optional(),
  xSyncEnabled: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

type ProfileEditFormData = z.infer<typeof profileEditSchema>;

interface ProfileEditFormProps {
  initialData: UserProfile;
  isCreating?: boolean;
}

export function ProfileEditForm({
  initialData,
  isCreating = false,
}: ProfileEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );

  const form = useForm<ProfileEditFormData>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      username: initialData.username || "",
      name: initialData.name || "",
      bio: initialData.bio || "",
      website: initialData.website || "",
      location: initialData.location || "",
      githubUsername: initialData.githubUsername || "",
      xUsername: initialData.xUsername || "",
      githubSyncEnabled: initialData.githubSyncEnabled,
      xSyncEnabled: initialData.xSyncEnabled,
      isPublic: initialData.isPublic,
    },
  });

  // Check username availability with debouncing
  const checkUsername = async (username: string) => {
    if (!username || username === initialData.username) {
      setUsernameAvailable(null);
      return;
    }

    setIsCheckingUsername(true);
    try {
      const response = await checkUsernameAvailability(username);
      if (response.success) {
        setUsernameAvailable(response.data!.available);
      }
    } catch (error) {
      console.error("Error checking username:", error);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const onSubmit = async (data: ProfileEditFormData) => {
    startTransition(async () => {
      try {
        // Filter out empty strings and convert them to undefined
        const cleanData: UpdateProfileInput = Object.fromEntries(
          Object.entries(data).map(([key, value]) => [
            key,
            value === "" ? undefined : value,
          ])
        ) as UpdateProfileInput;

        // Ensure boolean fields are properly typed
        if (typeof cleanData.isPublic === "string") {
          cleanData.isPublic = undefined;
        }
        if (typeof cleanData.githubSyncEnabled === "string") {
          cleanData.githubSyncEnabled = undefined;
        }
        if (typeof cleanData.xSyncEnabled === "string") {
          cleanData.xSyncEnabled = undefined;
        }

        const response = await updateUserProfile(cleanData);

        if (response.success) {
          toast.success(
            isCreating
              ? "Profile created successfully! Welcome to LockedIn!"
              : "Profile updated successfully!"
          );
          router.push("/profile");
          router.refresh();
        } else {
          toast.error(
            response.error ||
              (isCreating
                ? "Failed to create profile"
                : "Failed to update profile")
          );
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        toast.error("An unexpected error occurred");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Profile Picture Section */}
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="size-20 border-4 border-background">
              <AvatarImage
                src={initialData.avatar || undefined}
                alt={initialData.name || "User"}
              />
              <AvatarFallback>
                {initialData.name
                  ? initialData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                  : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Profile Picture</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {isCreating
                  ? "Your profile picture is synced from your authentication provider"
                  : "Your profile picture is synced from your WorkOS account"}
              </p>
              <Button type="button" variant="outline" size="sm" disabled>
                <IconUpload className="size-4 mr-2" />
                Upload New Photo (Coming Soon)
              </Button>
            </div>
          </div>
        </Card>

        {/* Basic Information */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <IconUser className="size-5" />
              <h3 className="text-lg font-semibold">Basic Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="johndoe"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            const value = e.target.value;
                            setTimeout(() => checkUsername(value), 500);
                          }}
                        />
                      </FormControl>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isCheckingUsername && (
                          <IconLoader2 className="size-4 animate-spin text-muted-foreground" />
                        )}
                        {!isCheckingUsername && usernameAvailable === true && (
                          <IconCheck className="size-4 text-green-500" />
                        )}
                        {!isCheckingUsername && usernameAvailable === false && (
                          <IconX className="size-4 text-red-500" />
                        )}
                      </div>
                    </div>
                    <FormDescription>
                      {isCreating
                        ? "Choose a unique username. This will be your public profile URL (e.g., lockedin.com/johndoe)."
                        : "Your unique username. This will be part of your public profile URL."}
                    </FormDescription>
                    {usernameAvailable === false && (
                      <p className="text-sm text-red-500">
                        Username is already taken
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormDescription>Your public display name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Bio */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about yourself and what you're building..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {isCreating
                      ? "Tell the LockedIn community about yourself and what you're building. This helps others discover and connect with you."
                      : "A brief description about yourself. This will be visible on your public profile."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Website */}
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <IconWorld className="size-4" />
                      Website
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://yourdomain.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your personal website or portfolio.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <IconMapPin className="size-4" />
                      Location
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="San Francisco, CA" {...field} />
                    </FormControl>
                    <FormDescription>Where you&apos;re based.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Card>

        {/* Social Accounts */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <IconBrandX className="size-5" />
              <h3 className="text-lg font-semibold">Social Accounts</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* GitHub Username */}
              <FormField
                control={form.control}
                name="githubUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <IconBrandGithub className="size-4" />
                      GitHub Username
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your GitHub username for tracking contributions.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* X Username */}
              <FormField
                control={form.control}
                name="xUsername"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <IconBrandX className="size-4" />X (Twitter) Username
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} />
                    </FormControl>
                    <FormDescription>Your X (Twitter) handle.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Card>

        {/* Privacy & Sync Settings */}
        <Card className="p-6">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Privacy & Sync Settings</h3>

            <div className="space-y-4">
              {/* Public Profile */}
              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Public Profile
                      </FormLabel>
                      <FormDescription>
                        {isCreating
                          ? "Make your profile visible to everyone. This allows others to discover your journey and achievements. Recommended for accountability!"
                          : "Make your profile visible to everyone. Required for sharing on social media."}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* GitHub Sync */}
              <FormField
                control={form.control}
                name="githubSyncEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">GitHub Sync</FormLabel>
                      <FormDescription>
                        Automatically track your GitHub contributions and
                        commits.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* X Sync */}
              <FormField
                control={form.control}
                name="xSyncEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        X (Twitter) Sync
                      </FormLabel>
                      <FormDescription>
                        Connect your X account for enhanced social features.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Card>

        {/* Submit Section */}
        <div className="flex items-center gap-4 pt-6">
          <Button
            type="submit"
            disabled={
              isPending ||
              (!!form.watch("username") && usernameAvailable === false)
            }
            className="flex items-center gap-2"
          >
            {isPending && <IconLoader2 className="size-4 animate-spin" />}
            {isPending
              ? isCreating
                ? "Creating Profile..."
                : "Saving..."
              : isCreating
              ? "Create Profile"
              : "Save Changes"}
          </Button>
          {!isCreating && (
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/profile")}
              disabled={isPending}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}

// Cursor rules applied correctly.
