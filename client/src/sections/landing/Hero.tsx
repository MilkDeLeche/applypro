import { motion } from "framer-motion";
import { ArrowRight, FileText, Sparkles, Globe2, Settings, Download, Check, Plus } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { signIn } from "@/lib/auth";
import { HeroRobot } from "@/components/HeroRobot";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export function LandingHero() {
  const { t } = useI18n();

  return (
    <section className="relative min-h-[90vh] max-h-[920px] hero-gradient pt-16 isolate flex flex-col justify-between px-6 md:px-9 pb-16 overflow-x-hidden overflow-y-visible">
      {/* Top Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-30 px-4"
      >
        <a
          href="#features"
          className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-900/80 to-pink-900/80 backdrop-blur-sm rounded-2xl px-4 py-3 max-w-xl mx-auto hover:from-purple-900/90 hover:to-pink-900/90 transition-all"
        >
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Globe2 className="w-4 h-4 text-white" />
          </div>
          <span className="text-white text-sm sm:text-base">
            {t("landing.features.latam.title")} — Mexico & Chile
          </span>
          <span className="flex items-center gap-1 text-white text-sm font-medium border border-white/30 rounded-lg px-3 py-1">
            Learn more
            <ArrowRight className="w-4 h-4" />
          </span>
        </a>
      </motion.div>

      {/* Hero Content - Superhuman layout: title + CTA centered */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center justify-self-center text-center text-white gap-4 sm:gap-6 flex-shrink-0 mb-2 sm:mb-6"
      >
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium leading-none"
        >
          {t("landing.hero.title")}
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-200 to-pink-200">
            {t("landing.hero.highlight")}
          </span>
        </motion.h1>
        <motion.p variants={itemVariants} className="text-lg sm:text-xl md:text-2xl text-white/90 leading-8">
          {t("landing.hero.subtitle")}
        </motion.p>
        <motion.button
          variants={itemVariants}
          onClick={() => signIn()}
          className="group inline-flex items-center gap-3 bg-[#1b1938] border-2 border-white/[0.12] rounded-xl py-1.5 pl-4 pr-1.5 hover:bg-[#252244] transition-all duration-300"
        >
          <span className="font-bold text-white">{t("landing.cta.chrome")}</span>
          <span className="flex items-center justify-center w-8 h-8 bg-purple-600 rounded-lg group-hover:scale-105 transition-transform">
            <Plus className="w-4 h-4 text-white" />
          </span>
        </motion.button>
      </motion.div>

      {/* Grid: figure + floating cards overlay - Superhuman structure */}
      <div className="flex-grow min-h-0 grid grid-cols-1 grid-rows-1 max-w-[85rem] w-full mx-auto min-h-[28rem] overflow-visible">
        {/* Central figure - 3D AI Robot (Spline) */}
        <figure className="col-start-1 row-start-1 flex justify-center self-stretch">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="w-full max-w-[51rem] h-full max-h-[41rem] flex justify-center"
          >
            <HeroRobot />
          </motion.div>
        </figure>

        {/* Left cards - justify-self-start, self-start - Superhuman: chat + icon stack side-by-side, inbox below */}
        <div className="col-start-1 row-start-1 justify-self-start self-start flex flex-col gap-6 pt-4 pointer-events-none hidden md:flex">
          <div className="flex items-center gap-6 pointer-events-auto">
            {/* Chat card */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.8 }}
              className="glass rounded-2xl p-4 w-64 sm:w-72"
            >
              <p className="text-white text-xs leading-relaxed mb-3">
                I've parsed your resume. I found 3 roles that match your experience. Want me to
                tailor your cover letter for the Software Engineer position?
              </p>
              <div className="flex gap-2 mb-3">
                <button className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg">
                  yes
                </button>
                <button className="bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-lg">
                  no
                </button>
              </div>
              <div className="border border-white/30 rounded-lg p-2 flex items-center justify-between">
                <span className="text-white/90 text-xs">Generate cover letter</span>
                <ArrowRight className="w-3 h-3 text-white/70" />
              </div>
            </motion.div>
            {/* Icon stack - next to chat card */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 1 }}
              className="glass rounded-3xl p-1 flex flex-col gap-2 hidden lg:flex"
            >
              <div className="w-10 h-10 rounded-full bg-white/[0.13] flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Download className="w-5 h-5 text-white" />
              </div>
            </motion.div>
          </div>
          {/* Inbox card + Schedule bubble - grid with bubble overlapping */}
          <div className="grid grid-cols-1 grid-rows-1">
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 1.2 }}
              className="glass rounded-2xl p-4 w-72 sm:w-[29rem] col-start-1 row-start-1 justify-self-center self-end pointer-events-auto"
            >
              <div className="flex gap-4 mb-4 text-sm border-b border-white/20 pb-2">
                <span className="text-white">Applied <span className="opacity-60">12</span></span>
                <span className="text-white">Saved <span className="opacity-60">8</span></span>
                <span className="text-white">Interviews <span className="opacity-60">3</span></span>
              </div>
              <div className="space-y-2">
                {[
                  { company: "TechCorp", role: "Software Engineer", preview: "Applied 2 days ago" },
                  { company: "StartupXYZ", role: "Full Stack Dev", preview: "Interview scheduled" },
                  { company: "BigCo", role: "Senior Engineer", preview: "Applied 1 week ago" },
                ].map((job, i) => (
                  <div key={i} className="flex gap-2 py-1.5 border-b border-white/10 last:border-0 items-start">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-xs font-medium">{job.company}</span>
                        <span className="text-white/80 text-xs">{job.role}</span>
                      </div>
                      <span className="text-white/60 text-xs">{job.preview}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            {/* Schedule bubble - overlapping bottom-right, translate 25% 35% */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 1.3 }}
              className="glass col-start-1 row-start-1 justify-self-end self-end py-3 px-4 rounded-2xl pointer-events-auto translate-x-1/4 translate-y-1/4"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <Sparkles className="w-4 h-4 text-white flex-shrink-0" />
                <span className="text-white text-sm">Autofill this application in one click</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right cards - justify-self-end, self-center, items-end - vertical stack */}
        <div className="col-start-1 row-start-1 justify-self-end self-center flex flex-col gap-6 items-end pointer-events-none hidden lg:flex">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.9 }}
            className="glass py-3 px-4 rounded-3xl pointer-events-auto"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-white" />
              <span className="text-white text-sm">Tailor for LATAM format</span>
            </div>
          </motion.div>
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 1.1 }}
            className="glass py-4 px-6 rounded-2xl w-64 sm:w-72 pointer-events-auto"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-white" />
                <span className="text-xs font-bold text-white">Resume Profile</span>
                <span className="text-xs font-bold text-white/80 ml-auto">Share</span>
              </div>
              <h3 className="text-white text-sm font-medium">Marketing Manager</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Optimized for brand and growth roles. Uses your experience at{" "}
                <span className="underline">Acme Corp</span> and your MBA to highlight leadership.
              </p>
              <div className="flex items-center gap-1 flex-wrap">
                <span className="px-2 py-1 bg-white/10 rounded text-white/80 text-xs">T</span>
                <span className="px-2 py-1 bg-white/10 rounded font-bold text-white/80 text-xs">B</span>
                <span className="px-2 py-1 bg-white/10 rounded italic text-white/80 text-xs">I</span>
                <span className="px-2 py-1 bg-white/10 rounded underline text-white/80 text-xs">U</span>
              </div>
            </div>
          </motion.div>
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 1.3 }}
            className="glass py-3 px-4 rounded-3xl pointer-events-auto"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-purple-600 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-white text-sm">One-click fill</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
