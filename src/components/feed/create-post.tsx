"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Loader2,
  Send,
  AtSign,
  DollarSign,
  Hash,
  Calendar,
  Target,
  Sparkles,
  Zap,
  Command as CommandIcon,
  Search,
  User,
  CheckIcon,
} from "lucide-react";
import { createPost, type CreatePostInput } from "@/app/data/posts";
import { PostType } from "@prisma/client";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import Link from "next/link";
import { IconLock } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useUsers } from "@/hooks/use-users";

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
  "LKR",
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
  "LKR",
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

// Keyboard shortcuts
const SHORTCUTS = [
  { key: "Ctrl+Enter", description: "Send post" },
  { key: "@", description: "Mention user" },
  { key: "$", description: "Add currency" },
  { key: "#", description: "Add tag" },
  { key: "Cmd+D / Ctrl+D", description: "Add dollar amount" },
];

interface CreatePostProps {
  onPostCreated?: () => void;
  className?: string;
}

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

export function CreatePost({ onPostCreated, className }: CreatePostProps) {
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState("");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Use real user search hook
  const { isLoading: isLoadingUsers, users, setSearchQuery } = useUsers();

  // Filter users based on search query
  const displayedUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.name?.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  // Update search query when user types
  useEffect(() => {
    if (userSearchQuery) {
      setSearchQuery(userSearchQuery);
    }
  }, [userSearchQuery, setSearchQuery]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [content]);

  // Format number with commas
  const formatNumberWithCommas = (num: number) => {
    return num.toLocaleString("en-US");
  };

  // Handle D command for dollar amount
  const handleDCommand = () => {
    if (textareaRef.current) {
      const cursorPos = textareaRef.current.selectionStart;
      const beforeCursor = content.substring(0, cursorPos);
      const afterCursor = content.substring(cursorPos);
      const newContent = `${beforeCursor}$1,000${afterCursor}`;

      setContent(newContent);

      // Focus and position cursor after the dollar amount
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = cursorPos + 6; // After "$1,000"
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
  };

  // Close user search when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        showUserSearch &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setShowUserSearch(false);
      }
    };

    if (showUserSearch) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showUserSearch]);

  // Handle text change and detect @ mentions
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const cursorPos = e.target.selectionStart;

    setContent(newContent);
    setCursorPosition(cursorPos);

    // Check if user is typing after @ symbol
    const textBeforeCursor = newContent.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      // Check if there's no space between @ and cursor
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
        setShowUserSearch(true);
        setUserSearchQuery(textAfterAt);
        setMentionStartIndex(lastAtIndex);
        setSelectedUserIndex(0); // Reset selection when search changes
      } else {
        setShowUserSearch(false);
      }
    } else {
      setShowUserSearch(false);
    }
  };

  // Handle user selection from dropdown
  const handleUserSelect = (selectedUser: any) => {
    if (mentionStartIndex !== -1 && selectedUser.username) {
      const beforeMention = content.substring(0, mentionStartIndex);
      const afterMention = content.substring(cursorPosition);
      const newContent = `${beforeMention}@${selectedUser.username} ${afterMention}`;

      setContent(newContent);
      setShowUserSearch(false);
      setUserSearchQuery("");
      setMentionStartIndex(-1);

      // Focus back to textarea
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos =
            beforeMention.length + selectedUser.username.length + 2;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in to create a post");
      return;
    }

    if (!content.trim()) {
      toast.error("Please write something before posting");
      return;
    }

    startTransition(async () => {
      try {
        // Extract mentions and currencies from content
        const mentions = content.match(/@\w+/g) || [];
        const currencies = content.match(/\$[A-Z]{3}|\b[A-Z]{3}\b/g) || [];

        // Create a simple commitment post
        const postData: CreatePostInput = {
          content: content.trim(),
          type: PostType.COMMITMENT,
          goal: content.trim().substring(0, 200), // Use first 200 chars as goal
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        };

        const response = await createPost(postData);

        if (response.success) {
          toast.success("Commitment posted successfully!");
          setContent("");
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

  return (
    <div className={`w-full ${className}`}>
      {/* Cursor Chat-like Interface */}
      <div className="bg-background border border-border rounded-xl shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarImage
                src={user.profilePictureUrl || undefined}
                alt={user.firstName || "User"}
              />
              <AvatarFallback className="text-sm font-semibold">
                {user.firstName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-xs text-muted-foreground">
                Create a commitment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShortcuts(!showShortcuts)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <Command className="size-3 mr-1" />
              Shortcuts
            </Button>
          </div>
        </div>

        {/* Shortcuts Panel */}
        {showShortcuts && (
          <div className="p-4 bg-muted/30 border-b border-border">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {SHORTCUTS.map((shortcut) => (
                <div key={shortcut.key} className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
                    {shortcut.key}
                  </kbd>
                  <span className="text-muted-foreground">
                    {shortcut.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-4">
          {/* Preview of what user is typing */}
          {content && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg border">
              <div className="text-sm text-muted-foreground mb-2">Preview:</div>
              <div className="text-sm">
                <HighlightedText text={content} />
              </div>
            </div>
          )}

          {/* Text Input */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={handleTextChange}
              placeholder="I commit to reaching $10k MRR by December 2025. I'll build in public and share weekly updates. If I fail, I'll donate $500 to @charity. #startup #saas #buildinpublic"
              className="min-h-[120px] resize-none border-0 focus-visible:ring-0 text-sm leading-relaxed pr-12"
              onKeyDown={(e) => {
                if (e.ctrlKey && e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }

                // Handle D command for dollar amount
                if ((e.metaKey || e.ctrlKey) && e.key === "d") {
                  e.preventDefault();
                  handleDCommand();
                }

                if (showUserSearch) {
                  if (e.key === "Escape") {
                    setShowUserSearch(false);
                    setSelectedUserIndex(0);
                  } else if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setSelectedUserIndex((prev) =>
                      Math.min(prev + 1, displayedUsers.length - 1)
                    );
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setSelectedUserIndex((prev) => Math.max(prev - 1, 0));
                  } else if (e.key === "Enter" || e.key === "Tab") {
                    e.preventDefault();
                    if (displayedUsers[selectedUserIndex]) {
                      handleUserSelect(displayedUsers[selectedUserIndex]);
                    }
                  }
                } else {
                  // Close user search on Escape
                  if (e.key === "Escape") {
                    setShowUserSearch(false);
                  }
                }
              }}
            />

            {/* User Search Dropdown */}
            {showUserSearch && (
              <div className="absolute bottom-full left-0 right-0 mb-2 z-50">
                <div className="bg-background border border-border rounded-lg shadow-lg p-2 max-h-60 overflow-y-auto">
                  <div className="text-xs text-muted-foreground mb-2 px-2">
                    Search users to mention:
                  </div>
                  {isLoadingUsers ? (
                    <div className="space-y-1">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-2">
                          <div className="size-6 bg-muted rounded-full animate-pulse" />
                          <div className="flex-1 space-y-1">
                            <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                            <div className="h-3 bg-muted rounded animate-pulse w-1/3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : displayedUsers.length > 0 ? (
                    <div className="space-y-1">
                      {displayedUsers.slice(0, 5).map((user, index) => {
                        const initials = user.name
                          ? user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)
                          : user.username
                          ? user.username.slice(0, 2).toUpperCase()
                          : "U";

                        return (
                          <button
                            key={user.id}
                            onClick={() => handleUserSelect(user)}
                            className={cn(
                              "w-full flex items-center gap-3 p-2 rounded-md transition-colors text-left",
                              index === selectedUserIndex
                                ? "bg-primary/10 border border-primary/20"
                                : "hover:bg-muted/50"
                            )}
                          >
                            <Avatar className="size-6">
                              <AvatarImage src={user.avatar || undefined} />
                              <AvatarFallback className="text-xs">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="font-medium text-sm truncate">
                                  {user.name || user.username}
                                </span>
                                {user.verified && (
                                  <CheckIcon className="h-4 w-4 text-blue-500" />
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                @{user.username}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground p-2 text-center">
                      {userSearchQuery
                        ? `No users found for "${userSearchQuery}"`
                        : "No users available"}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Send Button */}
            <Button
              onClick={handleSubmit}
              disabled={isPending || !content.trim()}
              size="sm"
              className="absolute bottom-3 right-3 h-8 w-8 p-0 rounded-full bg-primary hover:bg-primary/90"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </div>

          {/* Footer with tips */}
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <DollarSign className="size-3" />
                <span>Currency highlighting</span>
              </div>
              <div className="flex items-center gap-1">
                <AtSign className="size-3" />
                <span>User mentions</span>
              </div>
              <div className="flex items-center gap-1">
                <Hash className="size-3" />
                <span>Hashtags</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span>{content.length}/2000</span>
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">
                Ctrl+Enter
              </kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Cursor rules applied correctly.
