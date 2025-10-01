import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import Link from "next/link";
import {
  IconChecks,
  IconCrown,
  IconLaurelWreath,
  IconLaurelWreath1,
} from "@tabler/icons-react";

interface SponsorPlanCardProps {
  plan: {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    type: string;
    trialDays: number;
    polarProductId: string;
  };
  selectedStartup: string | null;
  isLoading: boolean;
  onStartTrial: () => void;
}

export function SponsorPlanCard({
  plan,
  selectedStartup,
  isLoading,
  onStartTrial,
}: SponsorPlanCardProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center border border-border">
              <IconCrown className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </div>
            {plan.trialDays > 0 && (
              <Badge className="ml-auto bg-orange-100 text-orange-700 font-semibold">
                {plan.trialDays} days trial
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">${plan.price}</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <IconChecks className="w-4 h-4 text-green-300" />
                <span className="text-muted-foreground">
                  Featured in sidebar
                </span>
              </div>
              <div className="flex items-center gap-2">
                <IconChecks className="w-4 h-4 text-green-300" />
                <span className="text-muted-foreground">
                  Priority in sponsor grid
                </span>
              </div>
              <div className="flex items-center gap-2">
                <IconChecks className="w-4 h-4 text-green-300" />
                <span className="text-muted-foreground">
                  Custom sponsor badge
                </span>
              </div>
              <div className="flex items-center gap-2">
                <IconChecks className="w-4 h-4 text-green-300" />
                <span className="text-muted-foreground">
                  Direct{" "}
                  <Link
                    href="https://ahrefs.com/seo/glossary/dofollow-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-mono bg-muted px-1 py-0.5 rounded text-xs"
                  >
                    do-follow
                  </Link>{" "}
                  link to your startup
                </span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            className="w-full"
            onClick={onStartTrial}
            disabled={!selectedStartup || isLoading}
          >
            {isLoading ? "Processing..." : "Start Free Trial"}
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/feed">← Back to Feed</Link>
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
