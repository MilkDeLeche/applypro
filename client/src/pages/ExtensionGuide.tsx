import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Puzzle, CheckCircle, Code } from "lucide-react";
import { motion } from "framer-motion";

export default function ExtensionGuide() {
  const steps = [
    {
      title: "Download Extension",
      description: "Get the extension package. This contains the 'manifest.json' and scripts.",
      icon: <Download className="w-6 h-6 text-primary" />,
      action: <Button variant="outline" size="sm" className="mt-2" disabled>Coming Soon</Button>
    },
    {
      title: "Open Chrome Extensions",
      description: "Navigate to chrome://extensions in your browser address bar.",
      icon: <Puzzle className="w-6 h-6 text-violet-500" />
    },
    {
      title: "Enable Developer Mode",
      description: "Toggle the 'Developer mode' switch in the top right corner.",
      icon: <Code className="w-6 h-6 text-emerald-500" />
    },
    {
      title: "Load Unpacked",
      description: "Click 'Load unpacked' and select the folder you downloaded.",
      icon: <CheckCircle className="w-6 h-6 text-blue-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-display text-foreground mb-4">
            Install the SudoFillr Extension
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            To start autofilling applications, you need to add our extension to your browser.
            Follow these simple steps.
          </p>
        </div>

        <div className="grid gap-8">
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
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 bg-gradient-to-r from-primary/10 to-violet-500/10 rounded-2xl border border-primary/10 text-center"
        >
          <h3 className="text-lg font-semibold text-foreground mb-2">Configure the Extension</h3>
          <p className="text-muted-foreground mb-4">
            Once installed, click the extension icon and enter the URL below to connect it to your dashboard:
          </p>
          <div className="inline-flex items-center gap-2 bg-background px-4 py-2 rounded-lg border border-border shadow-sm font-mono text-sm text-primary">
            {window.location.origin}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
