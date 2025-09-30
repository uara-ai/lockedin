"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { type DialogProps } from "@radix-ui/react-dialog";
import { Search, UserIcon, CheckIcon, ExternalLinkIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useIsMac } from "@/hooks/use-is-mac";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUsers, invalidateUsersCache } from "@/hooks/use-users";

interface UsernameMenuProps extends DialogProps {
  onUserSelect?: () => void;
}

export function UsernameMenu({ onUserSelect, ...props }: UsernameMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isMac = useIsMac();
  const [open, setOpen] = React.useState(false);

  const {
    isLoading,
    refreshUsers,
    filteredUsers,
    searchQuery,
    setSearchQuery,
  } = useUsers();

  const displayedUsers = filteredUsers(searchQuery);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  const getUserUrl = React.useCallback((username: string) => {
    return `/${username}`;
  }, []);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }

        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const calculateJoinedDuration = (joinedAt: Date) => {
    const now = new Date();
    const joined = new Date(joinedAt);
    const diffInMs = now.getTime() - joined.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays < 1) {
      return "Joined today";
    } else if (diffInDays < 30) {
      return `${diffInDays}d ago`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months}mo ago`;
    } else {
      const years = Math.floor(diffInDays / 365);
      return `${years}y ago`;
    }
  };

  const getInitials = (name: string | null, username: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (username) {
      return username.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="secondary"
            className={cn(
              "bg-surface text-surface-foreground/60 dark:bg-card relative h-8 w-full justify-start pl-2.5 font-medium shadow-none sm:pr-12 md:w-40 lg:w-56 xl:w-96 border border-primary/30"
            )}
            onClick={() => setOpen(true)}
            {...props}
          >
            <span className="hidden lg:inline-flex items-center gap-2">
              <Search className="size-4" />
              Search users...
            </span>
            <span className="inline-flex lg:hidden">Search users...</span>
            <div className="absolute top-1.5 right-1.5 hidden gap-1 sm:flex">
              <CommandMenuKbd className="text-primary">
                {isMac ? "⌘" : "Ctrl"}
              </CommandMenuKbd>
              <CommandMenuKbd className="aspect-square text-primary">
                K
              </CommandMenuKbd>
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent className="rounded-xl border-none bg-clip-padding p-2 pb-4 shadow-2xl ring-4 ring-neutral-200/80 dark:bg-neutral-900 dark:ring-neutral-800">
          <DialogHeader className="sr-only">
            <DialogTitle className="flex items-center gap-2">
              <Search className="size-4" />
              <span>Search users...</span>
            </DialogTitle>
            <DialogDescription>
              Search for users by username or name...
            </DialogDescription>
          </DialogHeader>
          <Command className="**:data-[slot=command-input-wrapper]:bg-input/50 **:data-[slot=command-input]:!h-9 **:data-[slot=command-input]:py-0 **:data-[slot=command-input-wrapper]:mb-0 **:data-[slot=command-input-wrapper]:!h-9 **:data-[slot=command-input-wrapper]:rounded-md **:data-[slot=command-input-wrapper]:border rounded-none bg-transparent">
            <CommandInput
              placeholder="Search by username or name..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList className="no-scrollbar min-h-80 scroll-pt-2 scroll-pb-1.5">
              <CommandEmpty className="text-muted-foreground py-12 text-center text-sm">
                {searchQuery ? "No users found." : "Loading users..."}
              </CommandEmpty>

              {/* Users List */}
              <CommandGroup
                heading={searchQuery ? "Search Results" : "Featured Builders"}
                className="!p-0 [&_[cmdk-group-heading]]:!p-3 [&_[cmdk-group-heading]]:!pb-1"
              >
                {isLoading ? (
                  <>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-3 w-1/3" />
                        </div>
                        <Skeleton className="h-5 w-16" />
                      </div>
                    ))}
                  </>
                ) : (
                  displayedUsers.map((user) => {
                    const joinedDuration = calculateJoinedDuration(
                      user.joinedAt
                    );
                    const initials = getInitials(user.name, user.username);

                    return (
                      <CommandItem
                        key={user.id}
                        value={`${user.name || ""} ${user.username || ""}`}
                        className="data-[selected=true]:border-input data-[selected=true]:bg-input/50 min-h-12 rounded-md border border-transparent !px-3 font-medium"
                        onSelect={() => {
                          runCommand(() => {
                            if (user.username) {
                              router.push(getUserUrl(user.username));
                              onUserSelect?.();
                            }
                          });
                        }}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user.avatar || undefined}
                            alt={user.name || user.username || "User"}
                          />
                          <AvatarFallback className="text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold truncate">
                              {user.name || user.username}
                            </span>
                            {user.verified && (
                              <CheckIcon className="h-4 w-4 text-blue-500" />
                            )}
                            <Badge
                              variant="outline"
                              className="text-xs font-semibold text-muted-foreground"
                            >
                              {joinedDuration}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>@{user.username}</span>
                            {user.currentStreak > 0 && (
                              <>
                                <span>•</span>
                                <span>{user.currentStreak} day streak</span>
                              </>
                            )}
                            {user.followers_count > 0 && (
                              <>
                                <span>•</span>
                                <span>{user.followers_count} followers</span>
                              </>
                            )}
                          </div>
                        </div>
                        <ExternalLinkIcon className="h-4 w-4 text-muted-foreground" />
                      </CommandItem>
                    );
                  })
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CommandMenuKbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      className={cn(
        "bg-background text-muted-foreground pointer-events-none flex h-5 items-center justify-center gap-1 rounded border px-1 font-sans text-[0.7rem] font-medium select-none [&_svg:not([class*='size-'])]:size-3",
        className
      )}
      {...props}
    />
  );
}

// Cursor rules applied correctly.
