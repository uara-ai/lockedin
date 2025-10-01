import { Skeleton } from "@/components/ui/skeleton";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function SponsorsLoading() {
  return (
    <SidebarGroup className="px-0">
      <SidebarGroupContent>
        <div>
          {/* Grid skeleton with EXACT same structure as sponsors.tsx */}
          <div className="grid grid-cols-7 gap-2">
            {/* Sponsor item skeletons - simulate up to 13 sponsors */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "relative w-full h-full p-0 text-center group/sponsor aspect-square select-none",
                  "flex items-center justify-center rounded-md text-xs font-medium overflow-hidden",
                  "border-2 bg-background text-foreground transition-all duration-200",
                  "w-[33px] min-w-[--cell-size]",
                  i % 3 === 0 && "border-blue-500/20", // Monthly
                  i % 3 === 1 && "border-green-500/20", // Annual
                  i % 3 === 2 && "border-purple-500/20" // Lifetime
                )}
              >
                <Skeleton className="w-full h-full rounded-md" />
              </div>
            ))}

            {/* Add sponsor button skeleton */}
            <div
              className={cn(
                "relative w-full h-full p-0 aspect-square select-none",
                "flex items-center justify-center rounded-md border-dashed",
                "border-2 border-muted-foreground/30 bg-background text-muted-foreground",
                "w-[33px] min-w-[--cell-size] text-xs font-medium"
              )}
            >
              <Skeleton className="w-full h-full rounded-md" />
            </div>
          </div>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
