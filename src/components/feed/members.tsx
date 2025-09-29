import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { getUsersCount } from "@/app/data/profile";
import { IconBulb } from "@tabler/icons-react";

export async function Members() {
  const membersCount = await getUsersCount();

  // Format number for display
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <SidebarGroup className="px-0">
      <SidebarGroupContent>
        <div className="p-3">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <IconBulb className="h-4 w-4 text-yellow-500" />
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xl font-bold text-orange-500">
                {formatNumber(membersCount)}
              </div>
              <div className="text-xs text-muted-foreground">
                members joined
              </div>
            </div>
          </div>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

// Cursor rules applied correctly.
