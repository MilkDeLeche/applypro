import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Zap, ShieldCheck, MousePointerClick, ArrowRight, Lock, Trash2, Globe, Ban } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { apiUrl } from "@/lib/api";

export default function Landing() {
  const { t } = useI18n();
  
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/5 blur-3xl rounded-full -z-10" />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="max-w-4xl mx-auto text-center space-y-8 py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 mb-4"
          >
            <Zap className="w-4 h-4 fill-primary" />
            <span>AI-Powered Job Applications</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-5xl md:text-7xl font-bold font-display tracking-tight text-foreground"
          >
            {t("landing.hero.title")} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-600">{t("landing.hero.highlight")}</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            {t("landing.hero.subtitle")}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
            data-testid="welcome-message"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">
              {t("landing.hero.welcome")} <span className="text-muted-foreground font-normal">{t("landing.hero.welcome.secondary")}</span>
            </span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Button 
              size="lg" 
              variant="gradient"
              className="w-full sm:w-auto text-lg h-14 px-8"
              onClick={() => window.location.href = apiUrl("/api/login")}
            >
              {t("landing.hero.cta")} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto h-14 px-8 text-lg"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              How it Works
            </Button>
          </motion.div>
        </div>

        <motion.div
          id="features"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto pb-20 w-full"
        >
          <FeatureCard 
            icon={<MousePointerClick className="w-8 h-8 text-primary" />}
            title={t("landing.features.autofill.title")}
            description={t("landing.features.autofill.desc")}
          />
          <FeatureCard 
            icon={<Zap className="w-8 h-8 text-violet-500" />}
            title={t("landing.features.ai.title")}
            description={t("landing.features.ai.desc")}
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-8 h-8 text-emerald-500" />}
            title={t("landing.features.privacy.title")}
            description={t("landing.features.privacy.desc")}
          />
        </motion.div>

        {/* Privacy Trust Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-6xl mx-auto py-20 border-t border-border/40"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium border border-emerald-500/20 mb-4">
              <Lock className="w-4 h-4" />
              <span>{t("privacy.badge")}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-4">
              {t("privacy.title")} <span className="text-emerald-500">{t("privacy.highlight")}</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("privacy.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PrivacyCard 
              icon={<Ban className="w-6 h-6 text-red-500" />}
              title={t("privacy.never_sold.title")}
              description={t("privacy.never_sold.desc")}
            />
            <PrivacyCard 
              icon={<Trash2 className="w-6 h-6 text-orange-500" />}
              title={t("privacy.delete.title")}
              description={t("privacy.delete.desc")}
            />
            <PrivacyCard 
              icon={<Lock className="w-6 h-6 text-emerald-500" />}
              title={t("privacy.encrypted.title")}
              description={t("privacy.encrypted.desc")}
            />
            <PrivacyCard 
              icon={<Globe className="w-6 h-6 text-violet-500" />}
              title={t("privacy.latam.title")}
              description={t("privacy.latam.desc")}
            />
          </div>
        </motion.section>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/40">
        <p>&copy; {new Date().getFullYear()} SudoFillr. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors">
      <CardContent className="p-8 flex flex-col items-center text-center gap-4">
        <div className="p-4 rounded-2xl bg-background shadow-md shadow-black/5 ring-1 ring-border">
          {icon}
        </div>
        <h3 className="text-xl font-bold font-display">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

function PrivacyCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardContent className="p-6 text-center space-y-3">
        <div className="mx-auto w-12 h-12 rounded-full bg-background flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <h4 className="font-bold font-display">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
