import React from "react";
import { LandingHeader } from "@/sections/landing/Header";
import { LandingHero } from "@/sections/landing/Hero";
import { SectionDivider } from "@/components/SectionDivider";
import { LandingTrustedBy } from "@/sections/landing/TrustedBy";
import { LandingProductSuite } from "@/sections/landing/ProductSuite";
import { LandingManifesto } from "@/sections/landing/Manifesto";
import { LandingFinalCTA } from "@/sections/landing/FinalCTA";
import { LandingFooter } from "@/sections/landing/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-stone-50">
      <main>
        <LandingHeader />
        <div className="-mt-16">
          <LandingHero />
        </div>
        <LandingTrustedBy />
        <LandingProductSuite />
        <LandingManifesto />
        <SectionDivider />
        <LandingFinalCTA />
        <SectionDivider />
      </main>
      <LandingFooter />
    </div>
  );
}
