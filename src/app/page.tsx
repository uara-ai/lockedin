import { Suspense } from "react";
import HeroSection from "@/components/landing/hero";
import FeaturesSection from "@/components/landing/features";
import Pricing from "@/components/landing/pricing";
import { Builders } from "@/components/landing/builders";
import FooterSection from "@/components/landing/footer";
import { Skeleton } from "@/components/ui/skeleton";
import WallOfLoveSection from "@/components/landing/testimonials";

// Loading component for builders section
function BuildersLoading() {
  return (
    <div className="relative py-16 md:py-24" id="builders">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center mb-12 max-w-sm mx-auto">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-20 w-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="p-6 rounded-2xl border bg-card">
              <div className="flex items-start gap-4 mb-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Skeleton className="h-12 w-48 mx-auto" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <Suspense fallback={<BuildersLoading />}>
        <Builders />
      </Suspense>
      <FeaturesSection />
      <WallOfLoveSection />
      <Pricing />
      <FooterSection />
    </>
  );
}
