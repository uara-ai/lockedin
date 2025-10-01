import { notFound } from "next/navigation";
import { getStartupBySlug } from "@/app/data/startups";
import { StartupCard } from "@/components/feed/startup/startup-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  IconWorld,
  IconGitBranch,
  IconBrandTwitter,
  IconBrandLinkedin,
  IconUsers,
  IconRocket,
  IconTax,
  IconTarget,
  IconCalendar,
  IconBuilding,
} from "@tabler/icons-react";
import { FaviconImage } from "@/components/ui/favicon-image";
import Link from "next/link";

interface StartupPageProps {
  params: {
    slug: string;
  };
}

export default async function StartupPage({ params }: StartupPageProps) {
  const { slug } = await params;

  const startupResponse = await getStartupBySlug(slug);

  if (!startupResponse.success || !startupResponse.data) {
    notFound();
  }

  const startup = startupResponse.data;

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

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Header Section */}
      <div className="flex items-start gap-6">
        {/* Logo */}
        <div className="flex-shrink-0">
          <div
            className={`w-20 h-20 rounded-xl border-2 overflow-hidden ${
              startup.isFeatured
                ? "border-orange-500/50 shadow-orange-500/20"
                : "border-border"
            }`}
          >
            {startup.website ? (
              <FaviconImage
                url={startup.website}
                alt={`${startup.name} favicon`}
                size={80}
                className="w-full h-full object-contain p-2"
                fallbackText={startup.name.substring(0, 2).toUpperCase()}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold bg-muted">
                {startup.name.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">
              {startup.name}
            </h1>
            {startup.isFeatured && (
              <Badge className="bg-orange-500 text-white">Featured</Badge>
            )}
          </div>

          {startup.tagline && (
            <p className="text-lg text-muted-foreground mb-3">
              {startup.tagline}
            </p>
          )}

          {startup.tag && (
            <div className="mb-4">
              <Badge variant="secondary" className="text-sm">
                {startup.tag}
              </Badge>
            </div>
          )}

          {/* Status and Stage */}
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="capitalize">
              {startup.status.replace("_", " ").toLowerCase()}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {startup.stage.replace("_", " ").toLowerCase()}
            </Badge>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {startup.revenue !== null && (
              <div className="flex items-center gap-2 bg-green-50/80 dark:bg-green-950/20 px-3 py-2 rounded-lg border border-green-200/50 dark:border-green-800/50">
                <IconTax className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Revenue
                  </p>
                  <p className="font-semibold text-green-700 dark:text-green-300">
                    {formatCurrency(startup.revenue)}
                  </p>
                </div>
              </div>
            )}

            {startup.employees !== null && (
              <div className="flex items-center gap-2 bg-blue-50/80 dark:bg-blue-950/20 px-3 py-2 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                <IconUsers className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Team
                  </p>
                  <p className="font-semibold text-blue-700 dark:text-blue-300">
                    {formatNumber(startup.employees)}
                  </p>
                </div>
              </div>
            )}

            {startup.funding !== null && startup.funding > 0 && (
              <div className="flex items-center gap-2 bg-purple-50/80 dark:bg-purple-950/20 px-3 py-2 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                <IconRocket className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    Funding
                  </p>
                  <p className="font-semibold text-purple-700 dark:text-purple-300">
                    {formatCurrency(startup.funding)}
                  </p>
                </div>
              </div>
            )}

            {startup._count.milestones > 0 && (
              <div className="flex items-center gap-2 bg-orange-50/80 dark:bg-orange-950/20 px-3 py-2 rounded-lg border border-orange-200/50 dark:border-orange-800/50">
                <IconTarget className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    Milestones
                  </p>
                  <p className="font-semibold text-orange-700 dark:text-orange-300">
                    {startup._count.milestones}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Description */}
      {startup.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {startup.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tech Stack */}
      {startup.techStack.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tech Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {startup.techStack.map((tech) => (
                <Badge key={tech} variant="secondary" className="text-sm">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Company Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {startup.foundedAt && (
              <div className="flex items-center gap-2">
                <IconCalendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Founded {new Date(startup.foundedAt).getFullYear()}
                </span>
              </div>
            )}

            {startup.industry && (
              <div className="flex items-center gap-2">
                <IconBuilding className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{startup.industry}</span>
              </div>
            )}

            {startup.valuation && (
              <div className="flex items-center gap-2">
                <IconRocket className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Valuation: {formatCurrency(startup.valuation)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {startup.website && (
              <Button
                variant="outline"
                asChild
                className="w-full justify-start"
              >
                <a
                  href={startup.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <IconWorld className="h-4 w-4" />
                  Website
                </a>
              </Button>
            )}

            {startup.githubRepo && (
              <Button
                variant="outline"
                asChild
                className="w-full justify-start"
              >
                <a
                  href={startup.githubRepo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <IconGitBranch className="h-4 w-4" />
                  GitHub Repository
                </a>
              </Button>
            )}

            {startup.twitterHandle && (
              <Button
                variant="outline"
                asChild
                className="w-full justify-start"
              >
                <a
                  href={`https://twitter.com/${startup.twitterHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <IconBrandTwitter className="h-4 w-4" />@
                  {startup.twitterHandle}
                </a>
              </Button>
            )}

            {startup.linkedinUrl && (
              <Button
                variant="outline"
                asChild
                className="w-full justify-start"
              >
                <a
                  href={startup.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <IconBrandLinkedin className="h-4 w-4" />
                  LinkedIn
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Founder Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Founded by</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {startup.user.avatar ? (
              <img
                src={startup.user.avatar}
                alt={startup.user.name || startup.user.username || "Founder"}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                {(startup.user.name || startup.user.username || "F")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium">
                {startup.user.name || startup.user.username || "Anonymous"}
              </p>
              {startup.user.username && (
                <Link
                  href={`/${startup.user.username}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  @{startup.user.username}
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: StartupPageProps) {
  const { slug } = await params;
  const startupResponse = await getStartupBySlug(slug);

  if (!startupResponse.success || !startupResponse.data) {
    return {
      title: "Startup Not Found",
    };
  }

  const startup = startupResponse.data;

  return {
    title: `${startup.name} - LockedIn`,
    description:
      startup.tagline ||
      startup.description ||
      `Learn more about ${startup.name}`,
    openGraph: {
      title: `${startup.name} - LockedIn`,
      description:
        startup.tagline ||
        startup.description ||
        `Learn more about ${startup.name}`,
      type: "website",
    },
  };
}
