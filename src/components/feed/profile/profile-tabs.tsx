"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { IconUser, IconFlame } from "@tabler/icons-react";
import { useQueryState, parseAsString } from "nuqs";

export function ProfileTabs({
  notes,
  stats,
}: {
  notes: React.ReactNode;
  stats: React.ReactNode;
}) {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsString.withDefault("notes")
  );

  return (
    <div className="w-full">
      <Tabs
        value={tab}
        onValueChange={setTab}
        className="w-full flex flex-col gap-2"
      >
        <TabsList className="w-full gap-8">
          <TabsTrigger value="notes">
            <IconUser className="h-4 w-4" />
            <span className="hidden sm:inline">Notes</span>
            <span className="sm:hidden">Notes</span>
          </TabsTrigger>
          <TabsTrigger value="stats">
            <IconFlame className="h-4 w-4" />
            <span className="hidden sm:inline">Activity</span>
            <span className="sm:hidden">Activity</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes">{notes}</TabsContent>

        <TabsContent value="stats">{stats}</TabsContent>
      </Tabs>
    </div>
  );
}
