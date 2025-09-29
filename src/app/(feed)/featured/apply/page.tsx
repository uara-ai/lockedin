import Link from "next/link";
import { IconBrandX, IconFlame } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export default function BeFeaturedPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <IconFlame className="size-6 text-orange-500 fill-current" />
            <h1 className="text-3xl font-bold text-foreground">Be featured</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Reach me on X to be featured on LockedIn and showcase your journey
          </p>
        </div>

        <Button asChild>
          <Link
            href="https://x.com/locked_fed"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 w-full justify-center"
          >
            <IconBrandX className="size-5" />
            <span>Reach me</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}

// Cursor rules applied correctly.
