"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkUsernameAvailability } from "@/app/data/profile";
import {
  IconLoader2,
  IconCheck,
  IconX,
  IconArrowRight,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function UsernameClaim() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check username availability with debouncing
  const checkUsername = async (inputUsername: string) => {
    if (!inputUsername || inputUsername.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setIsCheckingUsername(true);
    try {
      const response = await checkUsernameAvailability(inputUsername);
      if (response.success) {
        setUsernameAvailable(response.data!.available);
      }
    } catch (error) {
      console.error("Error checking username:", error);
      setUsernameAvailable(null);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // Debounced username checking
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (username) {
        checkUsername(username);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || username.length < 3) {
      toast.error("Please enter a valid username (at least 3 characters)");
      return;
    }

    if (usernameAvailable === false) {
      toast.error("Username is already taken");
      return;
    }

    if (usernameAvailable === null) {
      toast.error("Please wait for username validation");
      return;
    }

    setIsSubmitting(true);
    try {
      // Redirect to sign up with the username pre-filled
      router.push(`/login?username=${encodeURIComponent(username)}`);
    } catch (error) {
      console.error("Error claiming username:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = () => {
    if (isCheckingUsername) {
      return (
        <IconLoader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      );
    }
    if (usernameAvailable === true) {
      return <IconCheck className="h-4 w-4 text-green-500" />;
    }
    if (usernameAvailable === false) {
      return <IconX className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getStatusMessage = () => {
    if (isCheckingUsername) {
      return "Checking availability...";
    }
    if (usernameAvailable === true) {
      return "Username is available!";
    }
    if (usernameAvailable === false) {
      return "Username is already taken";
    }
    return null;
  };

  const isFormValid = username.length >= 3 && usernameAvailable === true;

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Main input form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center bg-background border-2 border-border rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
          {/* Brand prefix */}
          <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4">
            <Image
              src="/icon.svg"
              alt="Uara"
              width={32}
              height={32}
              className="rounded-xl"
            />
            <span className="text-lg font-semibold text-foreground">
              uara.co/
            </span>
          </div>

          {/* Username input */}
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border-0 rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 text-lg sm:text-2xl py-2.5 px-4 sm:px-6 h-auto shadow-none bg-transparent"
              disabled={isSubmitting}
            />
          </div>

          {/* Submit button - rounded and active */}
          <div className="p-1 sm:p-2">
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting || isCheckingUsername}
              size="lg"
              className={cn(
                "size-9 rounded-xl border-0 shadow-lg transition-all duration-300",
                "text-white font-semibold bg-primary",
                "disabled:opacity-20 disabled:cursor-not-allowed disabled:shadow-none",
                "hover:scale-105 active:scale-95",
                isFormValid && "shadow-primary/25 hover:shadow-primary/40"
              )}
            >
              {isSubmitting ? (
                <IconLoader2 className="h-5 w-5 animate-spin" />
              ) : isCheckingUsername ? (
                <IconLoader2 className="h-4 w-4 animate-spin" />
              ) : (
                <IconArrowRight className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Status message or call to action */}
      <div className="text-center px-2 sm:px-0">
        {username && getStatusMessage() ? (
          <p
            className={cn(
              "text-xs sm:text-sm font-medium",
              usernameAvailable === true && "text-green-600",
              usernameAvailable === false && "text-red-500",
              isCheckingUsername && "text-muted-foreground"
            )}
          >
            {getStatusMessage()}
          </p>
        ) : (
          <p className="text-xs sm:text-sm text-muted-foreground">
            3 digit username goes brrr
          </p>
        )}
      </div>
    </div>
  );
}
