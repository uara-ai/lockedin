import HeroSection from "@/components/landing/hero";
import FeaturesSection from "@/components/landing/features";
import Pricing from "@/components/landing/pricing";
import { Builders } from "@/components/landing/builders";
import FooterSection from "@/components/landing/footer";

export default function Home() {
  return (
    <>
      <HeroSection />
      <Builders />
      <FeaturesSection />
      <Pricing />
      <FooterSection />
    </>
  );
}
