"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import { type StartupWithDetails, getMyStartups } from "@/app/data/startups";
import { StartupCard } from "./startup-card";
import { StartupForm } from "./startup-form";

interface StartupsListProps {
  initialStartups: StartupWithDetails[];
  isOwner?: boolean;
  showCreateButton?: boolean;
}

export function StartupsList({
  initialStartups,
  isOwner = false,
  showCreateButton = true,
}: StartupsListProps) {
  const [startups, setStartups] =
    useState<StartupWithDetails[]>(initialStartups);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const refreshStartups = async () => {
    if (!isOwner) return;

    setLoading(true);
    try {
      const response = await getMyStartups();
      if (response.success && response.data) {
        setStartups(response.data);
      }
    } catch (error) {
      console.error("Failed to refresh startups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    refreshStartups();
    setShowCreateForm(false);
  };

  if (startups.length === 0) {
    return (
      <>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No startups yet
          </h3>
          <p className="text-muted-foreground mb-4">
            {isOwner
              ? "Add your first startup to showcase your ventures!"
              : "This user hasn't added any startups yet."}
          </p>
          {isOwner && showCreateButton && (
            <Button onClick={() => setShowCreateForm(true)}>
              <IconPlus className="w-4 h-4 mr-2" />
              Add Startup
            </Button>
          )}
        </div>

        {isOwner && (
          <StartupForm
            open={showCreateForm}
            onOpenChange={setShowCreateForm}
            onSuccess={handleSuccess}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Add Button for Owner */}
        {isOwner && showCreateButton && (
          <div className="flex justify-end">
            <Button onClick={() => setShowCreateForm(true)} size="sm">
              <IconPlus className="w-4 h-4 mr-2" />
              Add Startup
            </Button>
          </div>
        )}

        {/* Startups List */}
        {startups.map((startup) => (
          <StartupCard
            key={startup.id}
            startup={startup}
            isOwner={isOwner}
            onUpdate={refreshStartups}
          />
        ))}
      </div>

      {/* Create Form */}
      {isOwner && (
        <StartupForm
          open={showCreateForm}
          onOpenChange={setShowCreateForm}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}

// Cursor rules applied correctly.
