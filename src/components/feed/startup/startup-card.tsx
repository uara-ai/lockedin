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
  IconEdit,
  IconTrash,
  IconExternalLink,
  IconCalendar,
  IconUsers,
  IconTrendingUp,
  IconRocket,
} from "@tabler/icons-react";
import { type StartupWithDetails, deleteStartup } from "@/app/data/startups";
import { StartupForm } from "./startup-form";
import { getFaviconWithFallback } from "@/lib/favicon";
import { toast } from "sonner";

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
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number | null) => {
    if (!num) return null;
    return new Intl.NumberFormat("en-US").format(num);
  };

  return (
    <>
      <div className="w-full border-b pb-6 mb-6 last:border-b-0 last:pb-0 last:mb-0">
        {/* Header with Logo/Favicon, Name and Action Buttons */}
        <div className="mb-4 flex items-center gap-3">
          {/* Logo/Favicon */}
          {startup.website && (
            <div className="w-12 h-12 rounded-lg border bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                src={getFaviconWithFallback(startup.website, 32).primary}
                alt={`${startup.name} favicon`}
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = getFaviconWithFallback(
                    startup.website || "",
                    32
                  ).fallback;
                }}
              />
            </div>
          )}

          {/* Name, Tagline and Status */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-foreground truncate">
                {startup.name}
              </h3>
              {startup.isFeatured && (
                <Badge variant="default" className="text-xs">
                  Featured
                </Badge>
              )}
            </div>
            {startup.tagline && (
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {startup.tagline}
              </p>
            )}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs capitalize">
                {startup.status.replace("_", " ").toLowerCase()}
              </Badge>
              <Badge variant="secondary" className="text-xs capitalize">
                {startup.stage.replace("_", " ").toLowerCase()}
              </Badge>
              {startup.industry && (
                <Badge variant="outline" className="text-xs">
                  {startup.industry}
                </Badge>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {isOwner && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditForm(true)}
                className="h-8 w-8 p-0"
              >
                <IconEdit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <IconTrash className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Description */}
        {startup.description && (
          <p className="text-sm text-foreground mb-3 leading-relaxed">
            {startup.description}
          </p>
        )}

        {/* Metrics and Details */}
        <div className="space-y-2 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-4 flex-wrap">
            {startup.revenue !== null && (
              <div className="flex items-center gap-2">
                <IconTrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-semibold text-foreground">
                  {formatCurrency(startup.revenue)}
                </span>
                <span>revenue</span>
              </div>
            )}

            {startup.employees !== null && (
              <div className="flex items-center gap-2">
                <IconUsers className="h-4 w-4 text-blue-500" />
                <span className="font-semibold text-foreground">
                  {formatNumber(startup.employees)}
                </span>
                <span>team</span>
              </div>
            )}

            {startup.funding !== null && (
              <div className="flex items-center gap-2">
                <IconRocket className="h-4 w-4 text-purple-500" />
                <span className="font-semibold text-foreground">
                  {formatCurrency(startup.funding)}
                </span>
                <span>funding</span>
              </div>
            )}

            {startup.foundedAt && (
              <div className="flex items-center gap-2">
                <IconCalendar className="h-4 w-4 text-orange-500" />
                <span>Founded {new Date(startup.foundedAt).getFullYear()}</span>
              </div>
            )}

            {startup._count.milestones > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  {startup._count.milestones}
                </span>
                <span>
                  milestone{startup._count.milestones !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          {/* Tech Stack */}
          {startup.techStack.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Tech:</span>
              {startup.techStack.slice(0, 4).map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
              {startup.techStack.length > 4 && (
                <span className="text-xs text-muted-foreground">
                  +{startup.techStack.length - 4} more
                </span>
              )}
            </div>
          )}

          {/* Links */}
          <div className="flex items-center gap-4 flex-wrap">
            {startup.website && (
              <a
                href={startup.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-500 hover:underline text-sm"
              >
                <IconExternalLink className="h-3 w-3" />
                Website
              </a>
            )}

            {startup.githubRepo && (
              <a
                href={startup.githubRepo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-500 hover:underline text-sm"
              >
                <IconExternalLink className="h-3 w-3" />
                GitHub
              </a>
            )}

            {startup.twitterHandle && (
              <a
                href={`https://twitter.com/${startup.twitterHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-500 hover:underline text-sm"
              >
                <IconExternalLink className="h-3 w-3" />
                Twitter
              </a>
            )}

            {startup.linkedinUrl && (
              <a
                href={startup.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-500 hover:underline text-sm"
              >
                <IconExternalLink className="h-3 w-3" />
                LinkedIn
              </a>
            )}
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
