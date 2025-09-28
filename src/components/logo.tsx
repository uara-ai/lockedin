import { cn } from "@/lib/utils";
import Link from "next/link";

export const Logo = ({ className }: { className?: string }) => {
  return (
    <Link
      className={cn("flex items-center gap-1 font-semibold text-xl", className)}
      href="/"
    >
      Locked
      <span className="bg-primary text-primary-foreground rounded-xs px-[4px] font-bold">
        in
      </span>
    </Link>
  );
};
