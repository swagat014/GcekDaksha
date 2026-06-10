'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion';
import { X, ZoomIn, Camera, Sparkles, ChevronLeft, ChevronRight, Heart, Share2, Download, Eye, Play } from 'lucide-react';
import { useSiteContent } from '../contexts/SiteContentContext';

const defaultGalleryData = [
  // {
  //   id: 1,
  //   sport: 'Football',
  //   emoji: '⚽',
  //   gradient: 'from-emerald-500 via-green-500 to-teal-600',
  //   glow: 'rgba(16, 185, 129, 0.4)',
  //   images: [
  //     { id: 'f1', url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80', title: 'Championship Match', likes: 234 },
  //     { id: 'f2', url: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&q=80', title: 'Victory Celebration', likes: 189 },
  //   ]
  // },
  {
    id: 2,
    sport: 'Cricket',
    emoji: '🏏',
    gradient: 'from-cyan-500 via-blue-500 to-indigo-600',
    glow: 'rgba(6, 182, 212, 0.4)',
    images: [
      { id: 'c1', url: '/cri1.jpg', title: 'Perfect Swing', likes: 312 },
      { id: 'c2', url: '/cri2.jpg', title: 'Team Spirit', likes: 267 },
    ]
  },
  {
    id: 3,
    sport: 'Volleyball',
    emoji: '🏐',
    gradient: 'from-amber-500 via-orange-500 to-yellow-600',
    glow: 'rgba(245, 158, 11, 0.4)',
    images: [
      { id: 'v1', url: '/volley1.jpg', title: 'Spike Attack', likes: 198 },
      { id: 'v2', url: '/volley2.jpg', title: 'Team Huddle', likes: 156 },
    ]
  },
  {
    id: 4,
    sport: 'Kho-Kho',
    emoji: '🏃',
    gradient: 'from-orange-500 via-red-500 to-rose-600',
    glow: 'rgba(239, 68, 68, 0.4)',
    images: [
      { id: 'b1', url: '/khokho.jpeg', title: 'Slam Dunk', likes: 445 },
      { id: 'b2', url: '/khokho1.jpeg', title: 'Court Action', likes: 378 },
    ]
  },
  {
    id: 5,
    sport: 'Badminton',
    emoji: '🏸',
    gradient: 'from-lime-500 via-emerald-500 to-green-600',
    glow: 'rgba(132, 204, 22, 0.4)',
    images: [
      { id: 'bd1', url: '/bad2.jpeg', title: 'Smash Shot', likes: 167 },
      { id: 'bd2', url: '/bad1.jpeg', title: 'Finals Match', likes: 145 },
    ]
  },
  // {
  //   id: 6,
  //   sport: 'Athletics',
  //   emoji: '🏃',
  //   gradient: 'from-violet-500 via-purple-500 to-fuchsia-600',
  //   glow: 'rgba(139, 92, 246, 0.4)',
  //   images: [
  //     { id: 'a1', url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80', title: 'Sprint Finals', likes: 289 },
  //     { id: 'a2', url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80', title: 'Victory Lap', likes: 234 },
  //   ]
  // },
  {
    id: 7,
    sport: 'Chess',
    emoji: '♟️',
    gradient: 'from-slate-400 via-gray-500 to-zinc-600',
    glow: 'rgba(148, 163, 184, 0.4)',
    images: [
      { id: 'ch1', url: '/chess1.jpg', title: 'Checkmate Moment', likes: 178 },
      { id: 'ch2', url: '/chess2.jpg', title: 'Strategic Play', likes: 156 },
    ]
  },
  {
    id: 8,
    sport: 'Kabaddi',
    emoji: '🤼',
    gradient: 'from-pink-500 via-rose-500 to-red-600',
    glow: 'rgba(244, 63, 94, 0.4)',
    images: [
      { id: 't1', url: '/kab1.jpeg', title: 'Rally Action', likes: 134 },
      { id: 't2', url: '/kab2.jpeg', title: 'Championship Point', likes: 112 },
    ]
  },
];

function FloatingParticle({ delay, size, left, duration, isMobile }) {
  if (isMobile) return null; // Disable particles on mobile
  
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: `${left}%`,
        background: 'radial-gradient(circle, rgba(147, 51, 234, 0.3), transparent)',
      }}
      animate={{
        y: [800, -100],
        opacity: [0, 0.6, 0],
        scale: [0.5, 1, 0.5],
      }}
      transition={{
        duration: duration,
        delay: delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}

function SportCard({ sport, index, onImageClick, allImages, totalSections, isMobile }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      {/* Sport Section Container */}
      <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-4 sm:gap-6 lg:gap-10 items-center`}>

        {/* Sport Info Card */}
        <motion.div
          initial={{ opacity: 0, x: isEven ? -30 : 30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="lg:w-56 flex-shrink-0 text-center lg:text-left w-full lg:w-auto"
        >
          {/* Mobile: Horizontal layout / Desktop: Vertical */}
          <div className="flex items-center gap-3 sm:gap-4 lg:flex-col lg:items-start justify-center lg:justify-start">
            <div className="relative inline-block flex-shrink-0">
              {/* Emoji Glow */}
              <div
                className="absolute inset-0 blur-2xl sm:blur-3xl opacity-20 sm:opacity-30 rounded-full"
                style={{ background: sport.glow }}
              />
              <motion.span
                className="relative text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl block"
                whileHover={{
                  scale: 1.2,
                  rotate: [0, -15, 15, -5, 0],
                  transition: { duration: 0.6 }
                }}
                whileTap={{ scale: 1.15 }}
              >
                {sport.emoji}
              </motion.span>
            </div>

            <div className="lg:mt-0">
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-white tracking-tight">
                {sport.sport}
              </h3>
              <div className={`h-0.5 sm:h-1 w-10 sm:w-12 lg:w-16 mt-1.5 sm:mt-2 lg:mt-3 rounded-full bg-gradient-to-r ${sport.gradient} mx-auto lg:mx-0`} />
            </div>
          </div>
        </motion.div>

        {/* Images Container */}
        <div className="flex-1 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
            {sport.images.map((image, imgIndex) => {
              const globalIndex = allImages.findIndex(img => img.id === image.id);
              return (
                <ImageCard
                  key={image.id}
                  image={image}
                  sport={sport}
                  imgIndex={imgIndex}
                  isInView={isInView}
                  delay={0.2 + imgIndex * 0.12}
                  onClick={() => onImageClick(globalIndex)}
                  isMobile={isMobile}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Section Divider */}
      {index < totalSections - 1 && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-10 sm:mt-14 lg:mt-20 xl:mt-24 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"
        />
      )}
    </motion.div>
  );
}

function ImageCard({ image, sport, imgIndex, isInView, delay, onClick, isMobile }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(image.likes);
  const [imageLoaded, setImageLoaded] = useState(false);

  const isActive = isHovered || isTouched;

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  // Auto-dismiss touch state
  useEffect(() => {
    if (isTouched) {
      const timer = setTimeout(() => setIsTouched(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isTouched]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      onTouchStart={() => setIsTouched(true)}
      onClick={onClick}
      className="group relative cursor-pointer active:scale-[0.98] transition-transform duration-200"
    >
      {/* Outer Glow - disabled on mobile */}
      {!isMobile && (
        <motion.div
          animate={{ opacity: isActive ? 0.4 : 0, scale: isActive ? 1 : 0.95 }}
          transition={{ duration: 0.3 }}
          className="absolute -inset-2 sm:-inset-3 rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl -z-10"
          style={{ background: sport.glow }}
        />
      )}

      {/* Card */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] hover:border-purple-500/30 active:border-purple-500/30 transition-all duration-500 backdrop-blur-sm">

        {/* Image Container */}
        <div className="relative aspect-[16/11] sm:aspect-[4/3] md:aspect-[16/11] overflow-hidden">
          {/* Loading Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-black/40">
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
            </div>
          )}

          <motion.img
            src={image.url}
            alt={image.title}
            className="w-full h-full object-cover"
            onLoad={() => setImageLoaded(true)}
            animate={{
              scale: isActive ? 1.08 : 1,
              filter: isActive ? 'brightness(0.6) saturate(1.2)' : 'brightness(0.85)',
            }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            loading="lazy"
          />

          {/* Permanent Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10 pointer-events-none" />

          {/* Overlay on Hover/Touch */}
          <motion.div
            animate={{ opacity: isActive ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-t from-purple-950/60 via-purple-900/20 to-transparent pointer-events-none"
          />

          {/* Corner Brackets */}
          <motion.div
            animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : -4, y: isActive ? 0 : -4 }}
            transition={{ duration: 0.25 }}
            className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 w-4 sm:w-5 md:w-6 lg:w-8 h-4 sm:h-5 md:h-6 lg:h-8 border-l-[1.5px] sm:border-l-2 border-t-[1.5px] sm:border-t-2 rounded-tl-sm sm:rounded-tl-md"
            style={{ borderColor: sport.glow }}
          />
          <motion.div
            animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : 4, y: isActive ? 0 : 4 }}
            transition={{ duration: 0.25, delay: 0.04 }}
            className="absolute bottom-10 sm:bottom-12 md:bottom-14 right-2 sm:right-3 md:right-4 w-4 sm:w-5 md:w-6 lg:w-8 h-4 sm:h-5 md:h-6 lg:h-8 border-r-[1.5px] sm:border-r-2 border-b-[1.5px] sm:border-b-2 rounded-br-sm sm:rounded-br-md"
            style={{ borderColor: sport.glow }}
          />

          {/* Zoom Icon on Hover/Touch */}
          {/* <motion.div
            animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.8 }}
            transition={{ duration: 0.25 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2.5 sm:p-3 md:p-4 rounded-full bg-black/30 backdrop-blur-md border border-white/20"
          >
            <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
          </motion.div> */}

          {/* Bottom Info Bar */}
          {/* <div className="absolute bottom-0 left-0 right-0 px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-between">
              <p className="text-white/90 text-xs sm:text-sm font-semibold truncate mr-2">{image.title}</p>
              <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${liked ? 'text-red-400 fill-red-400' : 'text-white/50'}`} />
                <span className="text-[10px] sm:text-xs text-white/50">{likeCount}</span>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </motion.div>
  );
}

function Gallery() {
  const siteContent = useSiteContent();
  const galleryData = siteContent.gallery?.sections || defaultGalleryData;
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  useEffect(() => {
    if (selectedImageIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedImageIndex]);

  const allImages = galleryData.flatMap(sport =>
    sport.images.map(img => ({
      ...img,
      sport: sport.sport,
      emoji: sport.emoji,
      gradient: sport.gradient,
      glow: sport.glow,
    }))
  );

  const selectedImage = selectedImageIndex !== null ? allImages[selectedImageIndex] : null;

  const openLightbox = (index) => setSelectedImageIndex(index);
  const closeLightbox = () => setSelectedImageIndex(null);

  const nextImage = () => {
    setSelectedImageIndex(prev => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex(prev => (prev - 1 + allImages.length) % allImages.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImageIndex === null) return;
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex]);

  // Touch swipe for lightbox
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextImage();
      else prevImage();
    }
    setTouchStart(null);
  };

  const particleCount = isMobile ? 1 : 6; // Reduced to 1 for low-tier mobiles

  return (
    <section
      ref={sectionRef}
      id="gallery"
      className="min-h-[100dvh] py-10 sm:py-14 md:py-16 lg:py-20 px-3 sm:px-4 md:px-6 pt-20 sm:pt-24 md:pt-28 lg:pt-32 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #030108 0%, #0a0015 15%, #0d001a 30%, #0f0020 50%, #0a0018 70%, #060010 85%, #030108 100%)',
      }}
    >
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Desktop-only Large Orbs - disabled on mobile */}
        {!isMobile && (
          <>
            <motion.div
              style={{ y: bgY }}
              className="absolute -top-16 sm:-top-32 -left-16 sm:-left-32 w-[280px] sm:w-[400px] md:w-[500px] lg:w-[700px] h-[280px] sm:h-[400px] md:h-[500px] lg:h-[700px] rounded-full"
              animate={{
                background: [
                  'radial-gradient(circle, rgba(88, 28, 135, 0.15), transparent 70%)',
                  'radial-gradient(circle, rgba(126, 34, 206, 0.2), transparent 70%)',
                  'radial-gradient(circle, rgba(88, 28, 135, 0.15), transparent 70%)',
                ],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute -bottom-16 sm:-bottom-32 -right-16 sm:-right-32 w-[220px] sm:w-[350px] md:w-[450px] lg:w-[600px] h-[220px] sm:h-[350px] md:h-[450px] lg:h-[600px] rounded-full"
              animate={{
                background: [
                  'radial-gradient(circle, rgba(59, 7, 100, 0.15), transparent 70%)',
                  'radial-gradient(circle, rgba(91, 33, 182, 0.2), transparent 70%)',
                  'radial-gradient(circle, rgba(59, 7, 100, 0.15), transparent 70%)',
                ],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            />
            <div className="absolute top-1/3 right-1/4 w-[150px] sm:w-[250px] md:w-[350px] lg:w-[500px] h-[150px] sm:h-[250px] md:h-[350px] lg:h-[500px] bg-gradient-to-br from-indigo-900/10 via-purple-800/5 to-transparent rounded-full blur-[60px] sm:blur-[80px] md:blur-[100px]" />
          </>
        )}

        {/* Simplified mobile background - no animations */}
        {isMobile && (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 via-black/10 to-transparent" />
        )}

        {/* Floating Particles */}
        {[...Array(particleCount)].map((_, i) => (
          <FloatingParticle
            key={i}
            delay={i * 2}
            size={`${3 + i * (isMobile ? 1 : 2)}px`}
            left={10 + i * (isMobile ? 20 : 15)}
            duration={12 + i * 3}
            isMobile={isMobile}
          />
        ))}

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.015] sm:opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(147, 51, 234, 0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(147, 51, 234, 0.3) 1px, transparent 1px)`,
            backgroundSize: isMobile ? '40px 40px' : '60px 60px',
          }}
        />

        {/* Noise Texture */}
        <div
          className="absolute inset-0 opacity-[0.02] sm:opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10 sm:mb-14 md:mb-16 lg:mb-20 xl:mb-28"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 rounded-full mb-4 sm:mb-5 md:mb-6 lg:mb-8"
            style={{
              background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(79, 70, 229, 0.05))',
              border: '1px solid rgba(147, 51, 234, 0.15)',
              boxShadow: '0 0 30px rgba(147, 51, 234, 0.08)',
            }}
          >
            <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-purple-400" />
            <span className="text-[9px] sm:text-[10px] md:text-xs font-bold text-purple-300/80 tracking-[0.15em] sm:tracking-[0.2em] uppercase">
              Captured Moments
            </span>
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-purple-400" />
          </motion.div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-black mb-3 sm:mb-4 md:mb-5 lg:mb-6 leading-tight px-2">
            <span className="text-white/90">PHOTO </span>
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, #a855f7, #7c3aed, #6366f1, #818cf8, #a78bfa)',
                WebkitBackgroundClip: 'text',
              }}
            >
              GALLERY
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-gray-500 max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto text-xs sm:text-sm md:text-base lg:text-lg font-light px-4"
          >
            Relive the glory, the passion, and the unforgettable moments from DAKSHA
          </motion.p>

          {/* Decorative Line */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mt-5 sm:mt-6 md:mt-8 lg:mt-10">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="w-10 sm:w-14 md:w-20 lg:w-24 h-px bg-gradient-to-r from-transparent to-purple-500/40 origin-right"
            />
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, type: 'spring' }}
              className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-500/60"
            />
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="w-10 sm:w-14 md:w-20 lg:w-24 h-px bg-gradient-to-l from-transparent to-purple-500/40 origin-left"
            />
          </div>
        </motion.div>

        {/* Sport Sections */}
        <div className="space-y-10 sm:space-y-14 md:space-y-16 lg:space-y-20 xl:space-y-28">
          {galleryData.map((sport, index) => (
            <SportCard
              key={sport.id}
              sport={sport}
              index={index}
              onImageClick={openLightbox}
              allImages={allImages}
              totalSections={galleryData.length}
              isMobile={isMobile}
            />
          ))}
        </div>

        {/* Bottom Spacer */}
        <div className="mt-10 sm:mt-16 lg:mt-24 pb-4 sm:pb-8" />
      </div>

      {/* ═══ LIGHTBOX MODAL ═══ */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={closeLightbox}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" />

            {/* Ambient Glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[400px] md:w-[600px] h-[300px] sm:h-[400px] md:h-[600px] rounded-full blur-[100px] sm:blur-[150px] md:blur-[200px] opacity-15 sm:opacity-20"
                style={{ background: selectedImage.glow }}
              />
            </div>

            {/* Content Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="relative w-full max-w-6xl mx-2 sm:mx-3 md:mx-4 max-h-[100dvh] sm:max-h-[95vh] md:max-h-[90vh] flex flex-col py-2 sm:py-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4 px-1 sm:px-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <span className="text-xl sm:text-2xl md:text-3xl flex-shrink-0">{selectedImage.emoji}</span>
                  <div className="min-w-0">
                    <h3 className="text-white font-bold text-xs sm:text-sm md:text-lg lg:text-xl truncate">{selectedImage.title}</h3>
                    <p className="text-purple-400/60 text-[10px] sm:text-xs md:text-sm">{selectedImage.sport}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-shrink-0">
                  {/* Desktop action buttons */}
                  <div className="hidden md:flex items-center gap-2">
                    {[Heart, Share2, Download].map((Icon, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 sm:p-2.5 md:p-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                      </motion.button>
                    ))}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={closeLightbox}
                    className="p-2 sm:p-2.5 md:p-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white/70 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 transition-all"
                  >
                    <X className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Main Image */}
              <div className="relative flex-1 flex items-center justify-center min-h-0">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25 }}
                    src={selectedImage.url}
                    alt={selectedImage.title}
                    className="max-h-[40vh] sm:max-h-[50vh] md:max-h-[60vh] lg:max-h-[65vh] xl:max-h-[70vh] w-auto max-w-full object-contain rounded-lg sm:rounded-xl md:rounded-2xl"
                    style={{
                      boxShadow: `0 0 60px ${selectedImage.glow?.replace('0.4', '0.12')}`,
                    }}
                  />
                </AnimatePresence>

                {/* Nav Arrows */}
                <motion.button
                  whileHover={{ scale: 1.1, x: -2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-0.5 sm:left-1 md:left-2 lg:left-4 p-1.5 sm:p-2 md:p-3 lg:p-4 rounded-full bg-black/50 sm:bg-black/40 md:bg-white/5 backdrop-blur-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, x: 2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-0.5 sm:right-1 md:right-2 lg:right-4 p-1.5 sm:p-2 md:p-3 lg:p-4 rounded-full bg-black/50 sm:bg-black/40 md:bg-white/5 backdrop-blur-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                </motion.button>
              </div>

              {/* Footer Info */}
              <div className="mt-2 sm:mt-3 md:mt-4 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl md:rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.05), rgba(79, 70, 229, 0.03))',
                  border: '1px solid rgba(147, 51, 234, 0.1)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
                    <span className="flex items-center gap-1 sm:gap-1.5 text-gray-400 text-[10px] sm:text-xs md:text-sm">
                      <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-400/70" />
                      {selectedImage.likes}
                    </span>
                    <span className="flex items-center gap-1 sm:gap-1.5 text-gray-400 text-[10px] sm:text-xs md:text-sm">
                      <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-400/70" />
                      {Math.floor(selectedImage.likes * 3.5)}
                    </span>
                  </div>
                  <span className="text-purple-400/40 text-[10px] sm:text-xs md:text-sm font-medium">
                    {selectedImageIndex + 1} / {allImages.length}
                  </span>
                </div>
              </div>

              {/* Thumbnail Strip */}
              <div className="mt-2 sm:mt-3 md:mt-4 flex justify-start sm:justify-center gap-1 sm:gap-1.5 md:gap-2 overflow-x-auto pb-1 sm:pb-2 px-0.5 sm:px-1 scrollbar-hide">
                {allImages.map((img, idx) => (
                  <motion.button
                    key={img.id}
                    whileTap={{ scale: 0.92 }}
                    onClick={(e) => { e.stopPropagation(); openLightbox(idx); }}
                    className={`relative w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-md sm:rounded-lg md:rounded-xl overflow-hidden flex-shrink-0 transition-all duration-300 ${
                      selectedImageIndex === idx
                        ? 'ring-[1.5px] sm:ring-2 ring-purple-500 ring-offset-1 sm:ring-offset-2 ring-offset-black opacity-100 scale-105'
                        : 'opacity-25 sm:opacity-30 hover:opacity-60 active:opacity-60'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                    {selectedImageIndex === idx && (
                      <motion.div
                        layoutId="thumbHighlight"
                        className="absolute inset-0 bg-purple-500/10"
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Mobile Action Bar */}
              <div className="flex md:hidden justify-center gap-8 sm:gap-10 mt-2 sm:mt-3 pb-1 sm:pb-2">
                {[
                  { icon: Heart, label: 'Like' },
                  { icon: Share2, label: 'Share' },
                  { icon: Download, label: 'Save' },
                ].map(({ icon: Icon, label }, i) => (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.85 }}
                    className="flex flex-col items-center gap-0.5 sm:gap-1 text-white/50 active:text-white/80 transition-colors"
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-wider">{label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scrollbar hide style */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}

export default Gallery;