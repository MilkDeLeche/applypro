import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Pricing() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
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

  const handleUpgrade = () => {
    if (!user) {
      window.location.href = '/api/login';
      return;
    }
    checkoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" data-testid="text-pricing-title">Simple, Fair Pricing</h1>
          <p className="text-lg text-muted-foreground">Start free, upgrade when you need more</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>Perfect for trying out SudoFillr</CardDescription>
              <div className="text-3xl font-bold mt-4">$0</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>3 resume parses per month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>10 form autofills per month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Basic profile management</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Chrome extension access</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" disabled data-testid="button-free-current">
                Current Plan
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pro</CardTitle>
                <Badge>Best Value</Badge>
              </div>
              <CardDescription>For serious job seekers</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">$25</span>
                <span className="text-muted-foreground">/year</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Unlimited resume parses</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Unlimited form autofills</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Priority AI processing</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Advanced profile fields</span>
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
                onClick={handleUpgrade}
                disabled={checkoutMutation.isPending || authLoading}
                data-testid="button-upgrade-pro"
              >
                {checkoutMutation.isPending ? "Loading..." : "Upgrade to Pro"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>All plans include a 7-day money-back guarantee</p>
          <p className="mt-2">Secure payments powered by Stripe</p>
        </div>
      </div>
    </div>
  );
}
