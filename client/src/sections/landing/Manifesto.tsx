import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

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

export function LandingManifesto() {
  const { t } = useI18n();

  return (
    <section className="bg-teal-900 text-white py-16 px-6 md:px-9">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div variants={itemVariants} className="order-2 lg:order-1">
            <h2 className="text-4xl md:text-5xl font-medium mb-6">
              {t("landing.manifesto.title")}
            </h2>
            <p className="text-lg text-white/80 leading-relaxed mb-8">
              {t("landing.manifesto.body")}
            </p>
            <a
              href="#features"
              className="inline-flex items-center bg-white text-teal-900 px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors"
            >
              See how it works
            </a>
          </motion.div>
          <motion.div variants={itemVariants} className="order-1 lg:order-2">
            <img
              src="/images/manifesto.webp"
              alt="PostulaPro"
              className="w-full h-auto rounded-lg"
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
