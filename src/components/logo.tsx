import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export const Logo = ({ className }: { className?: string }) => {
  return (
    <Link
      className={cn(
        "flex items-center gap-2 font-bold text-xl font-baumans",
        className
      )}
      href="/"
    >
      <Image
        src="/icon.svg"
        alt="Uara"
        width={32}
        height={32}
        className="rounded-xl"
      />
      Uara.co
    </Link>
  );
};
