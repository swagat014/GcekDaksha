import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Trophy, Heart, Sparkles, Star, ArrowUp, Mail, Phone, MapPin, Instagram, Facebook, Twitter, Linkedin, ChevronRight, Zap, Crown, Shield } from 'lucide-react';
import { useSiteContent } from '../contexts/SiteContentContext';

export default function Footer() {
  const footerRef = useRef(null);
  const isInView = useInView(footerRef, { once: true, amount: 0.1 });
  const siteContent = useSiteContent();
  const generalContact = siteContent.contact?.general || {};

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Sports', href: '#sports' },
    { label: 'Schedule', href: '#schedule' },
    { label: 'Register', href: '#register' },
    { label: 'Contact', href: '#contact' },
  ];

  const quickLinks = [
    { label: 'Rules & Regulations', href: '#' },
    { label: 'FAQs', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ];

  const socialLinks = [
    { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:text-pink-400' },
    { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:text-blue-400' },
    { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:text-sky-400' },
    { icon: Linkedin, href: '#', label: 'LinkedIn', color: 'hover:text-blue-500' },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.footer ref={footerRef} variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"}
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #050208 0%, #0a0418 30%, #110828 60%, #0d0520 100%)' }}>

      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-[20%] w-[500px] h-[300px] rounded-full blur-[150px] bg-purple-900/8" />
        <div className="absolute bottom-0 right-[20%] w-[400px] h-[250px] rounded-full blur-[130px] bg-violet-900/6" />
        <div className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(168,85,247,0.3) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>


      <div className="max-w-6xl mx-auto px-6 pt-16 pb-8 relative z-10">

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-14">

          {/* Brand Column */}
          <motion.div variants={fadeUp} className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600/25 to-violet-600/25 border border-purple-400/15 flex items-center justify-center shadow-lg shadow-purple-500/10">
                <Trophy className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-violet-300 to-fuchsia-300"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  DAKSHA
                </h3>
                <p className="text-[9px] text-purple-500/60 tracking-[0.2em] uppercase font-bold">Sports Festival 2026</p>
              </div>
            </div>

            <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-xs">
              The ultimate inter-college sports festival where champions rise, legends are born, and glory awaits.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2">
              {socialLinks.map((social, index) => (
                <motion.a key={index} href={social.href} whileHover={{ y: -3, scale: 1.1 }} whileTap={{ scale: 0.95 }}
                  className={`w-9 h-9 rounded-lg bg-purple-500/[0.06] border border-purple-500/[0.08] hover:border-purple-500/25 flex items-center justify-center text-gray-600 ${social.color} transition-all duration-300`}
                  aria-label={social.label}>
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Navigation */}
          <motion.div variants={fadeUp} className="lg:col-span-2">
            <h4 className="text-xs font-bold text-purple-400/70 tracking-[0.2em] uppercase mb-5 flex items-center gap-2">
              <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-violet-500 rounded-full" />
              Navigate
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link, index) => (
                <li key={index}>
                  <motion.a href={link.href} whileHover={{ x: 6 }}
                    className="group flex items-center gap-2 text-gray-500 hover:text-purple-300 transition-all duration-300 text-sm">
                    <ChevronRight className="w-3 h-3 text-purple-700 group-hover:text-purple-400 transition-colors" />
                    <span>{link.label}</span>
                  </motion.a>
                </li>
              ))}
              <li>
                <motion.a href="/admin" whileHover={{ x: 6 }}
                  className="group flex items-center gap-2 text-gray-600 hover:text-violet-400 transition-all duration-300 text-sm">
                  <Shield className="w-3 h-3 text-purple-800 group-hover:text-violet-400 transition-colors" />
                  {/* <span>Admin Panel</span> */}
                </motion.a>
              </li>
            </ul>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={fadeUp} className="lg:col-span-3">
            <h4 className="text-xs font-bold text-purple-400/70 tracking-[0.2em] uppercase mb-5 flex items-center gap-2">
              <div className="w-1 h-4 bg-gradient-to-b from-violet-500 to-fuchsia-500 rounded-full" />
              Resources
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <motion.a href={link.href} whileHover={{ x: 6 }}
                    className="group flex items-center gap-2 text-gray-500 hover:text-purple-300 transition-all duration-300 text-sm">
                    <ChevronRight className="w-3 h-3 text-purple-700 group-hover:text-purple-400 transition-colors" />
                    <span>{link.label}</span>
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Summary */}
          <motion.div variants={fadeUp} className="lg:col-span-3">
            <h4 className="text-xs font-bold text-purple-400/70 tracking-[0.2em] uppercase mb-5 flex items-center gap-2">
              <div className="w-1 h-4 bg-gradient-to-b from-fuchsia-500 to-pink-500 rounded-full" />
              Get in Touch
            </h4>
            <div className="space-y-3.5">
              {[
                { icon: Mail, text: generalContact.email || 'dakshagcek@gmail.com', color: 'text-violet-400' },
                // { icon: Phone, text: generalContact.phone || '+91 63712 82542', color: 'text-fuchsia-400' },
                { icon: MapPin, text: generalContact.address || 'Government College Of Engineering, Kalahandi, Bhawanipatna, Odisha 766001', color: 'text-purple-400' },
              ].map((item, index) => (
                <motion.div key={index} whileHover={{ x: 4 }}
                  className="flex items-start gap-3 group cursor-default">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/[0.06] border border-purple-500/[0.08] flex items-center justify-center shrink-0 mt-0.5 group-hover:border-purple-500/20 transition-all">
                    <item.icon className={`w-3 h-3 ${item.color}`} />
                  </div>
                  <span className="text-sm text-gray-500 group-hover:text-gray-300 transition-colors leading-relaxed">{item.text}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.a href="#register" whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}
              className="group relative mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl overflow-hidden w-fit">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-violet-600/20 border border-purple-500/15 rounded-xl" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-violet-600/30 rounded-xl opacity-0 group-hover:opacity-100 transition-all" />
              <Zap className="w-3.5 h-3.5 text-purple-400 relative z-10" />
              <span className="text-xs font-bold text-purple-300 relative z-10">Register Now</span>
              <ChevronRight className="w-3.5 h-3.5 text-purple-400 relative z-10 group-hover:translate-x-1 transition-transform" />
            </motion.a>
          </motion.div>
        </div>


        {/* Bottom Bar */}
        <motion.div variants={fadeUp}>
          <div className="h-[1px] bg-gradient-to-r from-transparent via-purple-500/10 to-transparent mb-6" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-600 text-xs">
              <span>© {new Date().getFullYear()}</span>
              <span className="text-purple-500/60 font-bold">DAKSHA</span>
              <span>—</span>
              <span>Inter College Sports Tournament</span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-gray-700">
              <span>Crafted with</span>
              <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <Heart className="w-3 h-3 text-purple-500 fill-purple-500" />
              </motion.div>
              <span>by swagat ranjan choudhury</span>
              <Sparkles className="w-3 h-3 text-purple-600/50" />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}