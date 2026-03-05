import { motion } from 'framer-motion';
import { Sparkles, Send, Clock, MessageSquare, FileText, Calendar, Search, Zap } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

export function AIMockups() {
  return (
    <section className="relative -mt-32 z-20 px-9 pb-24">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - AI Chat */}
          <motion.div variants={cardVariants} className="lg:col-span-5">
            <div className="glass rounded-2xl p-6 h-full">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm leading-relaxed">
                    Looks like you're chatting with Antonio and Laura in the{' '}
                    <span className="inline-block px-2 py-0.5 border border-white/30 rounded-lg text-xs">
                      #launch-project-chat
                    </span>{' '}
                    and need to book a meeting. Would you like me to find a good time?
                  </p>
                </div>
              </div>
              
              {/* User Response */}
              <div className="flex justify-end mb-4">
                <div className="bg-white/20 rounded-2xl rounded-br-sm px-4 py-2">
                  <span className="text-white text-sm">yes!</span>
                </div>
              </div>
              
              {/* AI Response with Time Slots */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm mb-3">
                    You're all available during these times:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 border border-white/30 rounded-lg text-white text-sm hover:bg-white/10 transition-colors">
                      <Clock className="w-4 h-4" />
                      Monday at 3:00 PM
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 border border-white/30 rounded-lg text-white text-sm hover:bg-white/10 transition-colors">
                      <Clock className="w-4 h-4" />
                      Tuesday at 1:00 PM
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Input Field */}
              <div className="border border-white/30 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">book it for monday</span>
                  <Send className="w-4 h-4 text-white/70" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Middle Column - AI Tools Palette */}
          <motion.div variants={cardVariants} className="lg:col-span-2">
            <div className="glass rounded-3xl p-4">
              <div className="flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center animate-float">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Document Editor */}
          <motion.div variants={cardVariants} className="lg:col-span-5">
            <div className="glass rounded-2xl p-6">
              {/* Toolbar */}
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/20">
                <FileText className="w-5 h-5 text-white" />
                <span className="text-white text-sm font-medium">Team workspace</span>
                <span className="text-white/60 text-sm">Share</span>
                <MessageSquare className="w-4 h-4 text-white/60" />
              </div>
              
              {/* Document Content */}
              <div className="space-y-4">
                <h3 className="text-white text-lg font-medium">Streamlining Team Documentation</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  I've been thinking about how our team can streamline the onboarding process for{' '}
                  <span className="underline">new-hires</span>.{' '}
                  <span className="bg-white/20 px-1 rounded">
                    Right now, documentation is scattered across different tools, which makes it hard to find answers quickly. If we consolidate into a single hub and add
                  </span>{' '}
                  more real-world examples, I think it'll cut down on{' '}
                  <span className="underline">repetative</span>{' '}
                  questions and help people ramp up faster.
                </p>
                
                {/* Formatting Toolbar */}
                <div className="flex items-center gap-1 bg-white/10 rounded-full p-1">
                  <button className="px-3 py-1.5 text-white/80 text-sm hover:bg-white/10 rounded-full transition-colors">Aa</button>
                  <button className="px-3 py-1.5 text-white/80 text-sm font-bold hover:bg-white/10 rounded-full transition-colors">B</button>
                  <button className="px-3 py-1.5 text-white/80 text-sm italic hover:bg-white/10 rounded-full transition-colors">I</button>
                  <button className="px-3 py-1.5 text-white/80 text-sm underline hover:bg-white/10 rounded-full transition-colors">U</button>
                  <div className="w-px h-4 bg-white/20 mx-1" />
                  <button className="px-3 py-1.5 text-white/80 text-sm hover:bg-white/10 rounded-full transition-colors">Align</button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Row - Email Preview & AI Suggestion */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Email Inbox Preview */}
          <motion.div variants={cardVariants}>
            <div className="glass rounded-2xl p-4">
              {/* Tabs */}
              <div className="flex gap-4 mb-4">
                <span className="text-white text-sm">Important <span className="text-white/60">12</span></span>
                <span className="text-white text-sm">Calendar <span className="text-white/60">13</span></span>
                <span className="text-white text-sm">Docs <span className="text-white/60">8</span></span>
                <span className="text-white text-sm">Other <span className="text-white/60">19</span></span>
              </div>
              
              {/* Email List */}
              <div className="space-y-3">
                {[
                  { sender: 'Sarah Kim', subject: 'Design Review moved to Thursday', preview: 'Hey team, quick heads-up — we\'re pushing the design review to Thursday at 2pm.' },
                  { sender: 'James Patel', subject: 'Feedback on your client presentation', preview: 'Great work on the slides. I added a couple of notes around clarity and flow.' },
                  { sender: 'Laura Chen', subject: 'Coffee next week?', preview: 'It\'s been a while since we caught up — are you free for a quick coffee next week?' },
                ].map((email, i) => (
                  <div key={i} className="flex gap-3 py-2 border-b border-white/10 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-medium">{email.sender}</span>
                        <span className="text-white text-sm truncate">{email.subject}</span>
                      </div>
                      <p className="text-white/60 text-xs truncate">{email.preview}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* AI Suggestion */}
          <motion.div variants={cardVariants} className="flex items-end">
            <div className="glass rounded-3xl px-4 py-3">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-white" />
                <p className="text-white text-sm">Schedule 15 minutes for a quick meeting with Mike</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
