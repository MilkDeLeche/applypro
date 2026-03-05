import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { signIn } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LandingHeader() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  const isOverHero = !scrolled;

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`sticky top-0 z-[201] transition-all duration-300 ${
        isOverHero
          ? "bg-transparent border-b border-white/20"
          : "bg-white/95 backdrop-blur-sm border-b-2 border-stone-200 shadow-sm"
      }`}
    >
      <div className="px-6 md:px-9">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold font-display ${
                isOverHero ? "bg-white/20 text-white" : "bg-gradient-to-br from-violet-600 to-purple-800 text-white"
              }`}
            >
              P
            </div>
            <span
              className={`text-xl font-bold font-display tracking-tight ${
                isOverHero ? "text-white" : "text-stone-900"
              }`}
            >
              PostulaPro
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isOverHero ? "text-white hover:bg-white/10" : "text-stone-900 hover:bg-stone-100"
                  }`}
                >
                  Product
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                <DropdownMenuItem asChild>
                  <a href="#features" className="block w-full cursor-pointer" onClick={scrollToFeatures}>
                    Features
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/extension" className="block w-full cursor-pointer">
                    Chrome Extension
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/pricing" className="block w-full cursor-pointer">
                    Pricing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/" className="block w-full cursor-pointer">
                    Dashboard
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              onClick={scrollToFeatures}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isOverHero ? "text-white hover:bg-white/10" : "text-stone-900 hover:bg-stone-100"
              }`}
            >
              {t("landing.cta.howItWorks")}
            </button>
            <Link
              href="/pricing"
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isOverHero ? "text-white hover:bg-white/10" : "text-stone-900 hover:bg-stone-100"
              }`}
            >
              {t("nav.pricing")}
            </Link>
          </nav>

          {/* Right: Log in, Get Started */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => signIn("/dashboard")}
              className={`hidden sm:block text-sm font-medium transition-colors ${
                isOverHero ? "text-white hover:text-white/90" : "text-stone-900 hover:text-purple-800"
              }`}
            >
              {t("nav.login")}
            </button>
            <button
              onClick={() => signIn("/dashboard")}
              className="bg-purple-800 hover:bg-purple-900 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {t("landing.hero.cta")}
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
