"use client";

import React, { useState, useEffect } from "react";
import { IconBrandGithub, IconStar } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface GithubStarsProps {
  className?: string;
  showStars?: boolean;
}

export function GithubStars({ className, showStars = true }: GithubStarsProps) {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    if (!showStars) return;

    const fetchStars = async () => {
      try {
        const response = await fetch(
          "https://api.github.com/repos/uara-ai/lockedin"
        );
        const data = await response.json();
        setStars(data.stargazers_count || 0);
      } catch (error) {
        setStars(0);
      }
    };

    fetchStars();
  }, [showStars]);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* GitHub Link */}
      <Link
        href="https://github.com/uara-ai/lockedin"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-1.5 py-1.5 transition-colors"
      >
        {showStars && stars !== null && (
          <>
            <span className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
              <IconBrandGithub className={cn("size-4", className)} />
              {stars}
            </span>
          </>
        )}
      </Link>
    </div>
  );
}

// Cursor rules applied correctly.
