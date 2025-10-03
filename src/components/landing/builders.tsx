import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { IconRosetteDiscountCheck } from "@tabler/icons-react";
import Image from "next/image";
import AppAge from "./age";
import { getBuildersData, getUsersCount } from "@/app/data/profile";
import { unstable_cache } from "next/cache";

// Cached version of getBuildersData with 1-hour revalidation
const getCachedBuildersData = unstable_cache(
  async (limit: number) => {
    return await getBuildersData(limit);
  },
  ["builders-data"],
  {
    revalidate: 3600, // 1 hour in seconds
    tags: ["builders"],
  }
);

export async function Builders() {
  const buildersResponse = await getCachedBuildersData(100); // Get 10 builders (3x3 grid minus 1 for the empty card)
  const builders = buildersResponse.success ? buildersResponse.data : [];

  const count = await getUsersCount();

  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative py-16 md:py-24" id="builders">
      <div className="mx-auto max-w-5xl px-6">
        {/* Builders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {builders?.map((builder) => (
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
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl border bg-background overflow-hidden">
                    {builder.avatar ? (
                      <Image
                        src={builder.avatar}
                        alt={builder.name || builder.username || "User"}
                        className="w-full h-full object-cover"
                        width={48}
                        height={48}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-medium">
                        {getInitials(builder.name || builder.username || "U")}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground truncate">
                      {builder.name || builder.username}
                    </span>
                    {builder.verified && (
                      <IconRosetteDiscountCheck className="h-4 w-4 fill-blue-500 flex-shrink-0 text-white" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    @{builder.username}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            <Link href="/builders" className="hover:text-primary font-semibold">
              {count}+
            </Link>
            founders and counting...
          </p>
        </div>
      </div>
    </div>
  );
}

// Cursor rules applied correctly.
