import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export const Logo = ({ className }: { className?: string }) => {
  return (
    <Link
      className={cn(
        "flex items-center gap-2 font-bold text-xl font-baumans text-primary",
        className
      )}
      href="/"
    >
      <Image
        src="/icon.png"
        alt="Commodo"
        width={32}
        height={32}
        className="rounded-xl"
      />
      commodo.io
    </Link>
  );
};
