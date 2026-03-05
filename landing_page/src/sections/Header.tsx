import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`sticky top-0 z-[201] transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-sm border-b-2 border-stone-200 shadow-sm' 
          : 'bg-white border-b-2 border-stone-200'
      }`}
    >
      <div className="px-9">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <svg 
              viewBox="0 0 160 25" 
              className="h-6 w-auto"
              fill="currentColor"
            >
              <path d="M10.32 6.49c0 2.84-1.92 4.44-5.28 4.44H.01V.05h4.8c3.24 0 5.16 1.56 5.16 4.32 0 1.56-.6 2.64-1.68 3.24 1.44.48 2.52 1.8 2.52 3.72-.04.56-.04 1.16-.49 1.16-.44 0-.56-.48-.56-1.08 0-1.56-.84-2.64-2.52-2.64H3.37v4.32h2.4c2.76 0 4.32-1.2 4.32-3.48 0-.48.12-.96.6-.96.48 0 .6.48.6.96.04 2.88-2.04 4.56-5.52 4.56H.01v12.6h4.8c4.56 0 7.32-2.28 7.32-6.12 0-.6.12-1.08.6-1.08.48 0 .6.48.6 1.08.04 4.68-3.48 7.56-8.52 7.56H.01v.96h15.36V18.13h-3.6v-.96h3.6V6.49h-4.8v.96h4.8v10.68h-3.6v.96h3.6v10.68h5.04V.05h-5.04v6.44h-.96V.05H.01v6.44h4.8c2.16 0 3.36-.96 3.36-2.64 0-.48.12-.96.6-.96.48 0 .6.48.6.96-.04 2.04-1.44 3.48-3.96 3.48H3.37v4.32h2.4c2.16 0 3.36-.96 3.36-2.64 0-.48.12-.96.6-.96.48 0 .6.48.6.96zM28.57.05h-5.04v25.44h5.04V.05zm-2.52 12.72c-.8 0-1.44-.64-1.44-1.44s.64-1.44 1.44-1.44 1.44.64 1.44 1.44-.64 1.44-1.44 1.44zM46.09.05h-5.04v25.44h5.04V.05zm-2.52 12.72c-.8 0-1.44-.64-1.44-1.44s.64-1.44 1.44-1.44 1.44.64 1.44 1.44-.64 1.44-1.44 1.44zM63.61.05h-5.04v18.36h-7.2v7.08h5.04v-6.12h7.2V.05zm-9.72 12.72c-.8 0-1.44-.64-1.44-1.44s.64-1.44 1.44-1.44 1.44.64 1.44 1.44-.64 1.44-1.44 1.44zM81.13.05h-5.04v25.44h5.04V.05zm-2.52 12.72c-.8 0-1.44-.64-1.44-1.44s.64-1.44 1.44-1.44 1.44.64 1.44 1.44-.64 1.44-1.44 1.44zM98.65.05h-5.04v18.36h-7.2v7.08h5.04v-6.12h7.2V.05zm-9.72 12.72c-.8 0-1.44-.64-1.44-1.44s.64-1.44 1.44-1.44 1.44.64 1.44 1.44-.64 1.44-1.44 1.44zM116.17.05h-5.04v25.44h5.04V.05zm-2.52 12.72c-.8 0-1.44-.64-1.44-1.44s.64-1.44 1.44-1.44 1.44.64 1.44 1.44-.64 1.44-1.44 1.44zM133.69.05h-5.04v18.36h-7.2v7.08h5.04v-6.12h7.2V.05zm-9.72 12.72c-.8 0-1.44-.64-1.44-1.44s.64-1.44 1.44-1.44 1.44.64 1.44 1.44-.64 1.44-1.44 1.44zM151.21.05h-5.04v25.44h5.04V.05zm-2.52 12.72c-.8 0-1.44-.64-1.44-1.44s.64-1.44 1.44-1.44 1.44.64 1.44 1.44-.64 1.44-1.44 1.44z"/>
            </svg>
          </a>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium hover:bg-stone-100 rounded-lg transition-colors">
                  Product
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                <DropdownMenuItem>
                  <a href="#mail" className="w-full">Superhuman Mail</a>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <a href="#grammarly" className="w-full">Grammarly</a>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <a href="#coda" className="w-full">Coda</a>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <a href="#go" className="w-full">Superhuman Go</a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <a 
              href="#enterprise" 
              className="px-3 py-2 text-sm font-medium hover:bg-stone-100 rounded-lg transition-colors"
            >
              Enterprise
            </a>
            <a 
              href="#pricing" 
              className="px-3 py-2 text-sm font-medium hover:bg-stone-100 rounded-lg transition-colors"
            >
              Pricing
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <a 
              href="#contact" 
              className="hidden sm:block text-sm font-medium hover:text-purple-800 transition-colors"
            >
              Contact sales
            </a>
            <a 
              href="#login" 
              className="hidden sm:block text-sm font-medium hover:text-purple-800 transition-colors"
            >
              Log in
            </a>
            <a 
              href="#signup" 
              className="bg-purple-800 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-purple-900 transition-colors"
            >
              Sign up
            </a>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
