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

export function Manifesto() {
  return (
    <section className="bg-teal-900 text-white py-16 px-9">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div variants={itemVariants} className="order-2 lg:order-1">
            <h2 className="text-4xl md:text-5xl font-medium mb-6">
              Becoming Superhuman.
            </h2>
            <p className="text-lg text-white/80 leading-relaxed mb-8">
              When AI works everywhere you work, it starts to change <em className="italic">how</em> you work. 
              At first, you think faster and more deeply. Before you know it, you have the time to be more 
              creative, strategic, and impactful—free to do what only you can do.
            </p>
            <a
              href="#announcement"
              className="inline-flex items-center bg-white text-teal-900 px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors"
            >
              Read our announcement
            </a>
          </motion.div>

          {/* Image */}
          <motion.div 
            variants={itemVariants}
            className="order-1 lg:order-2"
          >
            <img
              src="/images/manifesto.webp"
              alt="Superhuman Manifesto"
              className="w-full h-auto rounded-lg"
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
