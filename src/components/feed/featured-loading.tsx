import { Skeleton } from "@/components/ui/skeleton";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export function FeaturedLoading() {
  return (
    <SidebarGroup className="px-0 h-full scrollbar-hide">
      <SidebarGroupContent>
        <div className="group/featured p-3 space-y-3">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <h2 className="text-sm font-semibold text-foreground">
                Founders
              </h2>
            </div>
            <Skeleton className="h-4 w-12" />
          </div>

          {/* Profile cards skeleton */}
          <div className="space-y-2 overflow-y-auto">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg",
                  "border border-transparent hover:border-border",
                  "bg-background transition-all duration-200"
                )}
              >
                {/* Avatar skeleton */}
                <div className="relative">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg border-2 overflow-hidden",
                      "bg-background transition-all duration-200",
                      i % 3 === 0 && "border-yellow-500/20",
                      i % 3 === 1 && "border-purple-500/20",
                      i % 3 === 2 && "border-blue-500/20"
                    )}
                  >
                    <Skeleton className="w-full h-full rounded-lg" />
                  </div>
                </div>

                {/* Content skeleton */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-3 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-20" />
                </div>

                {/* Streak skeleton */}
                <div className="text-right">
                  <Skeleton className="h-3 w-6 mb-1" />
                  <Skeleton className="h-3 w-8" />
                </div>
              </div>
            ))}

            {/* Join Now button skeleton */}
            <div
              className={cn(
                "flex items-center justify-center gap-2 p-2 rounded-lg",
                "border-2 border-dashed border-primary/30",
                "text-sm text-primary dark:text-primary transition-all duration-200",
                "font-medium"
              )}
            >
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
