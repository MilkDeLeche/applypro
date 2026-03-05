"use client";

import { useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon as XMarkIconOutline } from "@heroicons/react/24/outline";
import { CheckIcon, XMarkIcon as XMarkIconMini } from "@heroicons/react/20/solid";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useI18n, PRICING, type Country } from "@/lib/i18n";
import { authFetch } from "@/lib/api";
import { signIn } from "@/lib/auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LandingFooter } from "@/sections/landing/Footer";
import { SectionDivider } from "@/components/SectionDivider";

type UsageData = {
  tier: "free" | "standard" | "pro";
  isPremium: boolean;
  resumeParses: { used: number; remaining: number; limit: number };
  autofills: { used: number; remaining: number; limit: number };
  profiles: { current: number; max: number };
};

type PaymentProvidersData = {
  providers: { stripe: boolean; lemonsqueezy: boolean };
  pricing: { standard: number; pro: number; currency: string };
};

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Pricing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [frequency, setFrequency] = useState<"monthly" | "annually">("annually");
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t, country, setCountry, formatPrice } = useI18n();

  const { data: usageData } = useQuery<UsageData>({
    queryKey: ["/api/usage"],
    enabled: !!user,
  });

  const { data: paymentData } = useQuery<PaymentProvidersData>({
    queryKey: ["/api/payment-providers", country],
    queryFn: async () => {
      const res = await authFetch(`/api/payment-providers?country=${country}`);
      return res.json();
    },
  });

  const stripeCheckoutMutation = useMutation({
    mutationFn: async (tier: "standard" | "pro") => {
      const res = await authFetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      if (!res.ok) throw new Error("Failed to create checkout session");
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
    onError: () => {
      toast({ title: t("common.error"), description: "Failed to start checkout. Please try again.", variant: "destructive" });
    },
  });

  const lemonSqueezyCheckoutMutation = useMutation({
    mutationFn: async (tier: "standard" | "pro") => {
      const res = await authFetch("/api/lemonsqueezy/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      if (!res.ok) throw new Error("Failed to create Lemon Squeezy session");
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
    onError: () => {
      toast({ title: t("common.error"), description: "Failed to start checkout. Please try again.", variant: "destructive" });
    },
  });

  const handleUpgrade = (tier: "standard" | "pro") => {
    if (!user) {
      signIn();
      return;
    }
    if ((country === "mx" || country === "cl") && paymentData?.providers.lemonsqueezy) {
      lemonSqueezyCheckoutMutation.mutate(tier);
    } else {
      stripeCheckoutMutation.mutate(tier);
    }
  };

  const currentTier = usageData?.tier || "free";
  const isLoading = stripeCheckoutMutation.isPending || lemonSqueezyCheckoutMutation.isPending;
  const pricingData = PRICING[country] || PRICING.us;

  const tiers = [
    {
      id: "free",
      name: t("pricing.free.title"),
      description: t("pricing.free.desc"),
      price: { monthly: t("pricing.free.price"), annually: t("pricing.free.price") },
      highlights: [
        t("pricing.free.feature1"),
        t("pricing.free.feature2"),
        t("pricing.free.feature3"),
        t("pricing.free.feature4"),
        t("pricing.free.feature5"),
        "Chrome extension",
      ],
      featured: false,
      ctaTier: null as "standard" | "pro" | null,
    },
    {
      id: "pro",
      name: t("pricing.pro.title"),
      description: t("pricing.pro.desc"),
      price: {
        monthly: formatPrice(pricingData.proMonthly),
        annually: formatPrice(pricingData.pro),
      },
      highlights: [
        `5 ${t("pricing.feature.profiles")}`,
        `${t("pricing.feature.unlimited")} ${t("pricing.feature.uploads")}`,
        `${t("pricing.feature.unlimited")} ${t("pricing.feature.applications")}`,
        "LATAM Support",
        "AI Cover Letter Generation",
        "Email support",
      ],
      featured: true,
      ctaTier: "pro" as const,
    },
    {
      id: "standard",
      name: t("pricing.standard.title"),
      description: t("pricing.standard.desc"),
      price: {
        monthly: formatPrice(pricingData.standardMonthly),
        annually: formatPrice(pricingData.standard),
      },
      highlights: [
        `1 ${t("pricing.feature.profiles")}`,
        `${t("pricing.feature.unlimited")} ${t("pricing.feature.uploads")}`,
        `${t("pricing.feature.unlimited")} ${t("pricing.feature.applications")}`,
        "LATAM Support",
      ],
      featured: false,
      ctaTier: "standard" as const,
    },
  ];

  const sections = [
    {
      name: "Features",
      features: [
        { name: "Profiles", tiers: { free: "1", pro: "5", standard: "1" } },
        { name: "Resume uploads", tiers: { free: false, pro: true, standard: true } },
        { name: "Applications", tiers: { free: "10/mo", pro: "Unlimited", standard: "Unlimited" } },
        { name: "LATAM Support", tiers: { free: false, pro: true, standard: true } },
      ],
    },
    {
      name: "Extras",
      features: [
        { name: "AI Cover Letter", tiers: { free: false, pro: true, standard: false } },
        { name: "PDF Injection", tiers: { free: false, pro: true, standard: true } },
        { name: "Email support", tiers: { free: false, pro: true, standard: false } },
      ],
    },
  ];

  const faqs = [
    { id: 1, question: "Can I switch plans later?", answer: "Yes. You can upgrade or downgrade your plan at any time. Changes take effect immediately." },
    { id: 2, question: "What payment methods do you accept?", answer: "We accept all major credit cards. For Mexico and Chile, we also support local payment methods through Lemon Squeezy." },
    { id: 3, question: "Is my data secure?", answer: "Yes. Your resume and personal data are encrypted at rest and in transit. We never sell or share your information with third parties." },
    { id: 4, question: "Can I cancel anytime?", answer: "Yes. You can cancel your subscription at any time. You'll retain access until the end of your billing period." },
  ];

  const navigation = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.pricing"), href: "/pricing" },
    { name: t("nav.extension"), href: "/extension" },
  ];

  const countryOptions: { value: Country; label: string }[] = [
    { value: "us", label: "United States (USD)" },
    { value: "mx", label: "México (MXN)" },
    { value: "cl", label: "Chile (CLP)" },
    { value: "other", label: "Other (USD)" },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <header className="bg-gray-900 dark:bg-gray-800/25">
        <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
              <span className="text-white font-bold text-xl">PostulaPro</span>
            </Link>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400"
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden className="size-6" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href} className="text-sm font-semibold text-white hover:text-gray-300">
                {item.name}
              </Link>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-4">
            {user ? (
              <Link href="/dashboard" className="text-sm font-semibold text-white">
                Dashboard <span aria-hidden>&rarr;</span>
              </Link>
            ) : (
              <button onClick={() => signIn("/dashboard")} className="text-sm font-semibold text-white">
                Log in <span aria-hidden>&rarr;</span>
              </button>
            )}
          </div>
        </nav>
        <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gray-900 p-6 sm:max-w-sm sm:ring-1 sm:ring-white/10">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5 text-white font-bold">
                PostulaPro
              </Link>
              <button type="button" onClick={() => setMobileMenuOpen(false)} className="-m-2.5 rounded-md p-2.5 text-gray-400">
                <span className="sr-only">Close menu</span>
                <XMarkIconOutline aria-hidden className="size-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/25">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-white hover:bg-gray-800"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="py-6">
                  {user ? (
                    <Link href="/dashboard" className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold text-white hover:bg-gray-800">
                      Dashboard
                    </Link>
                  ) : (
                    <button onClick={() => { signIn("/dashboard"); setMobileMenuOpen(false); }} className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold text-white hover:bg-gray-800 w-full text-left">
                      Log in
                    </button>
                  )}
                </div>
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </header>

      <main>
        {/* Pricing section */}
        <div className="group/tiers isolate overflow-hidden">
          <div className="relative flow-root border-b border-b-transparent pt-24 pb-16 sm:pt-32 lg:pb-0 dark:border-b-white/5">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: "url(/images/pricing-hero.jpg)" }}
              aria-hidden
            />
            <div className="absolute inset-0 bg-gray-900/80 dark:bg-gray-900/70" aria-hidden />
            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
              <div className="relative z-10">
                <h2 className="mx-auto max-w-4xl text-center text-5xl font-semibold tracking-tight text-balance text-white sm:text-6xl" data-testid="text-pricing-title">
                  {t("pricing.title")}
                </h2>
                <p className="mx-auto mt-6 max-w-2xl text-center text-lg font-medium text-pretty text-gray-400 sm:text-xl">
                  {t("pricing.subtitle")}
                </p>
                <div className="mt-10 flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Globe className="w-4 h-4" />
                    <Select value={country} onValueChange={(v) => setCountry(v as Country)}>
                      <SelectTrigger className="w-48 bg-white/5 border-white/20 text-white" data-testid="select-country">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countryOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                <div className="flex justify-center">
                  <fieldset aria-label="Payment frequency">
                    <div className="grid grid-cols-2 gap-x-1 rounded-full bg-white/5 p-1 text-center text-xs font-semibold text-white">
                      <label className={classNames("cursor-pointer rounded-full px-2.5 py-1 transition-colors", frequency === "monthly" && "bg-indigo-500")}>
                        <input
                          type="radio"
                          name="frequency"
                          value="monthly"
                          checked={frequency === "monthly"}
                          onChange={() => setFrequency("monthly")}
                          className="sr-only"
                        />
                        <span>Monthly</span>
                      </label>
                      <label className={classNames("cursor-pointer rounded-full px-2.5 py-1 transition-colors", frequency === "annually" && "bg-indigo-500")}>
                        <input
                          type="radio"
                          name="frequency"
                          value="annually"
                          checked={frequency === "annually"}
                          onChange={() => setFrequency("annually")}
                          className="sr-only"
                        />
                        <span>Annually</span>
                      </label>
                    </div>
                  </fieldset>
                </div>
                </div>
              </div>
              <div className="relative mx-auto mt-10 grid max-w-md grid-cols-1 gap-y-8 lg:mx-0 lg:-mb-14 lg:max-w-none lg:grid-cols-3">
                <div aria-hidden className="hidden lg:absolute lg:inset-x-px lg:top-4 lg:bottom-0 lg:block lg:rounded-t-2xl lg:bg-gray-800/80 lg:ring-1 lg:ring-white/10" />
                {tiers.map((tier) => (
                  <div
                    key={tier.id}
                    data-featured={tier.featured ? "true" : undefined}
                    className={classNames(
                      tier.featured
                        ? "z-10 relative bg-white shadow-xl outline-1 outline-gray-900/10 dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10"
                        : "bg-gray-800/80 outline-1 -outline-offset-1 outline-white/10 lg:bg-transparent lg:pb-14 lg:outline-0",
                      "group/tier rounded-2xl"
                    )}
                  >
                    {tier.featured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-indigo-600">{t("landing.pricing.popular")}</Badge>
                      </div>
                    )}
                    <div className="p-8 lg:pt-12 xl:p-10 xl:pt-14">
                      <h3 id={`tier-${tier.id}`} className={classNames("text-sm font-semibold", tier.featured ? "text-gray-900 dark:text-white" : "text-white")}>
                        {tier.name}
                      </h3>
                      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between lg:flex-col lg:items-stretch">
                        <div className="mt-2 flex items-center gap-x-4">
                          <p className={classNames("text-4xl font-semibold tracking-tight", tier.featured ? "text-gray-900 dark:text-white" : "text-white")}>
                            {frequency === "monthly" ? tier.price.monthly : tier.price.annually}
                          </p>
                          {tier.id !== "free" && (
                            <div className="text-sm">
                              <p className={tier.featured ? "text-gray-900 dark:text-white" : "text-white"}>
                                {frequency === "annually" ? t("pricing.per_year") : t("pricing.per_month")}
                              </p>
                            </div>
                          )}
                        </div>
                        {tier.ctaTier ? (
                          <button
                            type="button"
                            onClick={() => handleUpgrade(tier.ctaTier!)}
                            disabled={isLoading || authLoading || currentTier === tier.ctaTier}
                            aria-describedby={`tier-${tier.id}`}
                            data-testid={tier.ctaTier === "pro" ? "button-upgrade-pro" : "button-upgrade-standard"}
                            className={classNames(
                              "w-full rounded-md px-3 py-2 text-center text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50",
                              tier.featured
                                ? "bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600"
                                : "bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white"
                            )}
                          >
                            {currentTier === tier.ctaTier ? "Current Plan" : isLoading ? t("common.loading") : t("pricing.cta.upgrade")}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled
                            data-testid="button-free-current"
                            className="w-full rounded-md bg-white/10 px-3 py-2 text-center text-sm font-semibold text-white opacity-75 cursor-not-allowed"
                          >
                            {currentTier === "free" ? "Current Plan" : t("pricing.cta.free")}
                          </button>
                        )}
                      </div>
                      <div className="mt-8 flow-root sm:mt-10">
                        <ul role="list" className={classNames("-my-2 divide-y border-t text-sm", tier.featured ? "divide-gray-900/5 border-gray-900/5 text-gray-600 dark:divide-white/10 dark:border-white/10 dark:text-white" : "divide-white/5 border-white/5 text-white")}>
                          {tier.highlights.map((feature) => (
                            <li key={feature} className="flex gap-x-3 py-2">
                              <CheckIcon aria-hidden className={classNames("h-6 w-5 flex-none", tier.featured ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500")} />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="relative bg-gray-50 lg:pt-14 dark:bg-gray-900">
            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
              {/* Feature comparison (lg+) */}
              <section aria-labelledby="comparison-heading" className="hidden lg:block">
                <h2 id="comparison-heading" className="sr-only">Feature comparison</h2>
                <div className="grid grid-cols-4 gap-x-8 border-t border-gray-900/10 dark:border-white/10">
                  <div aria-hidden className="-mt-px" />
                  {tiers.map((tier) => (
                    <div key={tier.id} aria-hidden className="-mt-px">
                      <div className={classNames(tier.featured ? "border-indigo-600 dark:border-indigo-500" : "border-transparent", "border-t-2 pt-10")}>
                        <p className={classNames(tier.featured ? "text-indigo-600 dark:text-indigo-400" : "text-gray-900 dark:text-white", "text-sm font-semibold")}>
                          {tier.name}
                        </p>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{tier.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="-mt-6 space-y-16">
                  {sections.map((section) => (
                    <div key={section.name}>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{section.name}</h3>
                      <div className="relative -mx-8 mt-10">
                        <table className="relative w-full border-separate border-spacing-x-8">
                          <thead>
                            <tr className="text-left">
                              <th scope="col"><span className="sr-only">Feature</span></th>
                              {tiers.map((t) => (
                                <th key={t.id} scope="col"><span className="sr-only">{t.name}</span></th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {section.features.map((feature) => (
                              <tr key={feature.name}>
                                <th scope="row" className="w-1/4 py-3 pr-4 text-left text-sm font-normal text-gray-900 dark:text-white">
                                  {feature.name}
                                </th>
                                {tiers.map((tier) => {
                                  const val = feature.tiers[tier.id as keyof typeof feature.tiers];
                                  return (
                                    <td key={tier.id} className="relative w-1/4 px-4 py-0 text-center">
                                      <span className="relative block py-3">
                                        {typeof val === "string" ? (
                                          <span className={classNames(tier.featured ? "font-semibold text-indigo-600 dark:text-indigo-400" : "text-gray-900 dark:text-white", "text-sm")}>
                                            {val}
                                          </span>
                                        ) : (
                                          <>
                                            {val === true ? (
                                              <CheckIcon aria-hidden className="mx-auto size-5 text-indigo-600 dark:text-indigo-400" />
                                            ) : (
                                              <XMarkIconMini aria-hidden className="mx-auto size-5 text-gray-400 dark:text-gray-600" />
                                            )}
                                            <span className="sr-only">{val === true ? "Yes" : "No"}</span>
                                          </>
                                        )}
                                      </span>
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* FAQ section */}
        <div className="mx-auto mt-24 max-w-7xl px-6 sm:mt-56 lg:px-8">
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Frequently asked questions
          </h2>
          <dl className="mt-20 divide-y divide-gray-900/10 dark:divide-white/10">
            {faqs.map((faq) => (
              <div key={faq.id} className="py-8 first:pt-0 last:pb-0 lg:grid lg:grid-cols-12 lg:gap-8">
                <dt className="text-base font-semibold text-gray-900 dark:text-white lg:col-span-5">
                  {faq.question}
                </dt>
                <dd className="mt-4 lg:col-span-7 lg:mt-0">
                  <p className="text-base text-gray-600 dark:text-gray-400">{faq.answer}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Privacy & Payment */}
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8" data-testid="section-privacy">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2" data-testid="text-privacy-tagline">{t("privacy.tagline")}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">{t("privacy.subtitle")}</p>
            <p className="text-sm text-gray-500">
              {(country === "mx" || country === "cl") && paymentData?.providers.lemonsqueezy
                ? "Pagos seguros con Lemon Squeezy"
                : "Secure payments powered by Stripe"}
            </p>
          </div>
        </div>
      </main>
      <SectionDivider />
      <LandingFooter />
    </div>
  );
}
