import { AnimatedGroup } from "../ui/animated-group";
import { Button } from "../ui/button";
import Link from "next/link";
import { IconComponents } from "@tabler/icons-react";

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
          <Link href="/feed">
            <span className="text-nowrap flex items-center gap-2">
              <IconComponents className="size-4 mr-2" />
              Explore Commodo
            </span>
          </Link>
        </Button>
      </div>
    </AnimatedGroup>
  );
}
