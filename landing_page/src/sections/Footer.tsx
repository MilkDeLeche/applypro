import { motion } from 'framer-motion';
import { Linkedin, Twitter, Instagram, Facebook, ExternalLink } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

const products = [
  { name: 'Superhuman Go', href: '#go' },
  { name: 'Grammarly', href: '#grammarly' },
  { name: 'Coda', href: '#coda' },
  { name: 'Superhuman Mail', href: '#mail' },
  { name: 'Agent Store', href: '#agents' },
];

const company = [
  { name: 'Contact Us', href: '#contact' },
  { name: 'Help Center', href: '#support' },
  { name: 'Careers', href: '#careers', external: true },
  { name: 'Partners', href: '#partners' },
  { name: 'Superhuman Platform', href: '#platform' },
];

const legal = [
  { name: 'Terms', href: '#terms' },
  { name: 'Privacy Policy', href: '#privacy', external: true },
  { name: 'Trust', href: '#trust' },
  { name: 'Customer Business Agreement', href: '#cba' },
  { name: 'Legal Notices', href: '#notices' },
];

const social = [
  { name: 'LinkedIn', href: '#linkedin', icon: Linkedin },
  { name: 'X', href: '#x', icon: Twitter },
  { name: 'TikTok', href: '#tiktok', icon: () => <span className="text-sm font-bold">TT</span> },
  { name: 'Instagram', href: '#instagram', icon: Instagram },
  { name: 'Threads', href: '#threads', icon: () => <span className="text-sm font-bold">@</span> },
  { name: 'Facebook', href: '#facebook', icon: Facebook },
];

export function Footer() {
  return (
    <footer className="bg-[#4e242c] text-white py-16 px-9">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          {/* Logo & Tagline */}
          <motion.div variants={itemVariants} className="lg:col-span-4">
            <svg 
              viewBox="0 0 160 25" 
              className="h-6 w-auto mb-6"
              fill="currentColor"
            >
              <path d="M10.32 6.49c0 2.84-1.92 4.44-5.28 4.44H.01V.05h4.8c3.24 0 5.16 1.56 5.16 4.32 0 1.56-.6 2.64-1.68 3.24 1.44.48 2.52 1.8 2.52 3.72-.04.56-.04 1.16-.49 1.16-.44 0-.56-.48-.56-1.08 0-1.56-.84-2.64-2.52-2.64H3.37v4.32h2.4c2.76 0 4.32-1.2 4.32-3.48 0-.48.12-.96.6-.96.48 0 .6.48.6.96.04 2.88-2.04 4.56-5.52 4.56H.01v12.6h4.8c4.56 0 7.32-2.28 7.32-6.12 0-.6.12-1.08.6-1.08.48 0 .6.48.6 1.08.04 4.68-3.48 7.56-8.52 7.56H.01v.96h15.36V18.13h-3.6v-.96h3.6V6.49h-4.8v.96h4.8v10.68h-3.6v.96h3.6v10.68h5.04V.05h-5.04v6.44h-.96V.05H.01v6.44h4.8c2.16 0 3.36-.96 3.36-2.64 0-.48.12-.96.6-.96.48 0 .6.48.6.96-.04 2.04-1.44 3.48-3.96 3.48H3.37v4.32h2.4c2.16 0 3.36-.96 3.36-2.64 0-.48.12-.96.6-.96.48 0 .6.48.6.96zM28.57.05h-5.04v25.44h5.04V.05zm-2.52 12.72c-.8 0-1.44-.64-1.44-1.44s.64-1.44 1.44-1.44 1.44.64 1.44 1.44-.64 1.44-1.44 1.44zM46.09.05h-5.04v25.44h5.04V.05zm-2.52 12.72c-.8 0-1.44-.64-1.44-1.44s.64-1.44 1.44-1.44 1.44.64 1.44 1.44-.64 1.44-1.44 1.44zM63.61.05h-5.04v18.36h-7.2v7.08h5.04v-6.12h7.2V.05zm-9.72 12.72c-.8 0-1.44-.64-1.44-1.44s.64-1.44 1.44-1.44 1.44.64 1.44 1.44-.64 1.44-1.44 1.44zM81.13.05h-5.04v25.44h5.04V.05zm-2.52 12.72c-.8 0-1.44-.64-1.44-1.44s.64-1.44 1.44-1.44 1.44.64 1.44 1.44-.64 1.44-1.44 1.44zM98.65.05h-5.04v18.36h-7.2v7.08h5.04v-6.12h7.2V.05zm-9.72 12.72c-.8 0-1.44-.64-1.44-1.44s.64-1.44 1.44-1.44 1.44.64 1.44 1.44-.64 1.44-1.44 1.44zM116.17.05h-5.04v25.44h5.04V.05zm-2.52 12.72c-.8 0-1.44-.64-1.44-1.44s.64-1.44 1.44-1.44 1.44.64 1.44 1.44-.64 1.44-1.44 1.44zM133.69.05h-5.04v18.36h-7.2v7.08h5.04v-6.12h7.2V.05zm-9.72 12.72c-.8 0-1.44-.64-1.44-1.44s.64-1.44 1.44-1.44 1.44.64 1.44 1.44-.64 1.44-1.44 1.44zM151.21.05h-5.04v25.44h5.04V.05zm-2.52 12.72c-.8 0-1.44-.64-1.44-1.44s.64-1.44 1.44-1.44 1.44.64 1.44 1.44-.64 1.44-1.44 1.44z"/>
            </svg>
            <h3 className="text-2xl font-medium">
              Builders of Superhuman Platform apps
            </h3>
          </motion.div>

          {/* Navigation Columns */}
          <motion.div variants={itemVariants} className="lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {/* Products */}
              <div>
                <h4 className="font-bold mb-4">Products</h4>
                <ul className="space-y-3">
                  {products.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="text-white/80 hover:text-white transition-colors text-sm"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="font-bold mb-4">Company</h4>
                <ul className="space-y-3">
                  {company.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="text-white/80 hover:text-white transition-colors text-sm inline-flex items-center gap-1"
                      >
                        {item.name}
                        {item.external && <ExternalLink className="w-3 h-3" />}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="font-bold mb-4">Legal</h4>
                <ul className="space-y-3">
                  {legal.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="text-white/80 hover:text-white transition-colors text-sm inline-flex items-center gap-1"
                      >
                        {item.name}
                        {item.external && <ExternalLink className="w-3 h-3" />}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Connect */}
              <div>
                <h4 className="font-bold mb-4">Connect</h4>
                <ul className="space-y-3">
                  {social.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className="text-white/80 hover:text-white transition-colors text-sm inline-flex items-center gap-2"
                        >
                          <Icon className="w-4 h-4" />
                          {item.name}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Large Wordmark */}
        <motion.div 
          variants={itemVariants}
          className="border-t border-white/20 pt-8"
        >
          <svg 
            viewBox="0 0 343 33" 
            className="w-full max-w-4xl mx-auto h-auto opacity-30"
            fill="currentColor"
          >
            <path d="M187.952 12.5855V0.713135H195.114V31.84H187.952V19.0752H175.276V31.84H168.115V0.71318H175.276V12.5856L187.952 12.5855Z" />
            <path d="M0.0115874 22.1911H7.17332C7.66466 25.0829 9.8392 26.5063 13.7534 26.5063C17.3566 26.5063 19.3561 25.1282 19.3561 22.7731C19.3561 20.9486 18.4243 20.1072 15.7978 19.5252L11.1269 18.5031C3.52446 16.8144 0.587614 14.2329 0.587614 9.16099C0.587614 3.60329 5.52391 -0.000244141 13.0811 -0.000244141C20.6382 -0.000244141 25.6198 3.46765 25.9305 9.692H18.8141C18.3227 7.29151 16.3683 6.04344 13.0754 6.04344C9.78264 6.04344 7.73812 7.24618 7.73812 9.33629C7.73812 10.9345 8.62483 11.6462 11.7427 12.4032L16.1423 13.3802C23.8804 15.0237 26.5066 17.4695 26.5066 22.9875C26.5066 28.9012 21.6606 32.5497 13.7421 32.5497C5.42799 32.5497 0.310723 28.7261 0 22.1854L0.0115874 22.1911Z" />
            <path d="M53.4225 0.713135H60.5842V18.6345C60.5842 28.0614 56.139 32.5517 46.9778 32.5517C37.8166 32.5517 33.3716 28.0614 33.3716 18.6345V0.713135H40.5333V18.8099C40.5333 23.8818 42.4875 26.1013 46.9834 26.1013C51.4793 26.1013 53.4337 23.8762 53.4337 18.8099V0.713135H53.4225Z" />
            <path d="M125.297 31.84H101.817V0.713135H125.297V7.11818H108.973V12.6759H122.828V19.0809H108.973V25.4406H125.297V31.8456V31.84Z" />
            <path d="M223.705 0.713135H230.866V18.6345C230.866 28.0614 226.421 32.5517 217.26 32.5517C208.099 32.5517 203.654 28.0614 203.654 18.6345V0.713135H210.815V18.8099C210.815 23.8818 212.77 26.1013 217.266 26.1013C221.762 26.1013 223.717 23.8762 223.717 18.8099V0.713135H223.705Z" />
            <path d="M255.407 15.6132L263.009 0.713379H271.415V31.8402H264.434V11.253L256.203 27.5759H254.604L246.376 11.253V31.8402H239.396V0.713379H247.798L255.401 15.6132H255.407Z" />
            <path d="M308.362 31.8386H301.248L300.09 23.8804H287.325L286.167 31.8386H279.05L281.896 12.1377C283.273 3.24221 286.386 0 293.684 0C300.981 0 304.133 3.24783 305.465 12.1377L308.359 31.8386H308.362ZM288.308 17.3906H299.113L298.446 12.7197C297.732 8.00347 296.577 6.45033 293.69 6.45033C290.805 6.45033 289.685 8.00908 288.975 12.7197L288.308 17.3906Z" />
            <path d="M336.016 20.9902V0.713379H343V31.8402H335.836L322.988 11.5633V31.8402H316.007V0.713379H323.168L336.016 20.9902Z" />
            <path d="M148.984 0.638184C151.183 0.638234 153.114 1.04691 154.778 1.86377C156.442 2.68151 157.735 3.85521 158.656 5.38525C159.577 6.91585 160.038 8.72098 160.038 10.8003C160.038 12.8798 159.576 14.445 158.655 15.9751C157.734 17.5058 156.063 18.784 154.343 19.5034C154.035 19.6322 153.373 19.8604 152.484 20.1538L160.442 31.811H151.905L145.549 22.3481C143.977 22.8343 142.431 23.3064 141.134 23.7026V31.8384H133.971V0.638184H148.984ZM141.134 16.7144C144.477 15.866 149.227 14.6403 150.344 14.2271C151.117 13.9413 153.073 13.2905 153.073 10.8003C153.073 7.82439 150.123 7.54642 148.262 7.54639H141.134V16.7144Z" />
            <path d="M69.1135 0.638184H84.1256C86.3243 0.638184 88.2555 1.04684 89.9199 1.86375C91.5837 2.68148 92.8763 3.85497 93.7976 5.38503C94.7185 6.91574 95.1794 8.72094 95.1794 10.8005C95.1794 12.88 94.7176 14.4448 93.7968 15.9749C92.8755 17.5056 91.2059 18.7841 89.4849 19.5035C87.6234 20.2817 72.8462 24.7471 72.8462 24.7471L72.8577 17.5761C72.8577 17.5761 83.7177 14.8807 85.4862 14.2268C86.2588 13.9411 88.2145 13.2908 88.2145 10.8005C88.2145 7.82417 85.2649 7.54663 83.404 7.54663H74.2695L76.2753 5.54082V31.8382H69.1135V0.638184Z" />
          </svg>
        </motion.div>
      </motion.div>
    </footer>
  );
}
