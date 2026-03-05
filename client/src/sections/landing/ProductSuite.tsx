import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, FileText, Zap, ShieldCheck, Globe2, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";

export function LandingProductSuite() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<"all" | string>("all");

  const products = [
    {
      id: "resume",
      name: t("landing.features.ai.title"),
      icon: FileText,
      headline: t("landing.features.ai.title"),
      description: t("landing.features.ai.desc"),
      features: [
        "Advanced LLMs extract every detail from your PDF",
        "Handles complex formats and layouts",
        "Supports English, Spanish (MX, CL)",
      ],
      color: "bg-purple-100",
    },
    {
      id: "autofill",
      name: t("landing.features.autofill.title"),
      icon: Zap,
      headline: t("landing.features.autofill.title"),
      description: t("landing.features.autofill.desc"),
      features: [
        t("landing.features.autofill.bullet1"),
        t("landing.features.autofill.bullet2"),
        t("landing.features.autofill.bullet3"),
      ],
      color: "bg-green-100",
    },
    {
      id: "persona",
      name: t("landing.features.persona.title"),
      icon: ShieldCheck,
      headline: t("landing.features.persona.title"),
      description: t("landing.features.persona.desc"),
      features: [
        t("landing.features.persona.bullet1"),
        t("landing.features.persona.bullet2"),
        t("landing.features.persona.bullet3"),
      ],
      color: "bg-yellow-100",
    },
    {
      id: "latam",
      name: t("landing.features.latam.title"),
      icon: Globe2,
      headline: t("landing.features.latam.title"),
      description: t("landing.features.latam.desc"),
      features: [
        t("landing.features.latam.bullet1"),
        t("landing.features.latam.bullet2"),
        t("landing.features.latam.bullet3"),
      ],
      color: "bg-orange-100",
    },
  ];

  return (
    <section id="features" className="bg-stone-100 px-6 md:px-9 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-4xl md:text-5xl font-medium text-stone-900">
            Your PostulaPro suite
          </h2>
          <Link
            href="/pricing"
            className="inline-flex items-center text-purple-800 font-medium hover:text-purple-900 transition-colors"
          >
            {t("nav.pricing")}
            <ArrowRight className="w-5 h-5 ml-1" />
          </Link>
        </div>

        <div className="border-2 border-stone-300 bg-stone-100 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-5">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex items-center justify-center gap-2 py-4 px-4 border-r-2 border-b-2 md:border-b-0 border-stone-300 transition-colors ${
                activeTab === "all" ? "bg-stone-200 shadow-sm" : "hover:bg-stone-50"
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium text-sm">All</span>
            </button>
            {products.map((product) => {
              const Icon = product.icon;
              return (
                <button
                  key={product.id}
                  onClick={() => setActiveTab(product.id)}
                  className={`flex items-center justify-center gap-2 py-4 px-4 border-r-2 border-b-2 md:border-b-0 border-stone-300 last:border-r-0 transition-colors ${
                    activeTab === product.id ? "bg-stone-200 shadow-sm" : "hover:bg-stone-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{product.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="diagonal-stripes border-2 border-stone-300 p-8">
          <div className="flex flex-col">
            {(activeTab === "all" ? products : products.filter((p) => p.id === activeTab)).map(
              (product) => {
                const Icon = product.icon;
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-stone-100 border-t-2 border-stone-300 first:border-t-0"
                  >
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    <div className="p-8 lg:p-12">
                      <div className="dash-pattern flex items-center gap-3 px-4 py-3 mb-6">
                        <Icon className="w-6 h-6" />
                        <span className="text-xl font-medium">{product.name}</span>
                      </div>
                      <h3 className="text-3xl md:text-4xl font-medium mb-4">
                        {product.headline}
                      </h3>
                      <p className="text-stone-600 text-lg mb-6">{product.description}</p>
                      <Link
                        href="/pricing"
                        className="inline-flex items-center gap-2 text-purple-800 font-medium hover:text-purple-900 transition-colors mb-6 group"
                      >
                        <span>Learn more</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <ul className="space-y-3">
                        {product.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3 text-lg">
                            <span className="w-2 h-2 rounded-full bg-purple-800 mt-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 lg:p-8 flex items-center justify-center">
                      <div
                        className={`w-full aspect-video rounded-lg ${product.color} flex items-center justify-center border-2 border-stone-200`}
                      >
                        <Icon className="w-24 h-24 text-stone-400" />
                      </div>
                    </div>
                  </div>
                </motion.div>
                );
              }
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
