"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IconEdit,
  IconTrash,
  IconUsers,
  IconRocket,
  IconGitBranch,
  IconStar,
  IconFlame,
  IconTarget,
  IconWorld,
  IconTax,
} from "@tabler/icons-react";
import { type StartupWithDetails, deleteStartup } from "@/app/data/startups";
import { StartupForm } from "./startup-form";
import { toast } from "sonner";
import { FaviconImage } from "@/components/ui/favicon-image";
import { cn } from "@/lib/utils";

interface StartupCardProps {
  startup: StartupWithDetails;
  isOwner?: boolean;
  onUpdate?: () => void;
}

export function StartupCard({
  startup,
  isOwner = false,
  onUpdate,
}: StartupCardProps) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await deleteStartup(startup.id);
      if (response.success) {
        toast.success("Startup deleted successfully");
        onUpdate?.();
      } else {
        toast.error(response.error || "Failed to delete startup");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return null;
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  const formatNumber = (num: number | null) => {
    if (!num) return null;
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  };

  // Calculate progress scores for visualization
  const getProgressScore = (current: number | null, max: number = 100) => {
    if (!current) return 0;
    return Math.min((current / max) * 100, 100);
  };

  const getMetricColor = (type: string) => {
    switch (type) {
      case "revenue":
        return "text-green-500";
      case "funding":
        return "text-purple-500";
      case "employees":
        return "text-blue-500";
      case "milestones":
        return "text-orange-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <>
      <div
        className={cn(
          "group/startup p-3 sm:p-4 rounded-lg transition-all duration-200",
          "border border-transparent hover:border-border hover:bg-muted/30",
          "space-y-3 w-full"
        )}
      >
        {/* Header Section - Similar to Featured component */}
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Logo/Favicon */}
          <div className="relative flex-shrink-0">
            <div
              className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 overflow-hidden",
                "bg-background transition-all duration-200",
                startup.isFeatured
                  ? "border-orange-500/50 hover:border-orange-500 shadow-orange-500/20"
                  : "border-border hover:border-muted-foreground/50"
              )}
            >
              {startup.website ? (
                <FaviconImage
                  url={startup.website}
                  alt={`${startup.name} favicon`}
                  size={40}
                  className="w-full h-full object-contain p-1"
                  fallbackText={startup.name.substring(0, 2).toUpperCase()}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-medium">
                  {startup.name.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            {startup.isFeatured && (
              <div className="absolute -top-1 -right-1">
                <Tooltip>
                  <TooltipTrigger>
                    <IconStar className="h-4 w-4 fill-orange-500 text-orange-500" />
                  </TooltipTrigger>
                  <TooltipContent>Featured Startup</TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Name and Status */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="capitalize text-sm font-semibold text-foreground truncate">
                {startup.name}
              </h3>
              <Badge variant="outline" className="text-xs capitalize">
                {startup.status.replace("_", " ").toLowerCase()}
              </Badge>
            </div>

            {/* Tagline */}
            {startup.tagline && (
              <p className="capitalize text-xs text-muted-foreground mb-2 line-clamp-1">
                {startup.tagline}
              </p>
            )}

            {/* Tag */}
            {startup.tag && (
              <div className="mb-2">
                <Badge variant="secondary" className="text-xs">
                  {startup.tag}
                </Badge>
              </div>
            )}

            {/* Key Metrics - Responsive Dashboard Style */}
            <div className="flex items-center gap-2 sm:gap-4 text-xs flex-wrap">
              {startup.revenue !== null && (
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-1 bg-green-50/80 dark:bg-green-950/20 px-2 py-1 rounded-md border border-green-200/50 dark:border-green-800/50">
                      <IconTax className="h-3 w-3 text-green-500" />
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(startup.revenue)}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Monthly Revenue</TooltipContent>
                </Tooltip>
              )}

              {startup.employees !== null && (
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-1 bg-blue-50/80 dark:bg-blue-950/20 px-2 py-1 rounded-md border border-blue-200/50 dark:border-blue-800/50">
                      <IconUsers className="h-3 w-3 text-blue-500" />
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {formatNumber(startup.employees)}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Team Size</TooltipContent>
                </Tooltip>
              )}

              {startup.funding !== null && startup.funding > 0 && (
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-1 bg-purple-50/80 dark:bg-purple-950/20 px-2 py-1 rounded-md border border-purple-200/50 dark:border-purple-800/50">
                      <IconRocket className="h-3 w-3 text-purple-500" />
                      <span className="font-medium text-purple-600 dark:text-purple-400">
                        {formatCurrency(startup.funding)}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Total Funding</TooltipContent>
                </Tooltip>
              )}

              {startup._count.milestones > 0 && (
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-1 bg-orange-50/80 dark:bg-orange-950/20 px-2 py-1 rounded-md border border-orange-200/50 dark:border-orange-800/50">
                      <IconTarget className="h-3 w-3 text-orange-500" />
                      <span className="font-medium text-orange-600 dark:text-orange-400">
                        {startup._count.milestones}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Milestones Achieved</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1">
            {isOwner && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowEditForm(true)}
                      className="h-7 w-7 p-0 opacity-0 group-hover/startup:opacity-100 transition-opacity"
                    >
                      <IconEdit className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit Startup</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteDialog(true)}
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive opacity-0 group-hover/startup:opacity-100 transition-opacity"
                    >
                      <IconTrash className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete Startup</TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </div>

        {/* Expanded Details - Minimal Version */}
        <div className="space-y-2">
          {/* Description */}
          {startup.description && (
            <p className="capitalize text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {startup.description}
            </p>
          )}

          {/* Tech Stack Indicators */}
          {startup.techStack.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {startup.techStack.slice(0, 3).map((tech) => (
                <Badge
                  key={tech}
                  variant="secondary"
                  className="text-xs h-5 px-2"
                >
                  {tech}
                </Badge>
              ))}
              {startup.techStack.length > 3 && (
                <span className="capitalize text-xs text-muted-foreground">
                  +{startup.techStack.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Progress Indicators */}
          <div className="space-y-1">
            {/* Stage Progress */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <IconFlame className="h-3 w-3 text-orange-400" />
                <span className="capitalize text-muted-foreground">Stage:</span>
                <Badge
                  variant="outline"
                  className="text-xs h-5 px-2 capitalize"
                >
                  {startup.stage.replace("_", " ").toLowerCase()}
                </Badge>
              </div>
              {startup.foundedAt && (
                <span className="text-muted-foreground">
                  {new Date(startup.foundedAt).getFullYear()}
                </span>
              )}
            </div>

            {/* Quick Links */}
            <div className="flex items-center gap-3 text-xs">
              {startup.website && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={startup.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-muted-foreground hover:text-blue-500 transition-colors"
                    >
                      <IconWorld className="h-3 w-3" />
                      <span>Site</span>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>Visit Website</TooltipContent>
                </Tooltip>
              )}

              {startup.githubRepo && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={startup.githubRepo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-muted-foreground hover:text-blue-500 transition-colors"
                    >
                      <IconGitBranch className="h-3 w-3" />
                      <span>Code</span>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>View Repository</TooltipContent>
                </Tooltip>
              )}

              {startup.industry && (
                <span className="text-muted-foreground">
                  {startup.industry}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <StartupForm
        startup={startup}
        open={showEditForm}
        onOpenChange={setShowEditForm}
        onSuccess={onUpdate}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Startup</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{startup.name}&quot;? This
              action cannot be undone and will also delete all associated
              milestones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Cursor rules applied correctly.
