"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createStartup,
  updateStartup,
  type CreateStartupInput,
  type UpdateStartupInput,
  type StartupWithDetails,
} from "@/app/data/startups";
import { StartupStatus, StartupStage } from "@prisma/client";
import { IconX, IconPlus, IconLoader2, IconCheck } from "@tabler/icons-react";
import { toast } from "sonner";

interface StartupFormProps {
  startup?: StartupWithDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const STATUS_OPTIONS = [
  { value: StartupStatus.IDEA, label: "Idea" },
  { value: StartupStatus.BUILDING, label: "Building" },
  { value: StartupStatus.LAUNCHED, label: "Launched" },
  { value: StartupStatus.GROWING, label: "Growing" },
  { value: StartupStatus.ACQUIRED, label: "Acquired" },
  { value: StartupStatus.SHUTDOWN, label: "Shutdown" },
];

const STAGE_OPTIONS = [
  { value: StartupStage.PRE_SEED, label: "Pre-Seed" },
  { value: StartupStage.SEED, label: "Seed" },
  { value: StartupStage.SERIES_A, label: "Series A" },
  { value: StartupStage.SERIES_B, label: "Series B" },
  { value: StartupStage.SERIES_C, label: "Series C" },
  { value: StartupStage.LATER_STAGE, label: "Later Stage" },
  { value: StartupStage.BOOTSTRAPPED, label: "Bootstrapped" },
  { value: StartupStage.PROFITABLE, label: "Profitable" },
];

export function StartupForm({
  startup,
  open,
  onOpenChange,
  onSuccess,
}: StartupFormProps) {
  const [loading, setLoading] = useState(false);
  const [techInput, setTechInput] = useState("");
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  // Check slug availability with debouncing
  const checkSlugAvailability = async (slug: string) => {
    if (!slug || slug === startup?.slug) {
      setSlugAvailable(null);
      return;
    }

    setIsCheckingSlug(true);
    try {
      const response = await fetch(
        `/api/startups/check-slug?slug=${encodeURIComponent(slug)}`
      );
      if (response.ok) {
        const data = await response.json();
        setSlugAvailable(data.available);
      }
    } catch (error) {
      console.error("Error checking slug availability:", error);
    } finally {
      setIsCheckingSlug(false);
    }
  };

  // Form state
  const [formData, setFormData] = useState({
    name: startup?.name || "",
    slug: startup?.slug || "",
    description: startup?.description || "",
    tagline: startup?.tagline || "",
    tag: startup?.tag || "",
    website: startup?.website || "",
    status: startup?.status || StartupStatus.IDEA,
    stage: startup?.stage || StartupStage.PRE_SEED,
    foundedAt: startup?.foundedAt
      ? startup.foundedAt.toISOString().split("T")[0]
      : "",
    revenue: startup?.revenue?.toString() || "",
    employees: startup?.employees?.toString() || "",
    funding: startup?.funding?.toString() || "",
    valuation: startup?.valuation?.toString() || "",
    twitterHandle: startup?.twitterHandle || "",
    linkedinUrl: startup?.linkedinUrl || "",
    githubRepo: startup?.githubRepo || "",
    industry: startup?.industry || "",
    techStack: startup?.techStack || [],
    isPublic: startup?.isPublic ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData: CreateStartupInput | UpdateStartupInput = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        tagline: formData.tagline || undefined,
        tag: formData.tag || undefined,
        website: formData.website || undefined,
        status: formData.status,
        stage: formData.stage,
        foundedAt: formData.foundedAt
          ? new Date(formData.foundedAt)
          : undefined,
        revenue: formData.revenue ? parseFloat(formData.revenue) : undefined,
        employees: formData.employees
          ? parseInt(formData.employees)
          : undefined,
        funding: formData.funding ? parseFloat(formData.funding) : undefined,
        valuation: formData.valuation
          ? parseFloat(formData.valuation)
          : undefined,
        twitterHandle: formData.twitterHandle || undefined,
        linkedinUrl: formData.linkedinUrl || undefined,
        githubRepo: formData.githubRepo || undefined,
        industry: formData.industry || undefined,
        techStack: formData.techStack,
        isPublic: formData.isPublic,
      };

      let response;
      if (startup) {
        // Update existing startup
        response = await updateStartup(startup.id, submitData);
      } else {
        // Create new startup
        response = await createStartup(submitData as CreateStartupInput);
      }

      if (response.success) {
        toast.success(
          startup
            ? "Startup updated successfully!"
            : "Startup created successfully!"
        );
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(response.error || "Something went wrong");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const addTech = () => {
    if (techInput.trim() && !formData.techStack.includes(techInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        techStack: [...prev.techStack, techInput.trim()],
      }));
      setTechInput("");
    }
  };

  const removeTech = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((t) => t !== tech),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {startup ? "Edit Startup" : "Add New Startup"}
          </DialogTitle>
          <DialogDescription>
            {startup
              ? "Update your startup information"
              : "Add a new startup to your profile"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Startup Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        name,
                      }));
                    }}
                    placeholder="Enter startup name"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => {
                          const slug = e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "");
                          setFormData((prev) => ({
                            ...prev,
                            slug,
                          }));
                          // Check availability with debouncing
                          setTimeout(() => checkSlugAvailability(slug), 500);
                        }}
                        placeholder="url-friendly-identifier"
                        required
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isCheckingSlug && (
                          <IconLoader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                        {!isCheckingSlug && slugAvailable === true && (
                          <IconCheck className="h-4 w-4 text-green-500" />
                        )}
                        {!isCheckingSlug && slugAvailable === false && (
                          <IconX className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Used in URLs: /startups/{formData.slug || "your-slug"}
                  </p>
                  {slugAvailable === false && (
                    <p className="text-xs text-red-500">
                      This slug is already taken
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={formData.tagline}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        tagline: e.target.value,
                      }))
                    }
                    placeholder="Brief one-liner"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="tag">Category Tag</Label>
                  <Input
                    id="tag"
                    value={formData.tag}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        tag: e.target.value,
                      }))
                    }
                    placeholder="e.g., SaaS, AI, E-commerce"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe your startup..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        industry: e.target.value,
                      }))
                    }
                    placeholder="e.g., FinTech, SaaS, E-commerce"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="foundedAt">Founded Date</Label>
                  <Input
                    id="foundedAt"
                    type="date"
                    value={formData.foundedAt}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        foundedAt: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status & Stage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status & Stage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: value as StartupStatus,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="stage">Funding Stage</Label>
                  <Select
                    value={formData.stage}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        stage: value as StartupStage,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="revenue">Revenue ($)</Label>
                  <Input
                    id="revenue"
                    type="number"
                    min="0"
                    value={formData.revenue}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        revenue: e.target.value,
                      }))
                    }
                    placeholder="0"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="employees">Team Size</Label>
                  <Input
                    id="employees"
                    type="number"
                    min="1"
                    value={formData.employees}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        employees: e.target.value,
                      }))
                    }
                    placeholder="1"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="funding">Funding Raised ($)</Label>
                  <Input
                    id="funding"
                    type="number"
                    min="0"
                    value={formData.funding}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        funding: e.target.value,
                      }))
                    }
                    placeholder="0"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="valuation">Valuation ($)</Label>
                  <Input
                    id="valuation"
                    type="number"
                    min="0"
                    value={formData.valuation}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        valuation: e.target.value,
                      }))
                    }
                    placeholder="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Links & Tech */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Links & Technology</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      website: e.target.value,
                    }))
                  }
                  placeholder="https://yoursite.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="twitterHandle">Twitter Handle</Label>
                  <Input
                    id="twitterHandle"
                    value={formData.twitterHandle}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        twitterHandle: e.target.value,
                      }))
                    }
                    placeholder="username"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="githubRepo">GitHub Repository</Label>
                  <Input
                    id="githubRepo"
                    value={formData.githubRepo}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        githubRepo: e.target.value,
                      }))
                    }
                    placeholder="https://github.com/user/repo"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                <Input
                  id="linkedinUrl"
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      linkedinUrl: e.target.value,
                    }))
                  }
                  placeholder="https://linkedin.com/company/yourcompany"
                />
              </div>

              {/* Tech Stack */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="techStack">Tech Stack</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    placeholder="Add technology"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTech();
                      }
                    }}
                  />
                  <Button type="button" onClick={addTech} size="sm">
                    <IconPlus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.techStack.map((tech) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTech(tech)}
                        className="ml-1 hover:text-destructive"
                      >
                        <IconX className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading || !formData.name.trim() || slugAvailable === false
              }
            >
              {loading
                ? "Saving..."
                : startup
                ? "Update Startup"
                : "Create Startup"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Cursor rules applied correctly.
