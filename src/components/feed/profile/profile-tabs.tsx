"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { IconMessage, IconFlame, IconRocket } from "@tabler/icons-react";
import { useQueryState, parseAsString } from "nuqs";

export function ProfileTabs({
  posts,
  stats,
  startups,
}: {
  posts: React.ReactNode;
  stats: React.ReactNode;
  startups: React.ReactNode;
}) {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsString.withDefault("posts")
  );

  return (
    <div className="w-full">
      <Tabs
        value={tab}
        onValueChange={setTab}
        className="w-full flex flex-col gap-2"
      >
        <TabsList className="w-full gap-8">
          <TabsTrigger value="posts">
            <IconMessage className="h-4 w-4" />
            <span className="hidden sm:inline">Posts</span>
            <span className="sm:hidden">Posts</span>
          </TabsTrigger>
          <TabsTrigger value="stats">
            <IconFlame className="h-4 w-4" />
            <span className="hidden sm:inline">Activity</span>
            <span className="sm:hidden">Activity</span>
          </TabsTrigger>
          <TabsTrigger value="startups">
            <IconRocket className="h-4 w-4" />
            <span className="hidden sm:inline">Startups</span>
            <span className="sm:hidden">Startups</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts">{posts}</TabsContent>

        <TabsContent value="stats">{stats}</TabsContent>

        <TabsContent value="startups">{startups}</TabsContent>
      </Tabs>
    </div>
  );
}
