'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Calendar, MapPin, Target, Star, Sparkles, Crown, ChevronRight, Medal, Timer, GraduationCap, Rocket, Heart, Eye, Building2, Quote } from 'lucide-react';

export default function Home() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [isMobile, setIsMobile] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleMouseMove = (e) => {
      if (window.innerWidth >= 768) {
        // Throttle mouse updates for better performance
        const now = Date.now();
        if (!handleMouseMove.lastUpdate || now - handleMouseMove.lastUpdate > 16) { // ~60fps
          mouseX.set((e.clientX - window.innerWidth / 2) / 50);
          mouseY.set((e.clientY - window.innerHeight / 2) / 50);
          handleMouseMove.lastUpdate = now;
        }
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', checkMobile);
    };
  }, [mouseX, mouseY]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: (custom = 0) => ({
      opacity: 1, y: 0,
      transition: { duration: 0.8, delay: custom * 0.12, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: (custom = 0) => ({
      opacity: 1, scale: 1,
      transition: { duration: 0.7, delay: custom * 0.1, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.08 } },
  };

  const stats = [
    { icon: Trophy, value: '9', label: 'Events', color: 'from-amber-400 to-orange-600', bg: 'from-amber-500/10 to-orange-600/10', iconColor: 'text-amber-400' },
    { icon: Users, value: '800+', label: 'Athletes', color: 'from-cyan-400 to-blue-600', bg: 'from-cyan-500/10 to-blue-600/10', iconColor: 'text-cyan-400' },
    { icon: Calendar, value: '3 Days', label: 'Duration', color: 'from-violet-400 to-purple-600', bg: 'from-violet-500/10 to-purple-600/10', iconColor: 'text-violet-400' },
    { icon: MapPin, value: '1', label: 'Arena', color: 'from-rose-400 to-red-600', bg: 'from-rose-500/10 to-red-600/10', iconColor: 'text-rose-400' },
  ];

  const sports = [
    // { name: "Football", emoji: "⚽", players: "11v11" },
    { name: "Cricket", emoji: "🏏", players: "11v11" },
    { name: "Volleyball", emoji: "🏐", players: "6v6" },
    { name: "Kabaddi", emoji: "🤼", players: "7v7" },
    { name: "Badminton", emoji: "🏸", players: "Singles/Doubles" },
    { name: "Chess", emoji: "♟️", players: "1v1" },
    // { name: "Table Tennis", emoji: "🏓", players: "Singles/Doubles" },
    { name: "Kho-Kho", emoji: "🏃", players: "12v12" },
  ];

  const tabItems = [
    { id: 'about', label: 'About Us', icon: Heart },
    { id: 'principal', label: "Principal's Message", icon: Crown },
    { id: 'missionvision', label: 'Mission & Vision', icon: Rocket },
  ];

  const orbCount = isMobile ? 2 : 15; // Further reduced for low-tier mobiles
  const [orbs] = useState(() =>
    Array.from({ length: orbCount }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2.5,
      duration: 25 + Math.random() * 35,
      delay: Math.random() * -30,
      opacity: 0.15 + Math.random() * 0.35,
    }))
  );

  return (
    <div id="home" className="bg-[#020205] relative overflow-x-hidden" ref={containerRef}>

      {/* ═══ Background ═══ */}
      <div className="fixed inset-0 z-0">
        <motion.div style={isMobile ? {} : { x: mouseX, y: mouseY }}>
          {/* Desktop-only animated orbs - completely disabled on mobile */}
          {!isMobile && (
            <div className="block">
              {orbs.map(orb => (
                <motion.div
                  key={orb.id}
                  className="absolute rounded-full"
                  animate={{ opacity: [orb.opacity, orb.opacity * 1.5, orb.opacity] }}
                  transition={{ duration: orb.duration, repeat: Infinity, delay: orb.delay, ease: "easeInOut" }}
                  style={{
                    left: `${orb.x}%`,
                    top: `${orb.y}%`,
                    width: `${orb.size}px`,
                    height: `${orb.size}px`,
                    background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(147,130,255,0.4) 100%)',
                  }}
                />
              ))}
            </div>
          )}

          {/* Ultra-simplified mobile background - no animations */}
          {isMobile && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 via-purple-900/3 to-black/10" />
          )}

          {/* Desktop-only heavy gradient animations */}
          <div className="hidden md:block">
            <motion.div
              className="absolute top-[-10%] left-[5%] sm:left-[10%] w-[250px] sm:w-[350px] md:w-[500px] h-[250px] sm:h-[350px] md:h-[500px] rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px]"
              animate={{
                background: [
                  'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
                ],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute bottom-[-10%] right-[5%] sm:right-[10%] w-[200px] sm:w-[300px] md:w-[400px] h-[200px] sm:h-[300px] md:h-[400px] rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px]"
              animate={{
                background: [
                  'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
                ],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 10 }}
            />
            <motion.div
              className="absolute top-[40%] right-[10%] sm:right-[20%] w-[150px] sm:w-[220px] md:w-[300px] h-[150px] sm:h-[220px] md:h-[300px] rounded-full blur-[50px] sm:blur-[60px] md:blur-[80px]"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                background: [
                  'radial-gradient(circle, rgba(251,146,60,0.1) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(251,146,60,0.15) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(251,146,60,0.1) 0%, transparent 70%)',
                ],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
            />
          </div>
        </motion.div>

        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize: isMobile ? '35px 35px' : '50px 50px',
          }}
        />
      </div>

      {/* ═══════════════════ HERO SECTION ═══════════════════ */}
      <section className="min-h-[100dvh] flex items-center justify-center relative overflow-hidden pt-16 sm:pt-20 pb-8 sm:pb-10 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="text-center"
          >
            {/* Floating Badge */}
            <motion.div custom={0} variants={scaleIn} className="flex justify-center mb-6 sm:mb-8 md:mb-10">
              <motion.div className="relative group" whileHover={{ scale: 1.02 }}>
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
                <div className="relative inline-flex items-center gap-2 sm:gap-3 md:gap-4 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-full bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] hover:border-white/[0.15] transition-all duration-500">
                  <motion.div
                    className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 shrink-0"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-300 tracking-wider whitespace-nowrap">
                    Est. 2009 • Bhawanipatna, Odisha
                  </span>
                  <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-400 shrink-0" />
                </div>
              </motion.div>
            </motion.div>

            {/* Main Title */}
            <motion.div custom={1} variants={fadeInUp} className="relative mb-5 sm:mb-6 md:mb-8">
              <motion.p
                className="text-sm sm:text-lg md:text-xl lg:text-2xl text-gray-400 font-light tracking-[0.2em] sm:tracking-[0.3em] uppercase mb-3 sm:mb-4 md:mb-6"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                Welcome To
              </motion.p>

              <h1
                className="text-[18vw] sm:text-[16vw] md:text-[14vw] lg:text-[12vw] font-black leading-[0.85] tracking-tighter"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                <span className="block relative">
                  <span
                    className="relative z-10 bg-clip-text text-transparent"
                    style={{
                      backgroundImage: 'linear-gradient(135deg, #10b981 0%, #3b82f6 35%, #8b5cf6 65%, #06b6d4 100%)',
                      WebkitBackgroundClip: 'text',
                      filter: 'drop-shadow(0 0 40px rgba(59,130,246,0.3))',
                    }}
                  >
                    GCEK
                  </span>
                  <div className="absolute -inset-4 sm:-inset-6 md:-inset-10 bg-gradient-to-r from-emerald-500/10 via-blue-500/15 to-purple-500/10 blur-[60px] sm:blur-[80px] md:blur-[100px] -z-10" />
                </span>
              </h1>

              {/* Full Name */}
              <motion.div custom={2} variants={fadeInUp} className="mt-4 sm:mt-6 md:mt-8 relative">
                <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                  <motion.div
                    className="h-[1px] sm:h-[2px] w-8 sm:w-12 md:w-24 bg-gradient-to-r from-transparent via-emerald-500/50 to-emerald-500"
                    initial={{ scaleX: 0, originX: 1 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    viewport={{ once: true }}
                  />
                  <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-400/60 shrink-0" />
                  <motion.div
                    className="h-[1px] sm:h-[2px] w-8 sm:w-12 md:w-24 bg-gradient-to-l from-transparent via-blue-500/50 to-blue-500"
                    initial={{ scaleX: 0, originX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    viewport={{ once: true }}
                  />
                </div>
                <h2 className="text-sm sm:text-lg md:text-2xl lg:text-3xl font-bold text-white/80 tracking-wide px-2">
                  Government College of Engineering Kalahandi
                </h2>
              </motion.div>
            </motion.div>

            {/* Description */}
            <motion.div custom={3} variants={fadeInUp} className="mb-8 sm:mb-10 md:mb-12 max-w-4xl mx-auto px-2">
              <p className="text-xs sm:text-sm md:text-base lg:text-xl text-gray-400 leading-relaxed font-light">
                A premier technical institution of Odisha, nurturing tomorrow&apos;s engineers and innovators.
                Affiliated to BPUT and approved by AICTE, we blend academic excellence with holistic development
                to create leaders who shape the future of technology.
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[1px] h-[50%] bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent hidden lg:block" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-[50%] bg-gradient-to-b from-transparent via-blue-500/20 to-transparent hidden lg:block" />

        <motion.div
          className="absolute top-32 left-10 w-32 h-32 border-l-2 border-t-2 border-emerald-500/10 rounded-tl-3xl hidden lg:block"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1 }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-32 h-32 border-r-2 border-b-2 border-blue-500/10 rounded-br-3xl hidden lg:block"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        />

        <div className="absolute top-14 left-3 w-8 h-8 border-l border-t border-emerald-500/[0.08] rounded-tl-lg sm:hidden" />
        <div className="absolute top-14 right-3 w-8 h-8 border-r border-t border-blue-500/[0.08] rounded-tr-lg sm:hidden" />
      </section>

      {/* ═══════════════════ OUR IDENTITY SECTION ═══════════════════ */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <motion.div
              custom={0}
              variants={scaleIn}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] mb-4 sm:mb-6 md:mb-8"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <span className="text-[10px] sm:text-xs font-bold text-gray-400 tracking-[0.15em] sm:tracking-[0.2em] uppercase">
                Know Us Better
              </span>
            </motion.div>

            <motion.h2
              custom={1}
              variants={fadeInUp}
              className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              <span className="text-white/90">OUR </span>
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #10b981, #3b82f6, #8b5cf6)' }}
              >
                IDENTITY
              </span>
            </motion.h2>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex justify-center mb-8 sm:mb-10 md:mb-12 px-2"
          >
            <div className="inline-flex p-1 sm:p-1.5 rounded-xl sm:rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] w-full sm:w-auto overflow-x-auto">
              {tabItems.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center justify-center gap-1.5 sm:gap-2 flex-1 sm:flex-none px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-500 ${
                      activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 rounded-lg sm:rounded-xl border border-white/[0.1]"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                    <TabIcon
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 shrink-0 ${
                        activeTab === tab.id ? 'text-emerald-400' : ''
                      }`}
                    />
                    <span className="relative z-10 whitespace-nowrap">{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Content Cards */}
          <div className="relative min-h-[280px] sm:min-h-[300px]">
            <AnimatePresence mode="wait">
              {/* ═══ ABOUT TAB ═══ */}
              {activeTab === 'about' && (
                <motion.div
                  key="about"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
                >
                  {/* About Card 1 */}
                  <motion.div
                    className="group relative"
                    whileHover={{ y: -5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-2xl sm:rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                    <div className="relative h-full bg-white/[0.02] backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border border-white/[0.05] hover:border-white/[0.1] transition-all duration-500 overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 sm:w-24 md:w-32 h-20 sm:h-24 md:h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full" />
                      <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="p-2 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 shrink-0">
                          <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-0.5 sm:mb-1">
                            Excellence in Education
                          </h3>
                          <p className="text-emerald-400/60 text-xs sm:text-sm">Since 2009</p>
                        </div>
                      </div>
                      <p className="text-gray-400 leading-relaxed text-xs sm:text-sm md:text-base">
                        GCEK stands as a beacon of technical education in Western Odisha, committed to producing
                        industry-ready engineers through cutting-edge curriculum, world-class infrastructure, and
                        experienced faculty.
                      </p>
                    </div>
                  </motion.div>

                  {/* About Card 2 */}
                  <motion.div
                    className="group relative"
                    whileHover={{ y: -5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl sm:rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                    <div className="relative h-full bg-white/[0.02] backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border border-white/[0.05] hover:border-white/[0.1] transition-all duration-500 overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 sm:w-24 md:w-32 h-20 sm:h-24 md:h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
                      <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="p-2 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 shrink-0">
                          <Users className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-0.5 sm:mb-1">
                            Holistic Development
                          </h3>
                          <p className="text-blue-400/60 text-xs sm:text-sm">Beyond Academics</p>
                        </div>
                      </div>
                      <p className="text-gray-400 leading-relaxed text-xs sm:text-sm md:text-base">
                        We foster all-round growth through sports, cultural activities, technical clubs, and industry
                        collaborations, preparing students not just for careers but for life&apos;s challenges.
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* ═══ PRINCIPAL'S MESSAGE TAB ═══ */}
              {activeTab === 'principal' && (
                <motion.div
                  key="principal"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="relative group max-w-5xl mx-auto">
                    <div className="absolute -inset-2 sm:-inset-3 bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-blue-500/15 rounded-3xl sm:rounded-[2rem] blur-2xl sm:blur-3xl opacity-50 group-hover:opacity-80 transition-all duration-700" />

                    <div className="relative bg-white/[0.02] backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/[0.05] hover:border-white/[0.1] transition-all duration-500 overflow-hidden">
                      {/* Decorative Corner Elements */}
                      <div className="absolute top-0 left-0 w-24 sm:w-32 md:w-48 h-24 sm:h-32 md:h-48 bg-gradient-to-br from-amber-500/8 to-transparent rounded-br-full" />
                      <div className="absolute bottom-0 right-0 w-24 sm:w-32 md:w-48 h-24 sm:h-32 md:h-48 bg-gradient-to-tl from-emerald-500/8 to-transparent rounded-tl-full" />
                      <div className="absolute top-0 right-0 w-16 sm:w-20 md:w-28 h-16 sm:h-20 md:h-28 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full" />

                      {/* Floating Orbs */}
                      <motion.div
                        className="absolute top-8 right-12 w-2 h-2 rounded-full bg-amber-400/40 hidden md:block"
                        animate={{ y: [0, -8, 0], opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      <motion.div
                        className="absolute bottom-16 left-10 w-1.5 h-1.5 rounded-full bg-emerald-400/40 hidden md:block"
                        animate={{ y: [0, 8, 0], opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: 0.7 }}
                      />
                      <motion.div
                        className="absolute top-1/2 right-8 w-1 h-1 rounded-full bg-blue-400/40 hidden lg:block"
                        animate={{ y: [0, -6, 0], opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity, delay: 1.2 }}
                      />

                      <div className="relative z-10 p-6 sm:p-8 md:p-10 lg:p-14">
                        {/* Top Label */}
                        <div className="flex justify-center mb-6 sm:mb-8">
                          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-[10px] sm:text-xs font-bold text-amber-300/80 tracking-[0.15em] uppercase">
                              Principal&apos;s Message
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8 lg:gap-12">
                          {/* Principal Image */}
                          <motion.div
                            className="relative shrink-0"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                          >
                            {/* Animated Ring */}
                            <motion.div
                              className="absolute -inset-2 sm:-inset-3 rounded-full"
                              style={{
                                background:
                                  'conic-gradient(from 0deg, rgba(245,158,11,0.3), rgba(16,185,129,0.3), rgba(59,130,246,0.3), rgba(245,158,11,0.3))',
                              }}
                              animate={{ rotate: 360 }}
                              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                            />
                            <div className="absolute -inset-2 sm:-inset-3 rounded-full bg-[#020205] scale-[0.92]" />

                            {/* Image Container */}
                            <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-52 lg:h-52 rounded-full overflow-hidden border-2 border-white/[0.08]">
                              <div className="w-full h-full bg-gradient-to-br from-amber-500/20 via-emerald-500/20 to-blue-500/20 flex items-center justify-center">
                                {!imgError ? (
                                  <img
                                    src="/principal.jpg"
                                    alt="Principal - GCEK"
                                    className="w-full h-full object-cover"
                                    onError={() => setImgError(true)}
                                  />
                                ) : (
                                  <div className="flex items-center justify-center w-full h-full">
                                    <span className="text-4xl sm:text-5xl md:text-6xl">👨‍🏫</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Status Badge */}
                            {/* <motion.div
                              className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 p-1.5 sm:p-2 rounded-full bg-[#020205] border border-white/[0.1]"
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" />
                            </motion.div> */}
                          </motion.div>

                          {/* Message Content */}
                          <div className="flex-1 text-center lg:text-left">
                            <motion.div
                              className="mb-4 sm:mb-5 flex justify-center lg:justify-start"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.3 }}
                            >
                              <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 border border-amber-500/15">
                                <Quote className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400/70" />
                              </div>
                            </motion.div>

                            <motion.p
                              className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 leading-relaxed mb-5 sm:mb-6 md:mb-8 italic font-light"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.4 }}
                            >
                              &ldquo;At GCEK, we believe in shaping not just engineers, but visionary leaders who can
                              transform society. Our commitment extends beyond textbooks — we nurture creativity,
                              sportsmanship, and the relentless spirit of innovation. Events like DAKSHA embody our
                              philosophy of holistic excellence, where every student discovers their true
                              potential.&rdquo;
                            </motion.p>

                            {/* Divider */}
                            <motion.div
                              className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5 justify-center lg:justify-start"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.5, delay: 0.5 }}
                            >
                              <div className="h-[1px] w-8 sm:w-12 bg-gradient-to-r from-amber-500/50 to-transparent" />
                              <Star className="w-3 h-3 text-amber-400/50" />
                              <div className="h-[1px] w-8 sm:w-12 bg-gradient-to-l from-amber-500/50 to-transparent" />
                            </motion.div>

                            {/* Name & Title */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.6 }}
                            >
                              <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">
                                Prof. (Dr.) Subhransu Sekhar Dash
                              </h4>
                              <p className="text-xs sm:text-sm text-emerald-400/70 font-medium tracking-wide">
                                Principal, GCEK
                              </p>
                              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                                Ph.D. in Engineering • 28+ Years Experience
                              </p>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ═══ MISSION & VISION TAB ═══ */}
              {activeTab === 'missionvision' && (
                <motion.div
                  key="missionvision"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
                >
                  {/* Mission Card */}
                  <motion.div
                    className="group relative"
                    whileHover={{ y: -5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20 rounded-2xl sm:rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                    <div className="relative h-full bg-white/[0.02] backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border border-white/[0.05] hover:border-white/[0.1] transition-all duration-500 overflow-hidden">
                      <div className="absolute top-0 left-0 w-20 sm:w-24 md:w-32 h-20 sm:h-24 md:h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-br-full" />
                      <div className="absolute bottom-0 right-0 w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 bg-gradient-to-tl from-pink-500/8 to-transparent rounded-tl-full" />

                      <div className="relative z-10">
                        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                          <motion.div
                            className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/20"
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 4, repeat: Infinity }}
                          >
                            <Rocket className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-orange-400" />
                          </motion.div>
                          <h3
                            className="text-xl sm:text-2xl md:text-3xl font-black"
                            style={{ fontFamily: "'Orbitron', sans-serif" }}
                          >
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
                              MISSION
                            </span>
                          </h3>
                        </div>

                        <p className="text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed mb-5 sm:mb-6">
                          To impart quality technical education that empowers students with knowledge, skills, and
                          ethical values to become innovative engineers and responsible citizens who contribute to
                          nation-building.
                        </p>

                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {['Innovation', 'Excellence', 'Integrity', 'Leadership'].map((value, i) => (
                            <motion.span
                              key={i}
                              className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/15 text-[10px] sm:text-xs font-semibold text-orange-300/80"
                              whileHover={{ scale: 1.05 }}
                            >
                              {value}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Vision Card */}
                  <motion.div
                    className="group relative"
                    whileHover={{ y: -5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl sm:rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                    <div className="relative h-full bg-white/[0.02] backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border border-white/[0.05] hover:border-white/[0.1] transition-all duration-500 overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 sm:w-24 md:w-32 h-20 sm:h-24 md:h-32 bg-gradient-to-bl from-violet-500/10 to-transparent rounded-bl-full" />
                      <div className="absolute bottom-0 left-0 w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 bg-gradient-to-tr from-blue-500/8 to-transparent rounded-tr-full" />

                      <motion.div
                        className="absolute top-6 right-10 w-2 h-2 rounded-full bg-violet-400/40 hidden sm:block"
                        animate={{ y: [0, -8, 0], opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      />
                      <motion.div
                        className="absolute bottom-12 left-8 w-1.5 h-1.5 rounded-full bg-blue-400/40 hidden sm:block"
                        animate={{ y: [0, 8, 0], opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                      />

                      <div className="relative z-10">
                        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                          <motion.div
                            className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                          >
                            <Eye className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-violet-400" />
                          </motion.div>
                          <h3
                            className="text-xl sm:text-2xl md:text-3xl font-black"
                            style={{ fontFamily: "'Orbitron', sans-serif" }}
                          >
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-blue-500">
                              VISION
                            </span>
                          </h3>
                        </div>

                        <p className="text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed mb-5 sm:mb-6">
                          To emerge as a center of excellence in technical education and research, producing globally
                          competent professionals who drive technological advancement and sustainable development.
                        </p>

                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {['Global Standards', 'Research Focus', 'Sustainable Growth', 'Tech Leadership'].map(
                            (value, i) => (
                              <motion.span
                                key={i}
                                className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/15 text-[10px] sm:text-xs font-semibold text-violet-300/80"
                                whileHover={{ scale: 1.05 }}
                              >
                                {value}
                              </motion.span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ═══════════════════ STATS SECTION ═══════════════════ */}
      <section className="py-14 sm:py-20 md:py-28 px-4 sm:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
          >
            {stats.map((stat, index) => {
              const StatIcon = stat.icon;
              return (
                <motion.div
                  key={index}
                  custom={index}
                  variants={scaleIn}
                  whileHover={{ y: -8, scale: 1.03 }}
                  className="group relative"
                >
                  <div className="relative bg-white/[0.02] backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/[0.05] overflow-hidden hover:border-white/[0.1] transition-all duration-500">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${stat.bg} opacity-0 group-hover:opacity-100 transition-all duration-700`}
                    />

                    <div className="relative z-10 flex flex-col items-center text-center">
                      <motion.div
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                        className={`inline-flex p-2.5 sm:p-3 md:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-br ${stat.bg} mb-3 sm:mb-4 md:mb-5`}
                      >
                        <StatIcon className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 ${stat.iconColor}`} />
                      </motion.div>

                      <motion.div
                        className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-1 sm:mb-1.5 bg-clip-text text-transparent bg-gradient-to-r ${stat.color}`}
                        initial={{ opacity: 0, scale: 0.5 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                      >
                        {stat.value}
                      </motion.div>
                      <div className="text-gray-500 uppercase tracking-[0.1em] sm:tracking-[0.15em] text-[10px] sm:text-xs font-bold">
                        {stat.label}
                      </div>
                    </div>

                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -skew-x-12"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>

                  <div
                    className={`absolute -inset-1 bg-gradient-to-r ${stat.color} rounded-2xl sm:rounded-3xl blur-2xl opacity-0 group-hover:opacity-15 transition-all duration-700 -z-10`}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ SPORTS GRID ═══════════════════ */}
      <section id="sports-preview" className="py-14 sm:py-20 md:py-28 px-4 sm:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <motion.div
              custom={0}
              variants={scaleIn}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-white/[0.03] border border-white/[0.06] mb-4 sm:mb-6"
            >
              <Medal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <span className="text-[10px] sm:text-xs font-bold text-gray-400 tracking-[0.15em] sm:tracking-[0.2em] uppercase">
                Competitions
              </span>
            </motion.div>
            <motion.h2
              custom={1}
              variants={fadeInUp}
              className="text-3xl sm:text-4xl md:text-6xl font-black"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              <span className="text-white/90">PICK YOUR </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-600">
                BATTLE
              </span>
            </motion.h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4"
          >
            {sports.map((sport, index) => (
              <motion.div
                key={index}
                custom={index}
                variants={scaleIn}
                whileHover={{ y: -6, scale: 1.03 }}
                className="group relative cursor-pointer"
              >
                <div className="relative bg-white/[0.02] backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-white/[0.05] hover:border-white/[0.12] transition-all duration-500 text-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  <motion.div
                    className="text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-3 relative z-10"
                    whileHover={{ scale: 1.2, rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    {sport.emoji}
                  </motion.div>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-300 group-hover:text-white transition-colors relative z-10">
                    {sport.name}
                  </h3>
                  <p className="text-[9px] sm:text-[10px] text-gray-600 mt-0.5 sm:mt-1 relative z-10">
                    {sport.players}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ CTA SECTION ═══════════════════ */}
      <section className="py-20 sm:py-28 md:py-40 px-4 sm:px-6 relative z-10">
        {/* CTA Ambient Light */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[300px] sm:w-[450px] md:w-[600px] h-[300px] sm:h-[450px] md:h-[600px] bg-gradient-to-r from-red-500/8 via-purple-500/8 to-blue-500/8 rounded-full blur-[80px] sm:blur-[100px] md:blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div
              custom={0}
              variants={scaleIn}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-red-500/[0.08] border border-red-500/[0.15] mb-6 sm:mb-8 md:mb-10"
            >
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
              </motion.div>
              <span className="text-[10px] sm:text-xs font-bold text-red-300/80 tracking-[0.15em] sm:tracking-[0.2em] uppercase">
                Limited Slots Available
              </span>
            </motion.div>

            <motion.h2
              custom={1}
              variants={fadeInUp}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-5 sm:mb-6 md:mb-8 leading-[0.9]"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              <span className="text-white/90 block mb-1 sm:mb-2">READY TO</span>
              <span className="block">
                <span className="relative inline-block">
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: 'linear-gradient(135deg, #ff4444, #ff6b6b, #a855f7, #3b82f6)',
                      filter: 'drop-shadow(0 0 30px rgba(168,85,247,0.3))',
                    }}
                  >
                    DOMINATE?
                  </span>
                  <div className="absolute -inset-3 sm:-inset-4 md:-inset-6 bg-gradient-to-r from-red-500/10 via-purple-500/12 to-blue-500/10 blur-[40px] sm:blur-[50px] md:blur-[60px] -z-10" />
                </span>
              </span>
            </motion.h2>

            <motion.p
              custom={2}
              variants={fadeInUp}
              className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-500 mb-8 sm:mb-10 md:mb-14 max-w-2xl mx-auto font-light leading-relaxed px-4"
            >
              Join elite athletes across colleges. Prove your mettle. Win legendary prizes.
              <span className="block mt-1 sm:mt-2 text-gray-600">The arena awaits.</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              custom={3}
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5"
            >
              {/* PRIMARY CTA */}
              <motion.a
                href="#accommodation"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.97 }}
                className="group relative inline-flex items-center justify-center gap-2.5 sm:gap-3 px-8 sm:px-10 md:px-12 py-4 sm:py-5 rounded-2xl text-sm sm:text-base md:text-lg font-black overflow-hidden w-full sm:w-auto max-w-xs sm:max-w-none"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 rounded-2xl" />
                <div className="absolute -inset-2 bg-gradient-to-r from-red-600 to-rose-600 blur-2xl opacity-30 group-hover:opacity-50 transition duration-500" />
                <span className="relative z-10 flex items-center gap-2.5 text-white">
                  <span>Accommodation</span>
                  <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.span>
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
                  initial={{ x: '-200%' }}
                  whileHover={{ x: '200%' }}
                  transition={{ duration: 0.8 }}
                />
              </motion.a>

              {/* SECONDARY CTA */}
              <motion.a
                href="#register"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="relative inline-flex items-center justify-center gap-2.5 sm:gap-3 px-8 sm:px-10 md:px-12 py-4 sm:py-5 rounded-2xl text-sm sm:text-base md:text-lg font-bold border border-white/15 text-white/90 backdrop-blur-md hover:border-white/30 hover:bg-white/[0.03] transition-all duration-300 w-full sm:w-auto max-w-xs sm:max-w-none"
              >
                <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Register Your Team</span>
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Bottom Fade */}
      <div className="h-16 sm:h-24 md:h-32 bg-gradient-to-b from-transparent to-[#020205] relative z-10" />
    </div>
  );
}