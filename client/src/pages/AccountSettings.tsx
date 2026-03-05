import { useDeleteAccount } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AlertTriangle, Settings, ShieldCheck, Lock, Ban, CheckCircle } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function AccountSettings() {
  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      <header className="bg-background border-b border-border/40 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold font-display tracking-tight text-foreground flex items-center gap-3"
          >
            <Settings className="w-10 h-10 text-primary" />
            Account Settings
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground mt-4"
          >
            Manage your account preferences and settings.
          </motion.p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PrivacySection />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <DeleteAccountSection />
        </motion.div>
      </main>
    </div>
  );
}

function PrivacySection() {
  return (
    <Card className="border-emerald-500/30 bg-emerald-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="w-5 h-5" />
          Your Privacy Commitment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          At PostulaPro, your privacy is not a feature - it's our foundation. Unlike other autofill tools, we never monetize your data.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PrivacyItem 
            icon={<Ban className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            title="Never Sold"
            description="Your data is never sold or shared with third parties"
          />
          <PrivacyItem 
            icon={<Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            title="Encrypted"
            description="All data encrypted at rest and in transit"
          />
          <PrivacyItem 
            icon={<CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            title="You Own Your Data"
            description="Delete everything anytime with one click below"
          />
          <PrivacyItem 
            icon={<ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            title="No Tracking"
            description="We don't track your browsing or job applications"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function PrivacyItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="bg-background/50">
      <CardContent className="p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <p className="font-medium text-sm text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DeleteAccountSection() {
  const { mutate: deleteAccount, isPending } = useDeleteAccount();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleDelete = () => {
    if (confirmText === "DELETE") {
      deleteAccount();
    }
  };

  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="w-5 h-5" />
          Danger Zone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium text-foreground">Delete Account</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
        </div>
        
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); setConfirmText(""); }}>
          <DialogTrigger asChild>
            <Button 
              variant="destructive" 
              size="sm"
              data-testid="button-delete-account"
            >
              Delete Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive">Delete Your Account</DialogTitle>
              <DialogDescription>
                This action cannot be undone. Your account, all profiles, experience, and education data will be permanently deleted.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="confirm-delete">Type DELETE to confirm</Label>
                <Input 
                  id="confirm-delete" 
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  data-testid="input-confirm-delete"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={confirmText !== "DELETE" || isPending}
                  data-testid="button-confirm-delete"
                >
                  {isPending ? "Deleting..." : "Delete Account"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
