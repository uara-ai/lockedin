import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type StartupWithDetails } from "@/app/data/startups";
import { FaviconImage } from "@/components/ui/favicon-image";

interface SponsorStartupSelectorProps {
  startups: StartupWithDetails[];
  selectedStartup: string | null;
  onSelectStartup: (startupId: string) => void;
}

export function SponsorStartupSelector({
  startups,
  selectedStartup,
  onSelectStartup,
}: SponsorStartupSelectorProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Select startup to feature</CardTitle>
        <CardDescription>
          Choose which startup to showcase in our sidebar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {startups.map((startup) => (
          <button
            key={startup.id}
            onClick={() => onSelectStartup(startup.id)}
            className={cn(
              "w-full p-4 text-left border rounded-lg transition-all",
              selectedStartup === startup.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg border-2 overflow-hidden bg-background">
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
              <div>
                <p className="font-medium capitalize">{startup.name}</p>
                <p className="text-sm text-muted-foreground">
                  {startup.tagline || startup.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
