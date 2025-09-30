import { cn } from "@/lib/utils";
import { getUsersCount } from "@/app/data/profile";

interface AppStatsProps {
  className?: string;
}

export const revalidate = 3600; // 1 hour

export default async function AppAge({ className }: AppStatsProps) {
  // Calculate days since app launch (adjust this date to your actual launch date)
  const LAUNCH_DATE = new Date("2025-09-29"); // Update this to your actual launch date

  // Calculate days since launch
  const today = new Date();
  const timeDiff = today.getTime() - LAUNCH_DATE.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
  const daysLive = Math.max(daysDiff, 1);

  // Get real user count from database
  const realUserCount = await getUsersCount();
  const userCount = Math.max(realUserCount - 1, 1); // -1 for dev user, minimum 1

  return (
    <div
      className={cn("flex items-center justify-center gap-12 py-6", className)}
    >
      {/* Retro Calendar for Days Live */}
      <div className="flex flex-col items-center">
        <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden w-20">
          {/* Calendar Header */}
          <div className="bg-red-500 text-white px-3 py-1 text-center">
            <div className="text-xs font-semibold uppercase tracking-wide">
              Days
            </div>
          </div>

          {/* Calendar Body */}
          <div className="px-3 py-3 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {daysLive}
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2 font-medium text-center">
          Building live
        </p>
      </div>

      {/* Real User Count Display */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1">
          {/* Custom digit display with real user count */}
          {String(userCount)
            .padStart(3, "0")
            .split("")
            .map((digit, index) => (
              <div
                key={index}
                className="bg-primary relative h-12 w-8 overflow-hidden rounded-lg border flex items-center justify-center"
              >
                <span className="text-primary-foreground text-xl font-semibold">
                  {digit}
                </span>
              </div>
            ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2 font-medium text-center">
          Builders joined
        </p>
      </div>
    </div>
  );
}

// Cursor rules applied correctly.
