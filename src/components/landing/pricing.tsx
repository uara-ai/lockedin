import { Button } from "@/components/ui/button";
import { Check, Flame } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { IconLock, IconPointer } from "@tabler/icons-react";

export default function Pricing() {
  return (
    <div className="relative py-16 md:py-32" id="pricing">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-baumans">
            <span className="font-instrument-serif italic text-primary">
              Skin
            </span>{" "}
            in the game.
          </h2>
        </div>
        <div className="mt-8 md:mt-20">
          <div className="bg-card relative rounded-3xl border shadow-2xl shadow-zinc-950/5">
            <div className="grid items-center gap-12 divide-y p-12 md:grid-cols-2 md:divide-x md:divide-y-0">
              <div className="pb-12 text-center md:pb-0 md:pr-12">
                <h3 className="text-2xl font-semibold">
                  For your future success
                </h3>
                <div className="mb-6 mt-12 flex items-center justify-center gap-3">
                  <span className="text-6xl font-bold">$19</span>
                  <div className="flex flex-col">
                    <span className="text-2xl font-semibold text-muted-foreground line-through">
                      $49
                    </span>
                    <Badge variant="destructive" className="text-xs">
                      61% OFF
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
                          <Flame className="size-4 fill-white animate-pulse" />
                          $19
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
      </div>
    </div>
  );
}
