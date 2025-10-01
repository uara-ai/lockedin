import { Button } from "@/components/ui/button";
import Link from "next/link";

export function SponsorEmptyState() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4">No startups found</h1>
        <p className="text-muted-foreground mb-6">
          You need to create a startup first before you can sponsor it.
        </p>
        <Button asChild>
          <Link href="/profile/edit">Create Startup</Link>
        </Button>
      </div>
    </div>
  );
}
