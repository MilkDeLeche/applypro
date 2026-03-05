import { motion } from "framer-motion";
import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
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

export function LandingFooter() {
  const { t } = useI18n();

  return (
    <footer className="bg-[#4e242c] text-white py-16 px-6 md:px-9">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          <motion.div variants={itemVariants} className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold">
                P
              </div>
              <span className="text-xl font-bold">PostulaPro</span>
            </Link>
            <h3 className="text-2xl font-medium">
              AI-powered job applications for US, Mexico & Chile
            </h3>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h4 className="font-bold mb-4">Product</h4>
                <ul className="space-y-3">
                  <li>
                    <Link href="/" className="text-white/80 hover:text-white transition-colors text-sm">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/extension" className="text-white/80 hover:text-white transition-colors text-sm">
                      Chrome Extension
                    </Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="text-white/80 hover:text-white transition-colors text-sm">
                      Pricing
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Company</h4>
                <ul className="space-y-3">
                  <li>
                    <a href="#features" className="text-white/80 hover:text-white transition-colors text-sm">
                      How it works
                    </a>
                  </li>
                  <li>
                    <a href="#features" className="text-white/80 hover:text-white transition-colors text-sm">
                      Features
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Legal</h4>
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="text-white/80 hover:text-white transition-colors text-sm">
                      Terms
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-white/80 hover:text-white transition-colors text-sm">
                      Privacy
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="border-t border-white/20 pt-8">
          <p className="text-center text-white/60 text-sm">
            © {new Date().getFullYear()} PostulaPro / SudoFillr. {t("landing.privacy.tagline")}
          </p>
        </motion.div>
      </motion.div>
    </footer>
  );
}
