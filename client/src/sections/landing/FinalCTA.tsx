import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { signIn } from "@/lib/auth";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
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

export function LandingFinalCTA() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 cta-gradient" />
      <div className="absolute left-0 top-0 bottom-0 w-1/2 opacity-60">
        <img
          src="/images/flower.webp"
          alt=""
          className="w-full h-full object-cover object-left"
        />
      </div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-10 px-6 md:px-9 py-24"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <motion.h2
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-medium text-stone-900 text-center lg:text-left"
            >
              {t("landing.hero.title")} {t("landing.hero.highlight")}
            </motion.h2>
            <motion.button
              variants={itemVariants}
              onClick={() => signIn()}
              className="inline-flex items-center bg-stone-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-stone-800 transition-colors whitespace-nowrap"
            >
              {t("landing.hero.cta")}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
