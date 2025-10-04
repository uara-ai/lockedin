import { ContributionExamples } from "@/components/feed/activity/contribution-examples";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contribution Chart Examples | Commodo",
  description:
    "Explore different contribution chart variations and color schemes for tracking your development activity.",
};

export default function ExamplesPage() {
  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Contribution Chart Variations
          </h1>
          <p className="text-muted-foreground text-lg">
            Explore different styles and colors for contribution tracking
          </p>
        </div>

        {/* Examples Component */}
        <ContributionExamples />

        {/* Additional Info */}
        <div className="bg-card border rounded-lg p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Available Variations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                <span className="font-medium">GitHub</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Classic GitHub-style contribution graph with green colors
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                <span className="font-medium">Commits</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Code commit tracking with blue color scheme
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
                <span className="font-medium">Activity</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Development activity overview with purple colors
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
                <span className="font-medium">Streak</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Contribution streak tracking with orange flame colors
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Cursor rules applied correctly.
