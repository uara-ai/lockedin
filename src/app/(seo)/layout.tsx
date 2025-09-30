import { HeroHeader } from "@/components/landing/header";
import FooterSection from "@/components/landing/footer";
import { Builders } from "@/components/landing/builders";
import SmallCTA from "@/components/landing/cta";

export default function SEOLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroHeader />
      <main className="py-24">{children}</main>
      <Builders />
      <SmallCTA />
      <FooterSection />
    </div>
  );
}
