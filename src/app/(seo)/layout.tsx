import { HeroHeader } from "@/components/landing/header";
import FooterSection from "@/components/landing/footer";
import { Builders } from "@/components/landing/builders";
import SmallCTA from "@/components/landing/cta";

export default function SEOLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto">
      <HeroHeader />
      <main>{children}</main>
      <Builders />
      <SmallCTA />
      <FooterSection />
    </div>
  );
}
