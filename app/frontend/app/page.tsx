import Link from "next/link";
import { HeaderControls } from "@/app/components/HeaderControls";
import { HeroSection } from "@/app/components/HeroSection";
import { StepsSection } from "@/app/components/StepsSection";
import { FeaturesSection } from "@/app/components/FeaturesSection";
import { CTASection } from "@/app/components/CTASection";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col mesh-bg noise-overlay">
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 glass border-b border-gray-100/50 dark:border-gray-800/50">
          <div className="max-w-6xl mx-auto px-6 flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-blue-600 font-display tracking-tight">
              PRD2Post
            </Link>
            <div className="flex items-center gap-4">
              <HeaderControls />
            </div>
          </div>
        </header>

        <main className="flex-1 relative z-10">
          <div className="orb-container" aria-hidden>
            <div className="orb" style={{ animationDelay: "0s", animationDuration: "25s" }} />
            <div className="orb" style={{ animationDelay: "-5s", animationDuration: "20s" }} />
            <div className="orb" style={{ animationDelay: "-10s", animationDuration: "18s" }} />
          </div>

          <HeroSection />
          <div className="gradient-line mx-6 max-w-6xl lg:mx-auto" />
          <StepsSection />
          <div className="gradient-line mx-6 max-w-6xl lg:mx-auto" />
          <FeaturesSection />
          <div className="gradient-line mx-6 max-w-6xl lg:mx-auto" />
          <CTASection />
        </main>

        <footer className="border-t border-gray-100/50 dark:border-gray-800/50 py-8 glass">
          <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-400 dark:text-gray-600">
            &copy; {new Date().getFullYear()} PRD2Post. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}
