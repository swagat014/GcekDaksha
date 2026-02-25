import { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, Linkedin, Sparkles, Users, ArrowUpRight, Zap, Heart, ExternalLink, Copy, Check, Crown, Send, Star, Shield } from 'lucide-react';
import { contactInfo } from '../data/contact';

// Mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
};

export default function Contact() {
  const [activeCard, setActiveCard] = useState(null);
  const [copiedItem, setCopiedItem] = useState(null);
  const [hoveredCoordinator, setHoveredCoordinator] = useState(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  const isMobile = useIsMobile();

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 50 },
    visible: (i = 0) => ({
      opacity: 1, y: 0,
      transition: { duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.92 },
    visible: (i = 0) => ({
      opacity: 1, scale: 1,
      transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  const socialIcons = { Instagram, Facebook, Twitter, LinkedIn: Linkedin };
  const socialColors = {
    Instagram: { gradient: 'from-pink-500 via-rose-500 to-purple-600', glow: 'rgba(236,72,153,0.4)', bg: 'from-pink-500/15 to-purple-500/15' },
    Facebook: { gradient: 'from-blue-500 to-blue-700', glow: 'rgba(59,130,246,0.4)', bg: 'from-blue-500/15 to-blue-700/15' },
    Twitter: { gradient: 'from-sky-400 to-blue-500', glow: 'rgba(56,189,248,0.4)', bg: 'from-sky-400/15 to-blue-500/15' },
    LinkedIn: { gradient: 'from-blue-600 to-blue-800', glow: 'rgba(37,99,235,0.4)', bg: 'from-blue-600/15 to-blue-800/15' },
  };

  const contactItems = [
    { icon: Mail, text: contactInfo.general.email, label: 'Email Us', color: 'text-violet-400', id: 'email', gradient: 'from-violet-500/15 to-purple-500/15', borderColor: 'hover:border-violet-500/30' },
    { icon: Phone, text: contactInfo.general.phone, label: 'Call Us', color: 'text-fuchsia-400', id: 'phone', gradient: 'from-fuchsia-500/15 to-pink-500/15', borderColor: 'hover:border-fuchsia-500/30' },
    { icon: MapPin, text: contactInfo.general.address, label: 'Visit Us', color: 'text-purple-400', id: 'address', gradient: 'from-purple-500/15 to-indigo-500/15', borderColor: 'hover:border-purple-500/30' },
  ];

  return (
    <section id="contact" ref={sectionRef} className="py-24 px-4 pt-28 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #050208 0%, #0d0520 25%, #150a30 50%, #0d0520 75%, #050208 100%)' }}>

      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large ambient orbs - disabled on mobile */}
        {!isMobile && (
          <>
            <motion.div className="absolute top-[-5%] right-[5%] w-[700px] h-[700px] rounded-full blur-[200px]"
              animate={{
                background: [
                  'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(109,40,217,0.08) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
                ],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div className="absolute bottom-[-10%] left-[0%] w-[600px] h-[600px] rounded-full blur-[180px]"
              animate={{
                background: [
                  'radial-gradient(circle, rgba(126,34,206,0.06) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(192,38,211,0.08) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(126,34,206,0.06) 0%, transparent 70%)',
                ],
              }}
              transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
            />
            <motion.div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] rounded-full blur-[150px]"
              animate={{
                background: [
                  'radial-gradient(circle, rgba(88,28,135,0.06) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(147,51,234,0.08) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(88,28,135,0.06) 0%, transparent 70%)',
                ],
              }}
              transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 7 }}
            />
          </>
        )}

        {/* Simplified mobile background */}
        {isMobile && (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 via-black/10 to-transparent" />
        )}

        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(168,85,247,0.4) 1px, transparent 0)', backgroundSize: '48px 48px' }}
        />

        {/* Side accents */}
        <div className="absolute left-0 top-[15%] w-[1px] h-[70%] bg-gradient-to-b from-transparent via-purple-500/15 to-transparent hidden lg:block" />
        <div className="absolute right-0 top-[15%] w-[1px] h-[70%] bg-gradient-to-b from-transparent via-violet-500/15 to-transparent hidden lg:block" />

        {/* Top/Bottom fade lines */}
        <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-purple-500/10 to-transparent" />
        <div className="absolute bottom-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-purple-500/10 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">

        {/* ═══ Header ═══ */}
        <motion.div variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"} className="text-center mb-16">
          <motion.div custom={0} variants={scaleIn}
            className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-purple-500/[0.06] backdrop-blur-xl border border-purple-500/[0.12] mb-7">
            <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
              <Send className="w-4 h-4 text-purple-400" />
            </motion.div>
            <span className="text-xs font-bold text-purple-300/80 tracking-[0.25em] uppercase">Contact Us</span>
            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <Sparkles className="w-3.5 h-3.5 text-purple-400/60" />
            </motion.div>
          </motion.div>

          <motion.h2 custom={1} variants={fadeUp}
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-5"
            style={{ fontFamily: "'Orbitron', sans-serif" }}>
            <span className="text-white/90">GET IN </span>
            <span className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 30%, #c084fc 50%, #a855f7 70%, #6d28d9 100%)',
                filter: 'drop-shadow(0 0 50px rgba(139,92,246,0.35))',
              }}>
              TOUCH
            </span>
          </motion.h2>

          {/* Decorative divider */}
          <motion.div custom={2} variants={fadeUp} className="flex items-center justify-center gap-4 mb-6">
            <motion.div className="h-[1px] w-16 md:w-24 bg-gradient-to-r from-transparent to-purple-500/50"
              initial={{ scaleX: 0, originX: 1 }} whileInView={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.4 }} viewport={{ once: true }} />
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-500/40" />
              <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity }} className="w-2 h-2 rounded-full bg-purple-400" />
              <div className="w-1.5 h-1.5 rounded-full bg-violet-500/40" />
            </div>
            <motion.div className="h-[1px] w-16 md:w-24 bg-gradient-to-l from-transparent to-purple-500/50"
              initial={{ scaleX: 0, originX: 0 }} whileInView={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.4 }} viewport={{ once: true }} />
          </motion.div>

          <motion.p custom={3} variants={fadeUp} className="text-gray-400 max-w-lg mx-auto text-sm md:text-base font-light leading-relaxed">
            Questions about <span className="text-purple-400 font-semibold">DAKSHA 2026</span>? Our team is ready to help you every step of the way.
          </motion.p>
        </motion.div>

        {/* ═══ Contact Info Cards ═══ */}
        <motion.div variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {contactItems.map((item, index) => (
            <motion.div key={item.id} custom={index} variants={scaleIn}
              whileHover={{ y: -8, scale: 1.02 }}
              onMouseEnter={() => setActiveCard(item.id)}
              onMouseLeave={() => setActiveCard(null)}
              className="group relative cursor-pointer"
              onClick={() => copyToClipboard(item.text, item.id)}>

              <div className={`absolute -inset-[1px] bg-gradient-to-br ${item.gradient} rounded-2xl transition-all duration-500 blur-md ${activeCard === item.id ? 'opacity-100' : 'opacity-0'}`} />

              <div className={`relative bg-purple-950/20 backdrop-blur-xl rounded-2xl border border-purple-500/[0.08] ${item.borderColor} p-6 transition-all duration-500 overflow-hidden`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-60 transition-all duration-700`} />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.gradient} border border-purple-400/[0.15] flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <AnimatePresence mode="wait">
                      {copiedItem === item.id ? (
                        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[10px] font-bold text-emerald-400">Copied!</span>
                        </motion.div>
                      ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/15 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <Copy className="w-3 h-3 text-purple-400" />
                          <span className="text-[9px] font-bold text-purple-400">Copy</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <p className="text-[10px] text-purple-400/60 font-bold tracking-[0.2em] uppercase mb-2">{item.label}</p>
                  <p className="text-sm text-gray-300 font-medium leading-relaxed group-hover:text-white transition-colors duration-300">{item.text}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ═══ Main Content Grid ═══ */}
        <div className="grid lg:grid-cols-5 gap-4">

          {/* Coordinators — 3 cols */}
          <motion.div variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"} className="lg:col-span-3">
            <motion.div custom={0} variants={scaleIn} className="relative group/card">
              <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500/10 via-violet-500/10 to-fuchsia-500/10 rounded-3xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 blur-md" />

              <div className="relative bg-purple-950/20 backdrop-blur-xl rounded-3xl border border-purple-500/[0.08] hover:border-purple-500/[0.15] p-6 md:p-8 transition-all duration-500 overflow-hidden">
                {/* Subtle inner glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-400/[0.15] flex items-center justify-center">
                      <Crown className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white tracking-wide">Daksha Coordinators</h3>
                      <p className="text-[10px] text-purple-400/50 font-medium">Your go-to contacts for DAKSHA</p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/15">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-emerald-400 font-bold">Available</span>
                  </div>
                </div>

                {/* Coordinator Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {contactInfo.coordinators.map((coordinator, index) => (
                    <motion.div key={index} custom={index + 1} variants={scaleIn}
                      whileHover={{ y: -5, scale: 1.01 }}
                      onMouseEnter={() => setHoveredCoordinator(index)}
                      onMouseLeave={() => setHoveredCoordinator(null)}
                      className="group relative">

                      <div className={`absolute -inset-[1px] bg-gradient-to-br from-purple-500/25 to-violet-500/25 rounded-2xl transition-all duration-500 blur-sm ${hoveredCoordinator === index ? 'opacity-100' : 'opacity-0'}`} />

                      <div className="relative p-4 rounded-2xl bg-purple-900/10 border border-purple-500/[0.06] hover:border-purple-500/[0.18] hover:bg-purple-900/20 transition-all duration-400 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-all duration-500" />

                        <div className="relative z-10">
                          {/* Avatar & Name */}
                          <div className="flex items-start gap-3.5 mb-4">
                            <div className="relative shrink-0">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/30 to-violet-600/30 border border-purple-400/20 flex items-center justify-center shadow-lg shadow-purple-500/10">
                                <span className="text-sm font-black bg-clip-text text-transparent bg-gradient-to-br from-purple-300 to-violet-300">
                                  {coordinator.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#0d0520]" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-white truncate">{coordinator.name}</h4>
                              <div className="flex items-center gap-1.5 mt-1">
                                <Shield className="w-3 h-3 text-purple-400" />
                                <span className="text-[10px] text-purple-400 font-semibold">{coordinator.role}</span>
                              </div>
                            </div>
                          </div>

                          {/* Contact Details */}
                          <div className="space-y-1.5">
                            {[
                              { icon: Phone, text: coordinator.phone, color: 'text-fuchsia-400', copyId: `coord-phone-${index}` },
                              { icon: Mail, text: coordinator.email, color: 'text-violet-400', copyId: `coord-email-${index}` },
                            ].map((detail, di) => (
                              <motion.div key={di} whileHover={{ x: 4 }}
                                onClick={(e) => { e.stopPropagation(); copyToClipboard(detail.text, detail.copyId); }}
                                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-purple-500/[0.06] transition-all cursor-pointer group/item">
                                <div className="w-7 h-7 rounded-lg bg-purple-500/[0.08] border border-purple-500/[0.1] flex items-center justify-center group-hover/item:border-purple-500/25 group-hover/item:bg-purple-500/[0.12] transition-all">
                                  <detail.icon className={`w-3 h-3 ${detail.color}`} />
                                </div>
                                <span className="text-[11px] text-gray-500 group-hover/item:text-gray-200 transition-colors flex-1 truncate">{detail.text}</span>
                                <AnimatePresence mode="wait">
                                  {copiedItem === detail.copyId ? (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                      <Check className="w-3 h-3 text-emerald-400" />
                                    </motion.div>
                                  ) : (
                                    <Copy className="w-3 h-3 text-purple-700 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column — 2 cols */}
          <motion.div variants={stagger} initial="hidden" animate={isInView ? "visible" : "hidden"} className="lg:col-span-2 space-y-4">
          </motion.div>
        </div>

        {/* Bottom Decorative */}
        <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 1 }} className="mt-16 flex items-center justify-center gap-4">
          <div className="h-[1px] flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-purple-500/15" />
          <Star className="w-3 h-3 text-purple-600/40" />
          <p className="text-[10px] text-purple-600/40 tracking-[0.3em] uppercase font-bold">DAKSHA 2026</p>
          <Star className="w-3 h-3 text-purple-600/40" />
          <div className="h-[1px] flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-purple-500/15" />
        </motion.div>
      </div>
    </section>
  );
}