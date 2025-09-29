"use client";

import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Plus, Github, Loader2, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import {
  getGitHubContributors,
  type GitHubContributor,
} from "@/app/data/github";
import Link from "next/link";

// Company logo component
const CompanyLogo = ({ company }: { company?: string }) => {
  if (!company) return null;

  // Generate initials from company name
  const getCompanyInitials = (companyName: string) => {
    return companyName
      .replace(/[^a-zA-Z\s]/g, "") // Remove special characters
      .split(" ")
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  };

  return (
    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-muted border border-background rounded-sm flex items-center justify-center text-[8px] font-bold text-muted-foreground">
      {getCompanyInitials(company)}
    </div>
  );
};

// Get tier-specific styling for contributors
const getContributorTierStyling = (tier?: string) => {
  switch (tier) {
    case "Gold":
      return "border-yellow-500/50 hover:border-yellow-500 shadow-yellow-500/20 hover:shadow-md";
    case "Silver":
      return "border-gray-400/50 hover:border-gray-400 shadow-gray-400/20 hover:shadow-md";
    case "Bronze":
      return "border-amber-600/50 hover:border-amber-600 shadow-amber-600/20 hover:shadow-md";
    default:
      return "border-border hover:border-muted-foreground/50";
  }
};

export function Contributors() {
  const [contributors, setContributors] = useState<GitHubContributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContributors = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await getGitHubContributors();

        if (result.success && result.data) {
          setContributors(result.data);
        } else {
          setError("Failed to fetch contributors");
        }
      } catch (err) {
        setError("Failed to fetch contributors");
        console.error("Error fetching contributors:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContributors();
  }, []);

  const hasContributors = contributors.length > 0;

  // Generate initials from GitHub username
  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <SidebarGroup className="px-0">
        <SidebarGroupContent>
          <div className="group/contributors p-3 [--cell-size:--spacing(8)] space-y-2">
            <h2 className="text-sm font-semibold text-foreground">
              Contributors
            </h2>
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Loading contributors...
              </p>
            </div>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (error || !hasContributors) {
    return (
      <SidebarGroup className="px-0">
        <SidebarGroupContent>
          <div className="group/contributors p-3 [--cell-size:--spacing(8)] space-y-2">
            <h2 className="text-sm font-semibold text-foreground">
              Contributors
            </h2>
            {/* Null state */}
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                <Github className="h-5 w-5 text-muted-foreground/50" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {error
                    ? "Failed to load contributors"
                    : "No contributors yet"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {error
                    ? "Check your connection and try again"
                    : "Contribute to see your profile here"}
                </p>
              </div>
              <Button variant="outline" size="sm" className="text-xs" asChild>
                <Link
                  href="https://github.com/uara-ai/lockedin"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-3 w-3 mr-1" />
                  Contribute on GitHub
                </Link>
              </Button>
            </div>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup className="px-0">
      <SidebarGroupContent>
        <div className="group/contributors p-3 [--cell-size:--spacing(8)] space-y-2">
          <h2 className="text-sm font-semibold text-foreground">
            Contributors
          </h2>

          {/* Grid container with similar structure to calendar */}
          <div className="grid grid-cols-7 gap-2">
            {contributors.slice(0, 13).map((contributor) => (
              <Tooltip key={contributor.id}>
                <TooltipTrigger asChild>
                  <Link
                    href={contributor.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "relative w-full h-full p-0 text-center group/contributor aspect-square select-none",
                      "flex items-center justify-center rounded-full text-xs font-medium",
                      "border-2 bg-background text-foreground transition-all duration-200",
                      "hover:bg-muted cursor-pointer",
                      "w-[33px] min-w-[--cell-size] overflow-hidden", // Same width as calendar cells
                      getContributorTierStyling(contributor.tier)
                    )}
                  >
                    {contributor.avatar_url ? (
                      <img
                        src={contributor.avatar_url}
                        alt={contributor.login}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      getInitials(contributor.login)
                    )}
                    <CompanyLogo company={contributor.company} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <div className="flex items-center gap-1 justify-center">
                      <span className="font-medium">@{contributor.login}</span>
                      {contributor.tier && (
                        <span
                          className={cn(
                            "text-[8px] px-1 py-0.5 rounded font-medium",
                            contributor.tier === "Gold" &&
                              "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
                            contributor.tier === "Silver" &&
                              "bg-gray-400/20 text-gray-700 dark:text-gray-300",
                            contributor.tier === "Bronze" &&
                              "bg-amber-600/20 text-amber-700 dark:text-amber-300"
                          )}
                        >
                          {contributor.tier}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {contributor.contributions} contributions
                    </p>
                    {contributor.company && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center">
                        <Building2 className="h-2.5 w-2.5" />
                        {contributor.company}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}

            {/* Add contributor button or view more button */}
            <Tooltip>
              <TooltipTrigger asChild>
                {contributors.length > 13 ? (
                  <Link
                    href="https://github.com/uara-ai/lockedin/graphs/contributors"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "relative w-full h-full p-0 aspect-square select-none",
                      "flex items-center justify-center rounded-full border-dashed",
                      "border-2 border-muted-foreground/30 bg-background text-muted-foreground",
                      "hover:bg-muted hover:border-muted-foreground/50 transition-colors",
                      "w-[33px] min-w-[--cell-size] text-xs font-medium"
                    )}
                  >
                    +{contributors.length - 13}
                  </Link>
                ) : (
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      "relative w-full h-full p-0 aspect-square select-none",
                      "flex items-center justify-center rounded-full border-dashed",
                      "border-2 border-muted-foreground/30 bg-background text-muted-foreground",
                      "hover:bg-muted hover:border-muted-foreground/50 transition-colors",
                      "w-[33px] min-w-[--cell-size]"
                    )}
                    asChild
                  >
                    <Link
                      href="https://github.com/uara-ai/lockedin"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Plus className="h-3 w-3" />
                    </Link>
                  </Button>
                )}
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {contributors.length > 13
                    ? "View all contributors on GitHub"
                    : "Contribute to this project"}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
