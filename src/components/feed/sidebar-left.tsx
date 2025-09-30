"use client";

import * as React from "react";
import {
  Blocks,
  Calendar,
  MessageCircleQuestion,
  Plus,
  Settings2,
  Trash2,
} from "lucide-react";

import { NavMain } from "@/components/feed/nav-main";
import { NavSecondary } from "@/components/feed/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import { NavUser } from "@/components/feed/nav-user";
import {
  IconBrandFeedly,
  IconBrandX,
  IconFlame,
  IconUser,
  IconPalette,
} from "@tabler/icons-react";
import { Button } from "../ui/button";
import Link from "next/link";

// This is sample data.
const data = {
  navMain: [
    {
      title: "Feed",
      url: "/feed",
      icon: IconBrandFeedly,
    },
    {
      title: "Featured",
      url: "/featured",
      icon: IconFlame,
    },
    {
      title: "Profile",
      url: "/profile",
      icon: IconUser,
    },
    {
      title: "Examples",
      url: "/examples",
      icon: IconPalette,
    },
  ],
  navSecondary: [
    {
      title: "Stay updated",
      url: "https://x.com/locked_fed",
      icon: IconBrandX,
    },
  ],
};

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <div className="py-4 px-2 border-b">
          <Logo />
        </div>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/feed/new">
            <Plus />
            New Post
          </Link>
        </Button>
        <NavMain items={data.navMain} />
      </SidebarHeader>
      <SidebarContent>
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
