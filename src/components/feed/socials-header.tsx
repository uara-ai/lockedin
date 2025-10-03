import { Button } from "@/components/ui/button";
import { IconBrandDiscord } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Social media links data
const socialLinks = [
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
      <div className="flex items-center gap-2 w-full">
        {socialLinks.map((social) => {
          const IconComponent = social.icon;
          return (
            <Button
              className={cn(
                "w-full text-muted-foreground transition-colors bg-violet-500",
                "hover:text-foreground hover:bg-muted",
                "rounded-lg"
              )}
              key={social.id}
              asChild
            >
              <Link href={social.url} target="_blank" rel="noopener noreferrer">
                <IconComponent className="h-6 w-6 text-white" />
                <span className="text-white">Join {social.name}</span>
              </Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
