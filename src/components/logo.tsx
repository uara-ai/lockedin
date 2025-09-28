import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn("flex items-center gap-1 font-semibold text-xl", className)}
    >
      Locked
      <span className="bg-primary text-primary-foreground rounded-xs px-[4px] font-bold">
        in
      </span>
    </div>
  );
};
