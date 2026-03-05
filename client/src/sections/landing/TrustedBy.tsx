import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const logos = [
  { name: "LinkedIn", src: "/images/logos/linkedin.webp" },
  { name: "Indeed", src: "/images/logos/indeed.png" },
  { name: "Glassdoor", src: "/images/logos/glassdoor.png" },
  { name: "Monster", src: "/images/logos/monster.png" },
  { name: "ZipRecruiter", src: "/images/logos/ziprecruiter.png" },
  { name: "We Work Remotely", src: "/images/logos/we-work-remotely.png" },
];

export function LandingTrustedBy() {
  const { t } = useI18n();

  return (
    <section className="bg-stone-100 py-16 px-6 md:px-9">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-7xl mx-auto"
      >
        <motion.p variants={itemVariants} className="text-xl text-center text-stone-900 mb-10">
          Trusted by job seekers across US, Mexico & Chile
        </motion.p>
        <motion.div variants={itemVariants} className="border-l-2 border-t-2 border-stone-300">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {logos.map((logo) => (
              <div
                key={logo.name}
                className="border-b-2 border-r-2 border-stone-300 flex items-center justify-center p-6 h-24 hover:bg-stone-50 transition-colors"
              >
                <img
                  src={logo.src}
                  alt={logo.name}
                  className="max-w-full max-h-full object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
