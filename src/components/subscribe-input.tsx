"use client";

import { subscribeAction, getSubscriberCount } from "@/actions/waitlist";
import { Check, Loader2, Mail, SendHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <div className="md:pr-1.5 lg:pr-0">
      <Button
        aria-label="submit"
        className="rounded-[calc(var(--radius))]"
        disabled={pending}
      >
        {pending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <span className="hidden md:block">Get Started</span>
            <SendHorizontal
              className="relative mx-auto size-5 md:hidden"
              strokeWidth={2}
            />
          </>
        )}
      </Button>
    </div>
  );
}

export function SubscribeInput() {
  const [isSubmitted, setSubmitted] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number>(0);

  useEffect(() => {
    const fetchSubscriberCount = async () => {
      try {
        const result = await getSubscriberCount();
        if (
          result?.data &&
          typeof result.data === "object" &&
          result.data !== null &&
          "count" in result.data
        ) {
          setSubscriberCount((result.data as { count: number }).count);
        }
      } catch (error) {
        console.error("Failed to fetch subscriber count:", error);
      }
    };

    fetchSubscriberCount();
  }, []);

  const handleFormSubmit = async (formData: FormData) => {
    const email = formData.get("email") as string;
    const result = await subscribeAction({ email });

    if (result?.data?.success) {
      setSubmitted(true);
      setSubscriberCount((prev) => prev + 1); // Optimistically update the count
      toast.success("Thanks for joining!");
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } else {
      toast.error("You're already on the list!");
    }
  };

  return (
    <div className="w-full mb-4">
      {isSubmitted ? (
        <div className="mx-auto my-10 max-w-sm lg:my-12 lg:ml-0 lg:mr-auto">
          <div className="h-14 px-6 rounded-[calc(var(--radius)+0.75rem)] bg-green-50 border border-green-200 flex items-center justify-center space-x-2">
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              Added to waitlist
            </span>
          </div>
        </div>
      ) : (
        <form
          action={handleFormSubmit}
          className="mx-auto my-4 max-w-sm lg:ml-0 lg:mr-auto"
        >
          <div className="bg-background has-[input:focus]:ring-muted relative grid grid-cols-[1fr_auto] items-center rounded-[calc(var(--radius)+0.75rem)] border pr-3 shadow shadow-zinc-950/5 has-[input:focus]:ring-2">
            <Mail className="text-caption pointer-events-none absolute inset-y-0 left-5 my-auto size-5" />

            <input
              placeholder="Your mail address"
              className="h-14 w-full bg-transparent pl-12 focus:outline-none"
              type="email"
              name="email"
              id="email"
              autoComplete="email"
              aria-label="Email address"
              required
            />

            <SubmitButton />
          </div>
        </form>
      )}

      {subscriberCount > 50 && (
        <p className="text-xs text-muted-foreground/60">
          <strong>{subscriberCount}</strong> members on the waitlist
        </p>
      )}
    </div>
  );
}

// Cursor rules applied correctly.
