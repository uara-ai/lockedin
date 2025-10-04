import { Logo } from "@/components/logo";
import { IconBrandX } from "@tabler/icons-react";
import Link from "next/link";
import { ThemeSwitcher } from "../theme-switcher";
import Dr from "../dr";

const links = [
  {
    title: "Builders",
    href: "#builders",
  },
  {
    title: "Features",
    href: "#features",
  },
  {
    title: "Pricing",
    href: "#pricing",
  },
  {
    title: "Stay updated",
    href: "https://x.com/locked_fed",
  },
  {
    title: "Help",
    href: "https://x.com/locked_fed",
  },
];

export default function FooterSection() {
  return (
    <footer className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
          {links.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="text-muted-foreground hover:text-primary block duration-150"
            >
              <span>{link.title}</span>
            </Link>
          ))}
        </div>
        <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
          <Link
            href="https://x.com/locked_fed"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X/Twitter"
            className="text-muted-foreground hover:text-primary block"
          >
            <IconBrandX className="size-6" />
          </Link>
        </div>
        <span className="text-muted-foreground text-center text-sm flex flex-col items-center justify-center gap-2">
          <Dr /> © {new Date().getFullYear()} Commodo.io, All rights reserved
          <ThemeSwitcher />
        </span>
      </div>
    </footer>
  );
}
