import { PROFILE_PLANS } from "@/lib/plans";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconPointer } from "@tabler/icons-react";
import { Flame } from "lucide-react";
import { IconLock } from "@tabler/icons-react";
import { Check } from "lucide-react";
import Link from "next/link";

export function PaymentBanner() {
  const plan = PROFILE_PLANS.launch;
  return (
    <div>
      <div className="bg-card relative rounded-3xl border shadow-2xl shadow-zinc-950/5">
        <div className="grid items-center gap-12 divide-y p-12 md:grid-cols-2 md:divide-x md:divide-y-0">
          <div className="pb-12 text-center md:pb-0 md:pr-12">
            <div className="mb-6 mt-12 flex items-center justify-center gap-3">
              <span className="text-6xl font-bold">${plan.price}</span>
              <div className="flex flex-col">
                <span className="text-2xl font-semibold text-muted-foreground line-through">
                  ${plan.originalPrice}
                </span>
                <Badge variant="destructive" className="text-xs">
                  {plan.discount}% OFF
                </Badge>
              </div>
            </div>

            <div
              key={1}
              className="bg-foreground/10 rounded-[calc(var(--radius-xl)+0.125rem)] border p-0.5 flex justify-center"
            >
              <Button
                asChild
                size="lg"
                className="rounded-xl px-5 text-base w-full"
              >
                <Link href="/login">
                  <span className="text-nowrap flex items-center gap-2">
                    <IconPointer className="size-4" />
                    Create Profile{" "}
                    <Badge variant="destructive">
                      <Flame className="size-4 fill-white animate-pulse" />$
                      {plan.price}
                    </Badge>
                  </span>
                </Link>
              </Button>
            </div>

            <p className="text-muted-foreground mt-2 text-sm">
              One-time payment • Lifetime access
            </p>
            <p className="text-muted-foreground mt-2 text-xs flex items-center gap-1 text-center justify-center">
              <IconLock className="size-3" />
              Secure payment with Stripe
            </p>
          </div>
          <div className="relative">
            <ul role="list" className="space-y-4">
              {[
                "Public profile",
                "Accountability built in",
                "Revenues tracking",
                "Startup portfolio",
                "Community",
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="size-3 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground mt-6 text-sm">
              Have a question? Reach out{" "}
              <Link
                href="https://x.com/locked_fed"
                className="hover:underline underline-offset-2 text-primary/80 font-semibold hover:text-primary"
              >
                here
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
