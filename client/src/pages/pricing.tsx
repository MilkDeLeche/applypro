import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

type UsageData = {
  tier: 'free' | 'standard' | 'pro';
  isPremium: boolean;
  resumeParses: { used: number; remaining: number; limit: number };
  autofills: { used: number; remaining: number; limit: number };
  profiles: { current: number; max: number };
};

export default function Pricing() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const { data: usageData } = useQuery<UsageData>({
    queryKey: ['/api/usage'],
    enabled: !!user,
  });

  const checkoutMutation = useMutation({
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
      toast({ title: "Error", description: "Failed to start checkout. Please try again.", variant: "destructive" });
    }
  });

  const handleUpgrade = (tier: 'standard' | 'pro') => {
    if (!user) {
      window.location.href = '/api/login';
      return;
    }
    checkoutMutation.mutate(tier);
  };

  const currentTier = usageData?.tier || 'free';

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <Link href="/" className="text-muted-foreground hover:text-foreground mb-4 inline-block">
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-4" data-testid="text-pricing-title">Simple, Fair Pricing</h1>
          <p className="text-lg text-muted-foreground">Start free, upgrade when you need more</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>Try it out and see how it works</CardDescription>
              <div className="text-3xl font-bold mt-4">$0</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>1 resume profile</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Upload up to 3 resumes per month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Fill 10 job applications per month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Chrome extension included</span>
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
                {currentTier === 'free' ? 'Current Plan' : 'Free Plan'}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Standard</CardTitle>
              <CardDescription>Apply to as many jobs as you want</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">$35</span>
                <span className="text-muted-foreground">/year</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>1 resume profile</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Unlimited resume uploads</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Fill unlimited job applications</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Faster resume processing</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant={currentTier === 'standard' ? 'outline' : 'default'}
                onClick={() => handleUpgrade('standard')}
                disabled={checkoutMutation.isPending || authLoading || currentTier === 'standard'}
                data-testid="button-upgrade-standard"
              >
                {currentTier === 'standard' ? 'Current Plan' : checkoutMutation.isPending ? "Loading..." : "Get Standard"}
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-primary relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge>Best Value</Badge>
            </div>
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>Perfect for applying to different job types</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">$45</span>
                <span className="text-muted-foreground">/year</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="font-medium">5 different resume profiles</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Unlimited resume uploads</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Fill unlimited job applications</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Switch profiles with one click</span>
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
                disabled={checkoutMutation.isPending || authLoading || currentTier === 'pro'}
                data-testid="button-upgrade-pro"
              >
                {currentTier === 'pro' ? 'Current Plan' : checkoutMutation.isPending ? "Loading..." : "Get Pro"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            With Pro, create separate profiles for different industries like Tech, Sales, or Customer Service - and fill each application with the right info!
          </p>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>All plans include a 7-day money-back guarantee</p>
          <p className="mt-2">Secure payments powered by Stripe</p>
        </div>
      </div>
    </div>
  );
}
