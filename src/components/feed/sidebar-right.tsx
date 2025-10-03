import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Sponsors } from "./sponsors";
import { Contributors } from "./contributors";
import { SocialsHeader } from "./socials-header";
import Link from "next/link";
import { Featured } from "./featured";
// import { Members } from "./members";

export function SidebarRight({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="none"
      className="sticky top-0 hidden h-svh border-l lg:flex scrollbar-hide"
      {...props}
    >
      <SidebarHeader className="border-sidebar-border h-16 border-b">
        <SocialsHeader />
      </SidebarHeader>
      <SidebarContent className="scrollbar-hide">
        <Sponsors />
        <SidebarSeparator className="mx-0" />
        <Featured />
        <SidebarSeparator className="mx-0" />
        <Contributors />
        <SidebarSeparator className="mx-0" />
        {/* <Members /> */}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-xs justify-center text-muted-foreground">
              <Link
                href="https://github.com/uara-ai/lockedin/releases"
                target="_blank"
                rel="noopener noreferrer"
              >
                uara v0.0.1
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
