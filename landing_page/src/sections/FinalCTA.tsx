import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
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

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 cta-gradient" />
      
      {/* Flower Image */}
      <div className="absolute left-0 top-0 bottom-0 w-1/2 opacity-60">
        <img
          src="/images/flower.webp"
          alt=""
          className="w-full h-full object-cover object-left"
        />
      </div>

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-10 px-9 py-24"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <motion.h2 
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-medium text-stone-900 text-center lg:text-left"
            >
              AI that works everywhere you work
            </motion.h2>
            
            <motion.a
              variants={itemVariants}
              href="#signup"
              className="inline-flex items-center bg-stone-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-stone-800 transition-colors whitespace-nowrap"
            >
              Get Superhuman
            </motion.a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
