import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Zap, ShieldCheck, MousePointerClick, ArrowRight } from "lucide-react";

export default function Landing() {
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
            Stop typing. <br />
            Start <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-600">applying.</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Upload your resume once. SudoFillr's smart extension autofills tedious job application forms with 99% accuracy using GPT-4o.
          </motion.p>
          
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
              onClick={() => window.location.href = "/api/login"}
            >
              Get Started for Free <ArrowRight className="ml-2 w-5 h-5" />
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
            title="One-Click Fill"
            description="Our Chrome extension detects application forms and fills them instantly."
          />
          <FeatureCard 
            icon={<Zap className="w-8 h-8 text-violet-500" />}
            title="AI Parsing"
            description="We use advanced LLMs to extract every detail from your PDF resume correctly."
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-8 h-8 text-emerald-500" />}
            title="Privacy First"
            description="Your data is stored securely and never shared with third parties."
          />
        </motion.div>
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
