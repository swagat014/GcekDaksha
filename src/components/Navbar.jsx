"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronRight, Zap } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollAmount = window.scrollY;
      setIsScrolled(scrollAmount > 50); // Navbar gets compact after 50px scroll
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu if resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) { // md breakpoint is 768px
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  // navItems removed as they are not used on desktop or within mobile menu anymore.
  // The mobile menu will only contain the "Register Now" button.

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500
        ${
          isScrolled
            ? "py-3 bg-slate-950/90 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-black/50"
            : "py-5 bg-transparent" // Transparent when not scrolled, allowing hero to show through
        }
      `}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo - Pebble Style with Glow (Left side) */}
          <motion.a
            href="#home"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative flex items-center gap-2"
          >
            {/* Logo Glow Effect */}
            <div className="absolute -inset-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 opacity-0 blur-xl transition-all duration-500 group-hover:opacity-100" />
            
            <div className="relative flex items-center gap-2">
              {/* Logo Icon - Pebble Shaped 'D' */}
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 shadow-lg shadow-amber-500/25 ring-1 ring-white/10">
                <span className="text-lg font-black text-slate-900">D</span>
                {/* Subtle Shine Effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-transparent" />
              </div>
              
              {/* Logo Text with Subtitle */}
              <div className="flex flex-col">
                <span
                  className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  DAKSHA
                </span>
                <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-amber-500/80 -mt-0.5">
                  Sports Meet 2K26
                </span>
              </div>
            </div>
          </motion.a>

          {/* Removed: Desktop Navigation links were here */}

          {/* CTA Button - Enhanced with animations (Right side for desktop) */}
          <div className="hidden md:block">
            <motion.a
              href="#register"
              whileHover={{
                scale: 1.05,
                y: -3,
                boxShadow: "0 0 40px rgba(255, 23, 68, 0.8)", // More intense glow on hover
              }}
              whileTap={{ scale: 0.95 }}
              className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-red-800 px-6 py-2.5 text-sm font-bold text-white shadow-xl shadow-red-500/30 ring-1 ring-red-400/30 transition-all hover:shadow-red-500/50"
            >
              <Zap className="h-4 w-4" /> {/* Icon to add more visual interest */}
              <span>Register Now</span>
              <motion.div
                animate={{ x: [0, 3, 0] }} // Subtle bounce for the chevron
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ChevronRight className="h-4 w-4" />
              </motion.div>
              
              {/* Enhanced shine animation */}
              <div className="absolute inset-0 overflow-hidden rounded-full">
                <motion.div
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  animate={{ x: ["-100%", "100%"] }} // Continuous shine animation
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </motion.a>
          </div>

          {/* Mobile Menu Toggle Button (Right side for mobile) */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white ring-1 ring-white/10 backdrop-blur-sm transition-all hover:bg-white/10 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <AnimatePresence mode="wait"> {/* Animate between X and Menu icons */}
              {isMobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-5 w-5 text-amber-500" /> {/* Accent color for close */}
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-5 w-5 text-slate-300" /> {/* Softer color for menu */}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu - Animated Slide Down (ONLY Register Now button) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, scaleY: 0.95, originY: 0 }} // Animate from top
            animate={{ opacity: 1, height: "auto", scaleY: 1 }}
            exit={{ opacity: 0, height: 0, scaleY: 0.95 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden md:hidden border-t border-white/5 bg-slate-950/95 backdrop-blur-xl"
          >
            <div className="mx-auto max-w-7xl px-4 py-6">
              {/* Mobile CTA - Full Width and pebble-styled */}
              <motion.a
                href="#register"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }} // Slightly delayed entry
                onClick={() => setIsMobileMenuOpen(false)}
                className="group relative flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-800 py-3.5 text-base font-bold text-white shadow-xl shadow-red-500/30 ring-1 ring-red-400/30 transition-all hover:shadow-red-500/50"
              >
                <Zap className="h-4 w-4" />
                <span>Register Now</span>
                <motion.div
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ChevronRight className="h-4 w-4" />
                </motion.div>

                {/* Shine animation for mobile CTA */}
                <div className="absolute inset-0 overflow-hidden rounded-xl">
                  <motion.div
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}