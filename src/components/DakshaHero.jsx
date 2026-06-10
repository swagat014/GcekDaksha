"use client";

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { useSiteContent } from '../contexts/SiteContentContext';

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

// ═══ CALENDAR FLIP CARD COMPONENT ═══
const FlipCard = ({ value, delay, isSeparator = false }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasHovered, setHasHovered] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFlipped(true);
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  if (isSeparator) {
    return (
      <motion.div
        className="flex items-center justify-center mx-0.5 sm:mx-1"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delay, duration: 0.4, ease: 'backOut' }}
      >
        <motion.div
          className="w-2 sm:w-3 md:w-4 h-[2px] bg-purple-400/40 rounded-full"
          animate={!isMobile ? {
            scaleX: [1, 1.5, 1],
            opacity: [0.4, 0.8, 0.4],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="relative inline-flex cursor-pointer"
      style={{ perspective: '600px' }}
      onHoverStart={() => !isMobile && setHasHovered(true)}
      onHoverEnd={() => !isMobile && setHasHovered(false)}
      whileHover={!isMobile ? { scale: 1.08 } : {}}
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative w-auto h-8 sm:h-10 md:h-14">
        {/* Front face */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center rounded-md sm:rounded-lg bg-purple-500/[0.04] border border-purple-500/[0.08] px-1.5 sm:px-2 md:px-3 overflow-hidden"
          initial={{ rotateX: 0, opacity: 1 }}
          animate={isFlipped
            ? { rotateX: 90, opacity: 0, scale: 0.95 }
            : { rotateX: 0, opacity: 1, scale: 1 }
          }
          transition={{ duration: 0.35, ease: 'easeIn' }}
          style={{
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
            transformOrigin: 'top center',
          }}
        >
          <span
            className="text-purple-500/25 text-[10px] sm:text-xs md:text-sm font-black tracking-wider"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            {'•••'}
          </span>
        </motion.div>

        {/* Back face */}
        <motion.div
          className="relative flex items-center justify-center rounded-md sm:rounded-lg overflow-hidden px-1.5 sm:px-2 md:px-3 h-8 sm:h-10 md:h-14"
          initial={{ rotateX: -90, opacity: 0 }}
          animate={isFlipped
            ? {
                rotateX: hasHovered ? [0, -8, 5, 0] : 0,
                opacity: 1,
                scale: hasHovered ? 1.02 : 1,
              }
            : { rotateX: -90, opacity: 0 }
          }
          transition={{ duration: 0.7, ease: [0.175, 0.885, 0.32, 1.275] }}
          style={{
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
            transformOrigin: 'bottom center',
            background: 'linear-gradient(180deg, rgba(147,51,234,0.08) 0%, rgba(88,28,135,0.04) 100%)',
            border: '1px solid rgba(147,51,234,0.12)',
          }}
        >
          <motion.div
            className="absolute top-0 left-0 right-0 h-1/2 rounded-t-md sm:rounded-t-lg"
            style={{
              background: 'linear-gradient(180deg, rgba(192,132,252,0.1) 0%, transparent 100%)',
            }}
            animate={isFlipped ? { opacity: [0, 1] } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          />

          <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-purple-500/[0.08] z-10" />

          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] sm:w-[3px] h-1.5 sm:h-2.5 bg-purple-900/40 rounded-r-full" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[2px] sm:w-[3px] h-1.5 sm:h-2.5 bg-purple-900/40 rounded-l-full" />

          <motion.span
            className="relative z-20 text-purple-300/80 text-[10px] sm:text-xs md:text-lg font-black tracking-wider"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
            animate={isFlipped ? {
              textShadow: [
                '0 0 0px rgba(168,85,247,0)',
                '0 0 12px rgba(168,85,247,0.3)',
                '0 0 0px rgba(168,85,247,0)',
              ],
            } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: delay * 0.5 }}
          >
            {value}
          </motion.span>

          <div
            className="absolute bottom-0 left-0 right-0 h-1/2 rounded-b-md sm:rounded-b-lg"
            style={{
              background: 'linear-gradient(0deg, rgba(15,5,25,0.15) 0%, transparent 100%)',
            }}
          />

          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent -skew-x-12"
            initial={{ x: '-200%' }}
            animate={hasHovered ? { x: '200%' } : { x: '-200%' }}
            transition={{ duration: 0.6 }}
          />
        </motion.div>
      </div>

      <motion.div
        className="absolute -bottom-1 sm:-bottom-1.5 left-0.5 right-0.5 sm:left-1 sm:right-1 h-2 sm:h-3 bg-purple-500/[0.06] rounded-full blur-md"
        initial={{ opacity: 0, scaleX: 0.6 }}
        animate={isFlipped ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0.6 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      />
    </motion.div>
  );
};

// ═══ CALENDAR DATE DISPLAY ═══
const CalendarDateDisplay = () => {
  const [cycleKey, setCycleKey] = useState(0);
  const siteContent = useSiteContent();

  const dateItems = (() => {
    const startParts = (siteContent.heroDates.startDate || "").split(" ").filter(Boolean);
    const endParts = (siteContent.heroDates.endDate || "").split(" ").filter(Boolean);
    const toParts = (parts) => [parts[0] || "", parts[1] || "", parts.slice(2).join(" ") || ""];
    const [sDay, sMonth, sYear] = toParts(startParts);
    const [eDay, eMonth, eYear] = toParts(endParts);
    return [
      { value: sDay, type: "date" },
      { value: sMonth, type: "date" },
      { value: sYear, type: "date" },
      { value: "-", type: "separator" },
      { value: eDay, type: "date" },
      { value: eMonth, type: "date" },
      { value: eYear, type: "date" },
    ];
  })();

  useEffect(() => {
    const interval = setInterval(() => {
      setCycleKey(prev => prev + 1);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.8 }}
      className="flex items-center justify-center gap-1 sm:gap-2 md:gap-3 mb-6 sm:mb-8 md:mb-10 w-full px-2"
      style={{ perspective: '1000px' }}
    >
      <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap justify-center" key={cycleKey}>
        {dateItems.map((item, i) => (
          <FlipCard
            key={`${i}-${cycleKey}`}
            value={item.value}
            delay={1 + i * 0.2}
            isSeparator={item.type === 'separator'}
          />
        ))}
      </div>
    </motion.div>
  );
};

// ═══ MAIN HERO COMPONENT ═══
export default function DakshaHero() {
  const heroRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeWord, setActiveWord] = useState(0);
  const isMobile = useIsMobile();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const smoothY = useSpring(y, { stiffness: 80, damping: 25 });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWord(prev => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const sportsEmojis = ['⚽', '🏀', '🏐', '🏏', '🏸', '♟️', '🏓', '🤼'];
  const rotatingWords = ['COMPETE', 'CONQUER', 'DOMINATE', 'TRIUMPH'];
  const wordColors = ['#ef4444', '#a855f7', '#3b82f6', '#f59e0b'];

  return (
    <div
      ref={heroRef}
      className="relative w-full min-h-[100dvh] flex items-center justify-center overflow-hidden"
      style={{ background: isMobile ? '#030108' : '#030108', position: 'relative' }}
    >
      {/* ═══ BACKGROUND ═══ */}
      <div className="absolute inset-0">
        {/* Mobile: Static simple background */}
        {isMobile && (
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(180deg, #030108 0%, #1a0a2e 100%)'
          }} />
        )}
        
        {/* Desktop: Animated complex background */}
        {!isMobile && (
          <>
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(88,28,135,0.15) 0%, rgba(15,5,25,0.5) 50%, #030108 100%)'
            }} />

            <motion.div
              className="absolute top-0 left-[20%] w-[1px] sm:w-[2px] h-[60%]"
              style={{
                background: 'linear-gradient(180deg, rgba(168,85,247,0.3) 0%, transparent 100%)',
                filter: 'blur(1px)',
              }}
              animate={{ opacity: [0.2, 0.5, 0.2], height: ['50%', '65%', '50%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute top-0 right-[25%] w-[1px] sm:w-[2px] h-[55%]"
              style={{
                background: 'linear-gradient(180deg, rgba(139,92,246,0.2) 0%, transparent 100%)',
                filter: 'blur(1px)',
              }}
              animate={{ opacity: [0.15, 0.4, 0.15], height: ['45%', '60%', '45%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />
            <motion.div
              className="absolute top-0 left-[55%] w-[1px] h-[45%] hidden sm:block"
              style={{
                background: 'linear-gradient(180deg, rgba(239,68,68,0.15) 0%, transparent 100%)',
              }}
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            />

            <motion.div
              className="absolute top-[15%] left-[10%] sm:left-[30%] w-[250px] sm:w-[400px] md:w-[500px] h-[200px] sm:h-[300px] md:h-[400px] rounded-full blur-[100px] sm:blur-[150px]"
              animate={{
                background: [
                  'radial-gradient(circle, rgba(88,28,135,0.12) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(126,34,206,0.16) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(88,28,135,0.12) 0%, transparent 70%)',
                ],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute bottom-[10%] right-[5%] sm:right-[20%] w-[200px] sm:w-[300px] md:w-[400px] h-[150px] sm:h-[200px] md:h-[300px] rounded-full blur-[80px] sm:blur-[130px]"
              animate={{
                background: [
                  'radial-gradient(circle, rgba(109,40,217,0.06) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)',
                  'radial-gradient(circle, rgba(109,40,217,0.06) 0%, transparent 70%)',
                ],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            />

            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
              backgroundSize: '30px 30px',
            }} />
          </>
        )}
      </div>

      {/* ═══ SPORTS MARQUEE - Top ═══ */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <div className="overflow-hidden py-2.5 sm:py-3 md:py-4 border-b border-white/[0.03]">
          {isMobile ? (
            <div className="flex gap-8 sm:gap-12 md:gap-16 whitespace-nowrap">
              {sportsEmojis.map((emoji, i) => (
                <span key={i} className="text-lg sm:text-xl md:text-2xl opacity-20 select-none">{emoji}</span>
              ))}
            </div>
          ) : (
            <motion.div
              className="flex gap-8 sm:gap-12 md:gap-16 whitespace-nowrap"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            >
              {[...sportsEmojis, ...sportsEmojis, ...sportsEmojis].map((emoji, i) => (
                <span key={i} className="text-lg sm:text-xl md:text-2xl opacity-20 select-none">{emoji}</span>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <motion.div
        style={{ opacity, y: smoothY }}
        className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6"
      >
        <AnimatePresence>
          {isLoaded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              {/* Pre-title */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-4 sm:mb-6 md:mb-8 flex items-center gap-2 sm:gap-3 md:gap-4"
              >
                <div className="h-[1px] w-6 sm:w-8 md:w-16 bg-gradient-to-r from-transparent to-purple-500/30" />
                <span className="text-[8px] sm:text-[10px] md:text-xs font-bold text-purple-400/50 tracking-[0.2em] sm:tracking-[0.3em] md:tracking-[0.4em] uppercase text-center">
                  Inter-College Sports Tournament
                </span>
                <div className="h-[1px] w-6 sm:w-8 md:w-16 bg-gradient-to-l from-transparent to-purple-500/30" />
              </motion.div>

              {/* ═══ MAIN TITLE - DAKSHA ═══ */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="relative mb-4 sm:mb-5 md:mb-6"
              >
                <motion.div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <div className="w-[80%] h-[80%] bg-purple-600/10 rounded-full blur-[50px] sm:blur-[60px] md:blur-[80px]" />
                </motion.div>

                <h1
                  className="relative text-[20vw] sm:text-[18vw] md:text-[16vw] lg:text-[12vw] font-black leading-[0.85] tracking-[-0.02em] select-none"
                  style={{ fontFamily: "'Orbitron', sans-serif" }}
                >
                  <motion.span
                    className="block bg-clip-text text-transparent"
                    style={{
                      backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #e9d5ff 25%, #c084fc 50%, #a855f7 75%, #7c3aed 100%)',
                      filter: 'drop-shadow(0 4px 30px rgba(139,92,246,0.3))',
                    }}
                    animate={{
                      filter: [
                        'drop-shadow(0 4px 30px rgba(139,92,246,0.3))',
                        'drop-shadow(0 4px 50px rgba(168,85,247,0.5))',
                        'drop-shadow(0 4px 30px rgba(139,92,246,0.3))',
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    DAKSHA
                  </motion.span>
                </h1>

                <motion.div
                  className="mx-auto mt-1 sm:mt-2 h-0.5 sm:h-1 rounded-full bg-gradient-to-r from-transparent via-purple-500/60 to-transparent"
                  initial={{ width: 0 }}
                  animate={{ width: '60%' }}
                  transition={{ duration: 1.2, delay: 1 }}
                />
              </motion.div>

              {/* ═══ CALENDAR DATE TAG ═══ */}
              <CalendarDateDisplay />

              {/* ═══ ROTATING TAGLINE ═══ */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="relative mb-8 sm:mb-10 md:mb-12 h-12 sm:h-14 md:h-16 flex items-center justify-center overflow-hidden"
              >
                <div className="flex items-center gap-2 sm:gap-3 md:gap-5">
                  <span className="text-xs sm:text-sm md:text-xl text-gray-500 font-light tracking-wider">BORN TO</span>

                  <div className="relative w-28 sm:w-36 md:w-52 h-10 sm:h-11 md:h-12 overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={activeWord}
                        initial={{ y: 40, opacity: 0, rotateX: -45 }}
                        animate={{ y: 0, opacity: 1, rotateX: 0 }}
                        exit={{ y: -40, opacity: 0, rotateX: 45 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-0 flex items-center text-xl sm:text-2xl md:text-4xl font-black tracking-wider"
                        style={{
                          fontFamily: "'Orbitron', sans-serif",
                          color: wordColors[activeWord],
                          textShadow: `0 0 30px ${wordColors[activeWord]}60`,
                        }}
                      >
                        {rotatingWords[activeWord]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>

                <div className="absolute -bottom-1 sm:-bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
                  {rotatingWords.map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 h-1 rounded-full"
                      animate={{
                        backgroundColor: activeWord === i ? wordColors[i] : 'rgba(107,114,128,0.3)',
                        scale: activeWord === i ? 1.5 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* ═══ CTA BUTTONS ═══ */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.4 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center mb-10 sm:mb-12 md:mb-16 w-full sm:w-auto px-4 sm:px-0"
              >
                <motion.a
                  href="#register"
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  className="group relative w-full sm:w-auto"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-sky-600 via-purple-600 to-blue-600 rounded-xl sm:rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                  <div className="relative flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 bg-gradient-to-r from-sky-400 via-purple-600 to-blue-700 rounded-xl sm:rounded-2xl text-white font-bold text-sm sm:text-base overflow-hidden">
                    <span className="relative z-10">🔥 Register Now</span>
                    <motion.svg
                      className="w-4 h-4 sm:w-5 sm:h-5 relative z-10"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </motion.svg>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                      initial={{ x: '-200%' }}
                      whileHover={{ x: '200%' }}
                      transition={{ duration: 0.7 }}
                    />
                  </div>
                </motion.a>

                <motion.a
                  href="#sports"
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  className="group flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-purple-500/25 text-gray-400 hover:text-white font-bold text-sm sm:text-base transition-all duration-300 backdrop-blur-sm"
                >
                  <span>🏆 Explore Events</span>
                  <motion.svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </motion.svg>
                </motion.a>
              </motion.div>

              {/* ═══ SCROLL INDICATOR ═══ */}
              {isMobile ? (
                <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-[1px] h-4 sm:h-5 md:h-6 bg-gradient-to-b from-purple-500/40 to-transparent" />
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-purple-400/40" />
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                  className="flex flex-col items-center gap-1.5 sm:gap-2"
                >
                  <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="w-[1px] h-4 sm:h-5 md:h-6 bg-gradient-to-b from-purple-500/40 to-transparent" />
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-purple-400/40" />
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ═══ SPORTS MARQUEE - Bottom ═══ */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="overflow-hidden py-2.5 sm:py-3 md:py-4 border-t border-white/[0.03]">
          {isMobile ? (
            <div className="flex gap-6 sm:gap-8 md:gap-10 whitespace-nowrap">
              {[
                'FOOTBALL', 'BASKETBALL', 'VOLLEYBALL', 'KABADDI', 'BADMINTON',
                'CHESS', 'TABLE TENNIS', 'KHO-KHO', 'CRICKET',
              ].map((sport, i) => (
                <span key={i} className="flex items-center gap-2 sm:gap-3 md:gap-4 select-none">
                  <span
                    className="text-[9px] sm:text-[10px] md:text-[11px] font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase"
                    style={{
                      color: i % 4 === 0 ? 'rgba(239,68,68,0.15)'
                        : i % 4 === 1 ? 'rgba(168,85,247,0.15)'
                          : i % 4 === 2 ? 'rgba(59,130,246,0.15)'
                            : 'rgba(251,191,36,0.15)',
                    }}
                  >
                    {sport}
                  </span>
                  <span className="text-purple-800/30 text-[6px] sm:text-[8px]">◆</span>
                </span>
              ))}
            </div>
          ) : (
            <motion.div
              className="flex gap-6 sm:gap-8 md:gap-10 whitespace-nowrap"
              animate={{ x: ['-50%', '0%'] }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            >
              {[
                'FOOTBALL', 'BASKETBALL', 'VOLLEYBALL', 'KABADDI', 'BADMINTON',
                'CHESS', 'TABLE TENNIS', 'KHO-KHO', 'CRICKET',
                'FOOTBALL', 'BASKETBALL', 'VOLLEYBALL', 'KABADDI', 'BADMINTON',
                'CHESS', 'TABLE TENNIS', 'KHO-KHO', 'CRICKET',
              ].map((sport, i) => (
                <span key={i} className="flex items-center gap-2 sm:gap-3 md:gap-4 select-none">
                  <span
                    className="text-[9px] sm:text-[10px] md:text-[11px] font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase"
                    style={{
                      color: i % 4 === 0 ? 'rgba(239,68,68,0.15)'
                        : i % 4 === 1 ? 'rgba(168,85,247,0.15)'
                          : i % 4 === 2 ? 'rgba(59,130,246,0.15)'
                            : 'rgba(251,191,36,0.15)',
                    }}
                  >
                    {sport}
                  </span>
                  <span className="text-purple-800/30 text-[6px] sm:text-[8px]">◆</span>
                </span>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* ═══ EDGE FADES ═══ */}
      <div className="absolute top-0 left-0 right-0 h-12 sm:h-16 md:h-20 bg-gradient-to-b from-[#030108] to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-14 sm:h-18 md:h-24 bg-gradient-to-t from-[#030108] to-transparent pointer-events-none z-10" />

      {/* Corner accents */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border-l border-t border-purple-500/[0.06] rounded-tl-lg hidden sm:block" />
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border-r border-t border-purple-500/[0.06] rounded-tr-lg hidden sm:block" />
      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border-l border-b border-purple-500/[0.06] rounded-bl-lg hidden sm:block" />
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 border-r border-b border-purple-500/[0.06] rounded-br-lg hidden sm:block" />
    </div>
  );
}