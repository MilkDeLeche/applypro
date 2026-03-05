import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chrome, Puzzle, Settings, Copy, Check, Monitor } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function ExtensionGuide() {
  const [copied, setCopied] = useState(false);
  
  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    {
      title: "Install from Chrome Web Store",
      description: "Add the PostulaPro extension to Chrome with one click.",
      icon: <Chrome className="w-6 h-6 text-primary" />,
      action: (
        <Button variant="default" size="sm" className="mt-3" disabled>
          <Puzzle className="w-4 h-4 mr-2" />
          Coming Soon to Chrome Web Store
        </Button>
      )
    },
    {
      title: "Pin the Extension",
      description: "Click the puzzle icon in Chrome's toolbar and pin PostulaPro for easy access.",
      icon: <Puzzle className="w-6 h-6 text-violet-500" />
    },
    {
      title: "Connect to Your Account",
      description: "Open the extension, paste your server URL (shown below), and click Save.",
      icon: <Settings className="w-6 h-6 text-emerald-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-display text-foreground mb-4">
            Install the PostulaPro Extension
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Add our browser extension to start autofilling job applications instantly.
            Just 3 simple steps to get started.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full w-fit mx-auto">
            <Monitor className="w-4 h-4" />
            <span>Desktop browsers only (Chrome, Edge, Brave)</span>
          </div>
        </div>

        <div className="grid gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-0 flex flex-col md:flex-row">
                  <div className="bg-muted/50 p-6 flex items-center justify-center md:w-24 shrink-0 border-b md:border-b-0 md:border-r border-border/50">
                    <div className="w-10 h-10 rounded-full bg-background shadow-sm flex items-center justify-center">
                      <span className="font-display font-bold text-foreground">{index + 1}</span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex items-start gap-4">
                    <div className="mt-1 p-2 bg-primary/5 rounded-lg">
                      {step.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                      {step.action}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 p-6 bg-gradient-to-r from-primary/10 to-violet-500/10 rounded-2xl border border-primary/10"
        >
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">Your Server URL</h3>
            <p className="text-muted-foreground mb-4">
              Copy this URL and paste it into the extension to connect your account:
            </p>
            <div className="inline-flex items-center gap-2">
              <div className="bg-background px-4 py-3 rounded-lg border border-border shadow-sm font-mono text-sm text-primary">
                {window.location.origin}
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={copyUrl}
                data-testid="button-copy-url"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <h3 className="text-lg font-semibold text-foreground mb-3">How It Works</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Once connected, visit any job application page. A small PostulaPro button will appear 
            in the corner when form fields are detected. Click it to instantly fill your information!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
