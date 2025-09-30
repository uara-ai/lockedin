import { AnimatedGroup } from "../ui/animated-group";
import { Button } from "../ui/button";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { Flame } from "lucide-react";
import { GithubStars } from "../github-stars";

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring" as const,
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
} as const;

export default function SmallCTA() {
  return (
    <AnimatedGroup
      variants={{
        container: {
          visible: {
            transition: {
              staggerChildren: 0.05,
              delayChildren: 0.75,
            },
          },
        },
        ...transitionVariants,
      }}
      className="mt-12 flex flex-col items-center justify-center gap-4 md:flex-row"
    >
      <div
        key={1}
        className="bg-foreground/10 rounded-[calc(var(--radius-xl)+0.125rem)] border p-0.5"
      >
        <Button asChild size="lg" className="rounded-xl px-5 text-base">
          <Link href="/login">
            <span className="text-nowrap flex items-center gap-2">
              Join early{" "}
              <Badge variant="info">
                <Flame className="size-4 fill-white animate-pulse" />
                FREE
              </Badge>
            </span>
          </Link>
        </Button>
      </div>
    </AnimatedGroup>
  );
}
