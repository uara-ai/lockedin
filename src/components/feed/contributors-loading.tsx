import { Skeleton } from "@/components/ui/skeleton";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function ContributorsLoading() {
  return (
    <SidebarGroup className="px-0">
      <SidebarGroupContent>
        <div className="group/contributors p-3 [--cell-size:--spacing(8)] space-y-2">
          <h2 className="text-sm font-semibold text-foreground">
            Contributors
          </h2>

          {/* Grid skeleton with EXACT same structure as contributors.tsx */}
          <div className="grid grid-cols-7 gap-2">
            {/* Contributor item skeletons - simulate up to 13 contributors */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "relative w-full h-full p-0 text-center group/contributor aspect-square select-none",
                  "flex items-center justify-center rounded-full text-xs font-medium",
                  "border-2 bg-background text-foreground transition-all duration-200",
                  "w-[33px] min-w-[--cell-size] overflow-hidden",
                  i % 3 === 0 && "border-yellow-500/20", // Gold
                  i % 3 === 1 && "border-gray-400/20", // Silver
                  i % 3 === 2 && "border-amber-600/20" // Bronze
                )}
              >
                <Skeleton className="w-full h-full rounded-full" />
              </div>
            ))}

            {/* Add contributor button skeleton */}
            <div
              className={cn(
                "relative w-full h-full p-0 aspect-square select-none",
                "flex items-center justify-center rounded-full border-dashed",
                "border-2 border-muted-foreground/30 bg-background text-muted-foreground",
                "w-[33px] min-w-[--cell-size] text-xs font-medium"
              )}
            >
              <Skeleton className="w-full h-full rounded-full" />
            </div>
          </div>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
