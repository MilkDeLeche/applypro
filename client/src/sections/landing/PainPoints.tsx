import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { XCircle, Clock, Zap, Trophy } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export function LandingPainPoints() {
  const { t } = useI18n();

  const pains = [
    {
      key: "landing.pain.loop",
      icon: XCircle,
      type: "pain" as const,
    },
    {
      key: "landing.pain.ghosted",
      icon: XCircle,
      type: "pain" as const,
    },
  ];

  const benefits = [
    {
      key: "landing.benefit.time",
      icon: Clock,
      type: "benefit" as const,
    },
    {
      key: "landing.benefit.confidence",
      icon: Zap,
      type: "benefit" as const,
    },
    {
      key: "landing.benefit.first",
      icon: Trophy,
      type: "benefit" as const,
    },
  ];

  return (
    <section className="bg-stone-50 py-16 px-6 md:px-9 border-t border-stone-200">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="max-w-5xl mx-auto"
      >
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-medium text-stone-900 mb-4">
            {t("landing.wegetit.title")}
          </h2>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            {t("landing.wegetit.subtitle")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
              {t("landing.pain.section.pain")}
            </h3>
            {pains.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.key}
                  variants={itemVariants}
                  className="flex gap-4 p-4 rounded-xl bg-red-50/60 border border-red-100"
                >
                  <Icon className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-stone-700 leading-relaxed">{t(item.key)}</p>
                </motion.div>
              );
            })}
          </div>
          <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
              {t("landing.pain.section.benefit")}
            </h3>
            {benefits.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.key}
                  variants={itemVariants}
                  className="flex gap-4 p-4 rounded-xl bg-emerald-50/60 border border-emerald-100"
                >
                  <Icon className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="text-stone-700 leading-relaxed">{t(item.key)}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
