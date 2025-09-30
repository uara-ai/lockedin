import { Button } from "@/components/ui/button";
import {
  IconBrandGithub,
  IconBrandDiscord,
  IconBrandX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Social media links data
const socialLinks = [
  {
    id: "github",
    name: "GitHub",
    icon: IconBrandGithub,
    url: "https://github.com/uara-ai/lockedin",
  },
  {
    id: "twitter",
    name: "Twitter",
    icon: IconBrandX,
    url: "https://x.com/locked_fed",
  },
  {
    id: "discord",
    name: "Discord",
    icon: IconBrandDiscord,
    url: "https://discord.gg/JBwt49cyQT",
  },
];

export function SocialsHeader() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      {/* Centered Social Links */}
      <div className="flex items-center gap-2">
        {socialLinks.map((social) => {
          const IconComponent = social.icon;
          return (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-12 w-12 text-muted-foreground transition-colors",
                "hover:text-foreground hover:bg-muted",
                "rounded-lg"
              )}
              key={social.id}
              asChild
            >
              <Link href={social.url} target="_blank" rel="noopener noreferrer">
                <IconComponent className="h-6 w-6" />
                <span className="sr-only">{social.name}</span>
              </Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
