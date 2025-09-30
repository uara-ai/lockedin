import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "../ui/breadcrumb";
import { Separator } from "../ui/separator";
import { SidebarTrigger } from "../ui/sidebar";
import { UsernameMenu } from "./username-menu";

export function FeedHeader() {
  return (
    <header className="bg-background sticky top-0 flex h-14 shrink-0 items-center gap-2 border-b">
      <div className="flex flex-1 items-center gap-2 px-3">
        {/* Left section - Sidebar trigger and breadcrumb */}
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
        </div>

        {/* Center section - Username search menu */}
        <div className="flex-1 flex justify-center max-w-md mx-auto">
          <UsernameMenu />
        </div>

        {/* Right section - Reserved for future items */}
        <div className="flex items-center gap-2">
          {/* Future: notifications, user menu, etc. */}
        </div>
      </div>
    </header>
  );
}
