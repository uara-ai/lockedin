import { notFound } from "next/navigation";
import { getStartupBySlug } from "@/app/data/startups";
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
  IconBrandX,
  IconLeaf,
  IconArrowLeft,
} from "@tabler/icons-react";
import { FaviconImage } from "@/components/ui/favicon-image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
    <div className="w-full space-y-4 px-8">
      {/* Header Section */}
      <Button variant="ghost" size="sm" className="justify-end w-full" asChild>
        <Link href="/startups" className="flex items-center gap-2 text-sm">
          <IconArrowLeft className="h-4 w-4" />
          Go back
        </Link>
      </Button>
      <div className="mb-4 space-y-2">
        <div className="font-mono text-xs mb-1 text-primary">Startup</div>
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div
              className={`w-16 h-16 rounded-xl border overflow-hidden ${
                startup.isFeatured
                  ? "border-primary/50 shadow-primary/20"
                  : "border-border"
              }`}
            >
              {startup.website ? (
                <FaviconImage
                  url={startup.website}
                  alt={`${startup.name} favicon`}
                  size={80}
                  className="w-full h-full object-contain p-2 rounded-xl border border-border"
                  fallbackText={startup.name.substring(0, 2).toUpperCase()}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-bold bg-muted">
                  {startup.name.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-foreground capitalize">
                {startup.name}
              </h1>
              {startup.isFeatured && (
                <Badge className="bg-primary text-white text-xs">
                  Featured
                </Badge>
              )}
            </div>

            {startup.tagline && (
              <p className="text-sm text-muted-foreground mb-2">
                {startup.tagline}
              </p>
            )}

            {/* Status and Stage - Inline */}
            <div className="flex items-center gap-2 mb-2 text-xs">
              <Badge variant="outline" className="text-xs capitalize">
                {startup.status.replace("_", " ").toLowerCase()}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {startup.stage.replace("_", " ").toLowerCase()}
              </Badge>
              {startup.tag && (
                <Badge variant="secondary" className="text-xs">
                  {startup.tag}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="mb-4">
        <div className="font-mono text-xs mb-1 text-primary">Metrics</div>
        <div className="flex items-center gap-2 text-xs flex-wrap">
          {startup.revenue !== null && (
            <div className="flex items-center gap-1 bg-green-50/80 dark:bg-green-950/20 px-2 py-1 rounded-md border border-green-200/50 dark:border-green-800/50">
              <IconTax className="h-3 w-3 text-green-500" />
              <span className="font-medium text-green-600 dark:text-green-400">
                {formatCurrency(startup.revenue)}
              </span>
            </div>
          )}

          {startup.employees !== null && (
            <div className="flex items-center gap-1 bg-blue-50/80 dark:bg-blue-950/20 px-2 py-1 rounded-md border border-blue-200/50 dark:border-blue-800/50">
              <IconUsers className="h-3 w-3 text-blue-500" />
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {formatNumber(startup.employees)}
              </span>
            </div>
          )}

          {startup.funding !== null && startup.funding > 0 && (
            <div className="flex items-center gap-1 bg-purple-50/80 dark:bg-purple-950/20 px-2 py-1 rounded-md border border-purple-200/50 dark:border-purple-800/50">
              <IconRocket className="h-3 w-3 text-purple-500" />
              <span className="font-medium text-purple-600 dark:text-purple-400">
                {formatCurrency(startup.funding)}
              </span>
            </div>
          )}

          {startup._count.milestones > 0 && (
            <div className="flex items-center gap-1 bg-primary/50/80 dark:bg-primary-950/20 px-2 py-1 rounded-md border border-primary-200/50 dark:border-primary-800/50">
              <IconTarget className="h-3 w-3 text-primary" />
              <span className="font-medium text-primary dark:text-primary">
                {startup._count.milestones}
              </span>
            </div>
          )}
        </div>
      </div>

      {startup.description && (
        <div className="mb-4">
          <div className="font-mono text-xs mb-1 text-primary">About</div>
          <pre className="bg-muted rounded p-3 text-xs whitespace-pre-wrap">
            {startup.description}
          </pre>
        </div>
      )}

      {/* Tech Stack */}
      {startup.techStack.length > 0 && (
        <div className="mb-4">
          <div className="font-mono text-xs mb-1 text-primary">Tech Stack</div>
          <div className="flex flex-wrap gap-2">
            {startup.techStack.map((tech) => (
              <Badge key={tech} className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Company Details */}
        <div className="mb-4">
          <div className="font-mono text-xs mb-1 text-primary">Details</div>
          <div className="space-y-2 text-xs">
            {startup.foundedAt && (
              <div className="flex items-center gap-2">
                <IconCalendar className="h-3 w-3 text-muted-foreground" />
                <span>Founded {new Date(startup.foundedAt).getFullYear()}</span>
              </div>
            )}
            {startup.industry && (
              <div className="flex items-center gap-2">
                <IconBuilding className="h-3 w-3 text-muted-foreground" />
                <span>{startup.industry}</span>
              </div>
            )}
            {startup.valuation && (
              <div className="flex items-center gap-2">
                <IconRocket className="h-3 w-3 text-muted-foreground" />
                <span>Valuation: {formatCurrency(startup.valuation)}</span>
              </div>
            )}
            {startup.user?.name && (
              <div className="flex items-center gap-2">
                <IconLeaf className="h-3 w-3 text-muted-foreground" />
                <span className="flex items-center gap-2">
                  Founder:{" "}
                  <Link
                    href={`/${startup.user.username}`}
                    className="underline hover:text-primary flex items-center gap-2"
                  >
                    <Avatar className="size-5">
                      <AvatarImage
                        src={startup.user.avatar || undefined}
                        alt={
                          startup.user.name ||
                          startup.user.username ||
                          "Anonymous"
                        }
                        className="rounded-xl"
                        loading="lazy"
                      />
                      <AvatarFallback>
                        {startup.user.name ||
                          startup.user.username ||
                          "Anonymous"}
                      </AvatarFallback>
                    </Avatar>
                    {startup.user.name || startup.user.username || "Anonymous"}
                  </Link>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Links */}
        <div className="mb-4">
          <div className="font-mono text-xs mb-1 text-primary">Links</div>
          <div className="space-y-2 text-xs">
            {startup.website && (
              <a
                href={startup.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:underline"
              >
                <IconWorld className="h-3 w-3" />
                Website
              </a>
            )}
            {startup.githubRepo && (
              <a
                href={startup.githubRepo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:underline"
              >
                <IconGitBranch className="h-3 w-3" />
                GitHub
              </a>
            )}
            {startup.twitterHandle && (
              <a
                href={`https://twitter.com/${startup.twitterHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:underline"
              >
                <IconBrandX className="h-3 w-3" />@{startup.twitterHandle}
              </a>
            )}
            {startup.linkedinUrl && (
              <a
                href={startup.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:underline"
              >
                <IconBrandLinkedin className="h-3 w-3" />
                LinkedIn
              </a>
            )}
          </div>
        </div>
      </div>
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
    title: `${startup.name} - Uara`,
    description:
      startup.tagline ||
      startup.description ||
      `Learn more about ${startup.name}`,
    openGraph: {
      title: `${startup.name} - Uara`,
      description:
        startup.tagline ||
        startup.description ||
        `Learn more about ${startup.name}`,
      type: "website",
    },
  };
}
