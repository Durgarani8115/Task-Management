import { getServerSession } from "@/lib/auth";
import { LandingHeader } from "@/components/header/landing-header";
import { HeroSection } from "@/components/landing/hero-section";
import { AppSlideshow } from "@/components/landing/app-slideshow";
import { BentoFeatures } from "@/components/landing/bento-features";
import { FeatureListSection } from "@/components/landing/feature-list-section";
import { BenefitsSection } from "@/components/landing/benefits-section";
import { CTASection } from "@/components/landing/cta-section";
import { LandingFooter } from "@/components/landing/landing-footer";

export default async function HomePage() {
  // fetch server session user data to pass to interactive headers and CTAs
  const user = await getServerSession();

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors overflow-x-clip">
      {/* top sticky landing header navigation */}
      <LandingHeader user={user} />

      {/* main content sections */}
      <main>
        {/* hero section with reactbits waves & interactive preview */}
        <HeroSection user={user} />

        {/* real application interactive ui slideshow showcasing dark and light mode dashboards */}
        <AppSlideshow />

        {/* bento grid feature showcase */}
        <BentoFeatures />

        {/* full real-world feature index with rbac and multi-tenant highlights */}
        <FeatureListSection />

        {/* key project benefits section */}
        <BenefitsSection />

        {/* bottom call to action banner */}
        <CTASection user={user} />
      </main>

      {/* landing footer */}
      <LandingFooter />
    </div>
  );
}
