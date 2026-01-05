import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Globe } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useI18n, PRICING, type Country } from "@/lib/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type UsageData = {
  tier: 'free' | 'standard' | 'pro';
  isPremium: boolean;
  resumeParses: { used: number; remaining: number; limit: number };
  autofills: { used: number; remaining: number; limit: number };
  profiles: { current: number; max: number };
};

type PaymentProvidersData = {
  providers: { stripe: boolean; mercadopago: boolean };
  pricing: { standard: number; pro: number; currency: string };
};

export default function Pricing() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t, country, setCountry, formatPrice } = useI18n();

  const { data: usageData } = useQuery<UsageData>({
    queryKey: ['/api/usage'],
    enabled: !!user,
  });

  const { data: paymentData } = useQuery<PaymentProvidersData>({
    queryKey: ['/api/payment-providers', country],
    queryFn: async () => {
      const res = await fetch(`/api/payment-providers?country=${country}`);
      return res.json();
    }
  });

  const stripeCheckoutMutation = useMutation({
    mutationFn: async (tier: 'standard' | 'pro') => {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier })
      });
      if (!res.ok) throw new Error('Failed to create checkout session');
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast({ title: t("common.error"), description: "Failed to start checkout. Please try again.", variant: "destructive" });
    }
  });

  const mercadopagoCheckoutMutation = useMutation({
    mutationFn: async (tier: 'standard' | 'pro') => {
      const res = await fetch('/api/mercadopago/checkout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, country })
      });
      if (!res.ok) throw new Error('Failed to create Mercado Pago session');
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast({ title: t("common.error"), description: "Failed to start checkout. Please try again.", variant: "destructive" });
    }
  });

  const handleUpgrade = (tier: 'standard' | 'pro') => {
    if (!user) {
      window.location.href = '/api/login';
      return;
    }
    
    // Use Mercado Pago for LATAM countries if available
    if ((country === 'mx' || country === 'cl') && paymentData?.providers.mercadopago) {
      mercadopagoCheckoutMutation.mutate(tier);
    } else {
      stripeCheckoutMutation.mutate(tier);
    }
  };

  const currentTier = usageData?.tier || 'free';
  const isLoading = stripeCheckoutMutation.isPending || mercadopagoCheckoutMutation.isPending;

  // Get localized pricing
  const pricing = PRICING[country] || PRICING.us;
  const standardPrice = formatPrice(pricing.standard);
  const proPrice = formatPrice(pricing.pro);

  const countryOptions: { value: Country; label: string }[] = [
    { value: 'us', label: 'United States (USD)' },
    { value: 'mx', label: 'México (MXN)' },
    { value: 'cl', label: 'Chile (CLP)' },
    { value: 'other', label: 'Other (USD)' },
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <Link href="/" className="text-muted-foreground hover:text-foreground mb-4 inline-block">
            {t("nav.dashboard")}
          </Link>
          <h1 className="text-4xl font-bold mb-4" data-testid="text-pricing-title">{t("pricing.title")}</h1>
          <p className="text-lg text-muted-foreground">{t("pricing.subtitle")}</p>
          
          {/* Country selector */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <Select value={country} onValueChange={(v) => setCountry(v as Country)}>
              <SelectTrigger className="w-48" data-testid="select-country">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {countryOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} data-testid={`option-country-${opt.value}`}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("pricing.free.title")}</CardTitle>
              <CardDescription>{t("pricing.free.desc")}</CardDescription>
              <div className="text-3xl font-bold mt-4">{t("pricing.free.price")}</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>1 {t("pricing.feature.profiles")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>3 {t("pricing.feature.uploads")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>10 {t("pricing.feature.applications")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Chrome extension</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full" 
                disabled={currentTier === 'free'}
                data-testid="button-free-current"
              >
                {currentTier === 'free' ? 'Current Plan' : t("pricing.cta.free")}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("pricing.standard.title")}</CardTitle>
              <CardDescription>{t("pricing.standard.desc")}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">{standardPrice}</span>
                <span className="text-muted-foreground">{t("pricing.per_year")}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>1 {t("pricing.feature.profiles")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{t("pricing.feature.unlimited")} {t("pricing.feature.uploads")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{t("pricing.feature.unlimited")} {t("pricing.feature.applications")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>LATAM Support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant={currentTier === 'standard' ? 'outline' : 'default'}
                onClick={() => handleUpgrade('standard')}
                disabled={isLoading || authLoading || currentTier === 'standard'}
                data-testid="button-upgrade-standard"
              >
                {currentTier === 'standard' ? 'Current Plan' : isLoading ? t("common.loading") : t("pricing.cta.upgrade")}
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-primary relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge>Best Value</Badge>
            </div>
            <CardHeader>
              <CardTitle>{t("pricing.pro.title")}</CardTitle>
              <CardDescription>{t("pricing.pro.desc")}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">{proPrice}</span>
                <span className="text-muted-foreground">{t("pricing.per_year")}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="font-medium">5 {t("pricing.feature.profiles")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{t("pricing.feature.unlimited")} {t("pricing.feature.uploads")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{t("pricing.feature.unlimited")} {t("pricing.feature.applications")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>LATAM Support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Email support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant={currentTier === 'pro' ? 'outline' : 'default'}
                onClick={() => handleUpgrade('pro')}
                disabled={isLoading || authLoading || currentTier === 'pro'}
                data-testid="button-upgrade-pro"
              >
                {currentTier === 'pro' ? 'Current Plan' : isLoading ? t("common.loading") : t("pricing.cta.upgrade")}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p className="mb-2">
            {(country === 'mx' || country === 'cl') && paymentData?.providers.mercadopago 
              ? "Pagos seguros con Mercado Pago" 
              : "Secure payments powered by Stripe"}
          </p>
          {(country === 'mx' || country === 'cl') && paymentData?.providers.mercadopago && (
            <p className="text-xs">
              {country === 'mx' ? 'Acepta tarjetas mexicanas, OXXO y más' : 'Acepta tarjetas chilenas y transferencias'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
