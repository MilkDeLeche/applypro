import { motion } from 'framer-motion';
import { ArrowRight, Mail, Sparkles, Send, Clock, MessageSquare, FileText, Zap, Search, Calendar } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden hero-gradient">
      {/* Top Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-30 px-4 pt-4"
      >
        <a 
          href="#mail"
          className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-900/80 to-pink-900/80 backdrop-blur-sm rounded-2xl px-4 py-3 max-w-xl mx-auto hover:from-purple-900/90 hover:to-pink-900/90 transition-all"
        >
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Mail className="w-4 h-4 text-white" />
          </div>
          <span className="text-white text-sm sm:text-base">Looking for Superhuman Mail?</span>
          <span className="flex items-center gap-1 text-white text-sm font-medium border border-white/30 rounded-lg px-3 py-1">
            Learn more
            <ArrowRight className="w-4 h-4" />
          </span>
        </a>
      </motion.div>

      {/* Hero Content */}
      <div className="relative z-20 px-9 pt-8 pb-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center text-white max-w-4xl mx-auto mb-8"
        >
          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium leading-tight mb-4"
          >
            Superpowers,<br />everywhere you work
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8"
          >
            Mail, Docs, and AI that works in every app and tab
          </motion.p>
          
          <motion.a
            variants={itemVariants}
            href="#signup"
            className="group inline-flex items-center gap-3 bg-[#1b1938] border-2 border-white/20 rounded-xl px-6 py-3 hover:bg-[#252244] transition-all duration-300"
          >
            <span className="font-bold text-white">Get Superhuman</span>
            <span className="flex items-center justify-center w-8 h-8 btn-gradient rounded-lg group-hover:scale-105 transition-transform">
              <ArrowRight className="w-4 h-4 text-white" />
            </span>
          </motion.a>
        </motion.div>

        {/* Hero Image with Floating UI Cards */}
        <div className="relative max-w-6xl mx-auto">
          {/* Background Person Image */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative flex justify-center"
          >
            <img
              src="/images/person-1.webp"
              alt="Superhuman AI Assistant"
              className="w-full max-w-2xl h-auto object-contain"
            />
          </motion.div>

          {/* Floating UI Cards - Absolute Positioned */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Left Chat Card */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.8 }}
              className="absolute left-0 top-[5%] w-64 sm:w-72 pointer-events-auto"
            >
              <div className="glass rounded-2xl p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-white text-xs leading-relaxed">
                    Looks like you're chatting with Antonio and Laura in the{' '}
                    <span className="inline-block px-1.5 py-0.5 border border-white/30 rounded text-xs">
                      #launch-project-chat
                    </span>{' '}
                    and need to book a meeting. Would you like me to find a good time?
                  </p>
                </div>
                
                <div className="flex justify-end mb-3">
                  <div className="bg-white/20 rounded-xl rounded-br-sm px-3 py-1.5">
                    <span className="text-white text-xs">yes!</span>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-xs mb-2">
                      You're all available during these times:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="flex items-center gap-1 px-2 py-1 border border-white/30 rounded-lg text-white text-xs">
                        <Clock className="w-3 h-3" />
                        Monday at 3:00 PM
                      </span>
                      <span className="flex items-center gap-1 px-2 py-1 border border-white/30 rounded-lg text-white text-xs">
                        <Clock className="w-3 h-3" />
                        Tuesday at 1:00 PM
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="border border-white/30 rounded-lg p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-xs">book it for monday</span>
                    <Send className="w-3 h-3 text-white/70" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* AI Tools Palette - Center Left */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 1 }}
              className="absolute left-[28%] top-[20%] pointer-events-auto"
            >
              <div className="glass rounded-2xl p-2">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Email Inbox - Bottom Left */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 1.2 }}
              className="absolute left-[5%] bottom-[10%] w-64 sm:w-80 pointer-events-auto"
            >
              <div className="glass rounded-2xl p-3">
                <div className="flex gap-3 mb-3 text-xs">
                  <span className="text-white">Important <span className="text-white/60">12</span></span>
                  <span className="text-white/60">Calendar <span className="text-white/40">13</span></span>
                  <span className="text-white/60">Docs <span className="text-white/40">8</span></span>
                  <span className="text-white/60">Other <span className="text-white/40">19</span></span>
                </div>
                
                <div className="space-y-2">
                  {[
                    { sender: 'Sarah Kim', subject: 'Design Review moved to Thursday', preview: 'Hey team, quick heads-up...' },
                    { sender: 'James Patel', subject: 'Feedback on your client presentation', preview: 'Great work on the slides...' },
                    { sender: 'Laura Chen', subject: 'Coffee next week?', preview: "It's been a while since..." },
                    { sender: 'HR Team', subject: 'Reminder: Open enrollment closes Friday', preview: "Don't forget to update..." },
                    { sender: 'Mike Torres', subject: 'Sprint planning agenda attached', preview: 'Please review the agenda...' },
                  ].map((email, i) => (
                    <div key={i} className="flex gap-2 py-1 border-b border-white/10 last:border-0">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white text-xs font-medium">{email.sender}</span>
                          <span className="text-white text-xs truncate">{email.subject}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* AI Suggestion - Bottom Center */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 1.4 }}
              className="absolute left-[35%] bottom-[2%] pointer-events-auto"
            >
              <div className="glass rounded-2xl px-4 py-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-white" />
                  <p className="text-white text-xs">Schedule 15 minutes for a quick meeting with Mike</p>
                </div>
              </div>
            </motion.div>

            {/* RIGHT SIDE - Vertically Stacked Cards */}
            <div className="absolute right-0 top-0 bottom-0 flex flex-col gap-4 pointer-events-none py-8">
              {/* Tailor Language - Top Right */}
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.9 }}
                className="pointer-events-auto"
              >
                <div className="glass rounded-2xl px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-white" />
                    <p className="text-white text-xs">Tailor this language for executives</p>
                  </div>
                </div>
              </motion.div>

              {/* Document Editor - Middle Right */}
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 1.1 }}
                className="w-64 sm:w-72 pointer-events-auto"
              >
                <div className="glass rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/20">
                    <FileText className="w-4 h-4 text-white" />
                    <span className="text-white text-xs font-medium">Team workspace</span>
                    <span className="text-white/60 text-xs ml-auto">Share</span>
                    <MessageSquare className="w-3 h-3 text-white/60" />
                  </div>
                  
                  <h3 className="text-white text-sm font-medium mb-2">Streamlining Team Documentation</h3>
                  <p className="text-white/80 text-xs leading-relaxed mb-3">
                    I've been thinking about how our team can streamline the onboarding process for{' '}
                    <span className="underline">new-hires</span>.{' '}
                    <span className="bg-white/20 px-1 rounded">
                      Right now, documentation is scattered across different tools, which makes it hard to find answers quickly. If we consolidate into a single hub and add
                    </span>{' '}
                    more real-world examples, I think it'll cut down on{' '}
                    <span className="underline">repetative</span>{' '}
                    questions and help people ramp up faster.
                  </p>
                  
                  <div className="flex items-center gap-1 bg-white/10 rounded-full p-1">
                    <span className="px-2 py-1 text-white/80 text-xs">T</span>
                    <span className="px-2 py-1 text-white/80 text-xs font-bold">B</span>
                    <span className="px-2 py-1 text-white/80 text-xs italic">I</span>
                    <span className="px-2 py-1 text-white/80 text-xs underline">U</span>
                  </div>
                </div>
              </motion.div>

              {/* Proofread with Grammarly - Bottom Right */}
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 1.3 }}
                className="pointer-events-auto"
              >
                <div className="glass rounded-2xl px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-white" />
                    <p className="text-white text-xs">Proofread with Grammarly</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
