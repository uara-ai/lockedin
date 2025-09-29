import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SidebarLeft } from "@/components/feed/sidebar-left";
import { SidebarRight } from "@/components/feed/sidebar-right";
import { FeedHeader } from "@/components/feed/header";

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <SidebarLeft />
      <SidebarInset>
        <FeedHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 space-y-4">
          {children}
        </main>
      </SidebarInset>
      <SidebarRight />
    </SidebarProvider>
  );
}
