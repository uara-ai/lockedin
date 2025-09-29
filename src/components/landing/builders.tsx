import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { IconRosetteDiscountCheck } from "@tabler/icons-react";
import Image from "next/image";
import { Members } from "../feed/members";

// Mock builders data - this would come from your database
const mockBuilders = [
  {
    id: "1",
    username: "fed",
    name: "Fed",
    avatar: "/fed.jpg",
    verified: true,
    revenue: 0,
    bio: "i'm the boss of this app. currently alone :(",
    streak: Math.floor(
      (Date.now() - new Date("2025-09-28").getTime()) / (1000 * 60 * 60 * 24)
    ),
  },
];

export function Builders() {
  const builders = mockBuilders;

  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  return (
    <div className="relative py-16 md:py-24" id="builders">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center mb-12 max-w-sm mx-auto">
          <h2 className="text-3xl font-bold md:text-4xl mb-4">
            Follow who&apos;s shipping
          </h2>
          <Members />
        </div>

        {/* Builders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {builders.map((builder) => (
            <Link
              key={builder.id}
              href={`/${builder.username}`}
              className={cn(
                "group p-6 rounded-2xl border bg-card transition-all duration-200",
                "hover:shadow-lg hover:border-muted-foreground/50",
                "cursor-pointer"
              )}
            >
              {/* Avatar and basic info */}
              <div className="flex items-start gap-4 mb-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl border bg-background overflow-hidden">
                    {builder.avatar ? (
                      <Image
                        src={builder.avatar}
                        alt={builder.name}
                        className="w-full h-full object-cover"
                        width={48}
                        height={48}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-medium">
                        {getInitials(builder.name)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground truncate">
                      {builder.name}
                    </span>
                    {builder.verified && (
                      <IconRosetteDiscountCheck className="h-4 w-4 fill-blue-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    @{builder.username}
                  </p>
                </div>
              </div>

              {/* Bio */}
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {builder.bio}
              </p>

              {/* Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-sm font-semibold text-green-600">
                      {formatCurrency(builder.revenue)}
                    </div>
                    <div className="text-xs text-muted-foreground">revenue</div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold flex items-center gap-1">
                      <Flame className="h-3 w-3 text-orange-500 fill-current" />
                      {builder.streak}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      day streak
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  View profile →
                </div>
              </div>
            </Link>
          ))}

          {/* Empty dotted card */}
          <Link
            href="/login"
            className={cn(
              "group p-6 rounded-2xl border-2 border-dashed border-muted-foreground/30",
              "bg-muted/20 hover:bg-muted/40 transition-all duration-200",
              "hover:border-muted-foreground/50 cursor-pointer",
              "flex flex-col items-center justify-center text-center"
            )}
          >
            <div className="mb-4">
              <div className="w-12 h-12 rounded-xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                <span className="text-2xl">?</span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">maybe you?</h3>
              <p className="text-sm text-muted-foreground">
                Join our builder community
              </p>
            </div>
          </Link>
        </div>

        {/* Call to action */}
        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <Button variant="outline" asChild size="lg">
              <Link href="/feed">
                <Flame className="h-4 w-4 mr-2 text-orange-500 fill-current" />
                View all builders
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Cursor rules applied correctly.
