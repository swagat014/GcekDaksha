import { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Copy,
  Check,
  BookOpen,
  GraduationCap,
  Shield,
  Star,
  Sparkles,
  ChevronRight,
  Heart,
} from "lucide-react";
import { contactInfo } from "../data/contact";

/* ─── Mobile Hook ──────────────────────────────────────── */
const useIsMobile = () => {
  const [m, setM] = useState(false);
  useEffect(() => {
    const c = () => setM(window.innerWidth < 768);
    c();
    window.addEventListener("resize", c);
    return () => window.removeEventListener("resize", c);
  }, []);
  return m;
};

/* ─── Contact Info Tile ────────────────────────────────── */
function InfoTile({
  icon: Icon,
  label,
  value,
  id,
  onCopy,
  copied,
  gradient,
  delay,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onCopy(value, id)}
      className="group cursor-pointer touch-manipulation"
    >
      <div className="
        relative rounded-2xl border border-purple-900/50 
        bg-gradient-to-br from-purple-950/70 to-black/90 
        backdrop-blur-xl hover:border-purple-600/60 
        transition-all duration-400 p-4 sm:p-5 
        shadow-lg shadow-black/60 active:scale-[0.98]
      ">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-2xl`}
        />

        <div className="relative z-10 flex items-center gap-3 sm:gap-4">
          <div className="
            w-10 h-10 sm:w-11 sm:h-11 rounded-xl 
            bg-purple-900/40 border border-purple-700/40 
            flex items-center justify-center shrink-0 
            group-hover:scale-105 transition-transform
          ">
            <Icon className="w-5 h-5 text-purple-300 group-hover:text-purple-200 transition-colors" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-[10px] xs:text-xs font-semibold tracking-wider text-purple-400/70 uppercase mb-0.5 sm:mb-1">
              {label}
            </div>
            <div className="text-sm xs:text-base font-medium text-gray-100 group-hover:text-white truncate transition-colors leading-tight">
              {value}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {copied === id ? (
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
                <Check className="w-5 h-5 text-emerald-400" />
              </motion.div>
            ) : (
              <Copy className="w-4 h-4 text-purple-400/50 opacity-0 group-hover:opacity-80 transition-opacity" />
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Pure Circular Profile – mobile optimized ─────────── */
function PersonCard({
  person,
  index,
  accent,
  copiedItem,
  onCopy,
  isLead = false,
  directAction = false,
}) {
  const initials = person.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const hasPhoto = person.photo || person.image;
  const phoneId = `ph-${person.name}-${index}`;
  const emailId = `em-${person.name}-${index}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.6 }}
      className="group flex flex-col items-center text-center touch-manipulation px-2 xs:px-3"
    >
      <div className="relative mb-4 xs:mb-5">
        <div
          className={`
            ${isLead 
              ? 'w-32 h-32 xs:w-36 xs:h-36 sm:w-40 sm:h-40 md:w-44 md:h-44' 
              : 'w-24 h-24 xs:w-28 xs:h-28 sm:w-32 sm:h-32 md:w-32 md:h-32'} 
            rounded-full overflow-hidden
            border-4 border-purple-800/60 group-hover:border-purple-500/80
            shadow-2xl shadow-purple-950/50 transition-all duration-500
            bg-gradient-to-br from-gray-950 to-black
            active:scale-105
          `}
        >
          {hasPhoto ? (
            <img
              src={person.photo || person.image}
              alt={person.name}
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
              <span
                className={`${isLead ? 'text-5xl xs:text-6xl sm:text-7xl' : 'text-4xl xs:text-5xl sm:text-6xl'} font-black text-purple-700/30 tracking-tighter select-none`}
              >
                {initials}
              </span>
            </div>
          )}
        </div>

        <div
          className={`
            absolute inset-0 rounded-full border-2 border-transparent
            group-hover:border-purple-500/70 group-hover:shadow-[0_0_40px_rgba(168,85,247,0.6)]
            transition-all duration-600 pointer-events-none
          `}
        />
      </div>

      <h4
        className={`font-bold text-white tracking-tight mb-1.5 ${isLead ? 'text-xl xs:text-2xl sm:text-3xl' : 'text-lg xs:text-xl sm:text-2xl'}`}
      >
        {person.name}
      </h4>

      <div className="flex items-center justify-center gap-1.5 xs:gap-2 mb-4 xs:mb-5">
        <Shield className={`w-4 h-4 ${accent.roleColor}`} />
        <span className={`text-xs xs:text-sm font-medium ${accent.roleColor} opacity-90`}>
          {person.role || "Coordinator"}
        </span>
      </div>

      <div className="flex flex-wrap justify-center gap-2 xs:gap-3 w-full max-w-[260px] xs:max-w-[280px] sm:max-w-[300px]">
        {person.phone && (
  directAction ? (
    <motion.a
      whileTap={{ scale: 0.94 }}
      href={`tel:${person.phone}`}
      onClick={(e) => e.stopPropagation()}
      className="
        flex items-center gap-1.5 xs:gap-2 px-4 xs:px-5 py-2 xs:py-2.5 
        rounded-xl text-xs xs:text-sm font-medium
        bg-black/60 border border-purple-900/50 text-gray-200
        hover:bg-purple-950/70 hover:border-purple-600/60 hover:text-white
        transition-all duration-300 active:scale-95
      "
    >
      <Phone className="w-4 h-4" />
      Phone
    </motion.a>
  ) : (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={(e) => {
        e.stopPropagation();
        onCopy(person.phone, phoneId);
      }}
      className="
        flex items-center gap-1.5 xs:gap-2 px-4 xs:px-5 py-2 xs:py-2.5 
        rounded-xl text-xs xs:text-sm font-medium
        bg-black/60 border border-purple-900/50 text-gray-200
        hover:bg-purple-950/70 hover:border-purple-600/60 hover:text-white
        transition-all duration-300 active:scale-95
      "
    >
      {copiedItem === phoneId ? <Check className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
      {copiedItem === phoneId ? "Copied" : "Phone"}
    </motion.button>
  )
)}

        {person.email && (
  directAction ? (
    <motion.a
      whileTap={{ scale: 0.94 }}
      href={`mailto:${person.email}`}
      onClick={(e) => e.stopPropagation()}
      className="
        flex items-center gap-1.5 xs:gap-2 px-4 xs:px-5 py-2 xs:py-2.5 
        rounded-xl text-xs xs:text-sm font-medium
        bg-black/60 border border-purple-900/50 text-gray-200
        hover:bg-purple-950/70 hover:border-purple-600/60 hover:text-white
        transition-all duration-300 active:scale-95
      "
    >
      <Mail className="w-4 h-4" />
      Email
    </motion.a>
  ) : (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={(e) => {
        e.stopPropagation();
        onCopy(person.email, emailId);
      }}
      className="
        flex items-center gap-1.5 xs:gap-2 px-4 xs:px-5 py-2 xs:py-2.5 
        rounded-xl text-xs xs:text-sm font-medium
        bg-black/60 border border-purple-900/50 text-gray-200
        hover:bg-purple-950/70 hover:border-purple-600/60 hover:text-white
        transition-all duration-300 active:scale-95
      "
    >
      {copiedItem === emailId ? <Check className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
      {copiedItem === emailId ? "Copied" : "Email"}
    </motion.button>
  )
)}
      </div>
    </motion.div>
  );
}

/* ─── Faculty Coordinators Block – Lead top center + 6 below ── */
function FacultyCommitteeBlock({ title, subtitle, icon: Icon, members, accent }) {
  const lead = members[0];
  const others = members.slice(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative"
    >
      <div className="flex items-center justify-center gap-3 xs:gap-4 mb-8 xs:mb-10 sm:mb-12">
        <div className={`w-10 h-10 xs:w-11 xs:h-11 rounded-xl bg-gradient-to-br ${accent.iconBg} border ${accent.iconBorder} flex items-center justify-center shadow-md`}>
          <Icon className={`w-5 h-5 ${accent.iconColor}`} />
        </div>
        <div className="text-center">
          <h3 className="text-xl xs:text-2xl sm:text-3xl font-bold text-white/95">{title}</h3>
          <p className="text-xs xs:text-sm sm:text-base text-gray-400 mt-0.5 xs:mt-1">{subtitle}</p>
        </div>
      </div>

      <div className="flex justify-center mb-10 xs:mb-12 sm:mb-16">
        {lead && (
          <PersonCard
            person={lead}
            index={0}
            accent={accent}
            copiedItem={null}
            onCopy={() => {}}
            isLead={true}
          />
        )}
      </div>

      <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 gap-6 xs:gap-8 sm:gap-10 md:gap-12 lg:gap-16 justify-items-center">
        {others.map((person, i) => (
          <PersonCard
            key={i + 1}
            person={person}
            index={i + 1}
            accent={accent}
            copiedItem={null}
            onCopy={() => {}}
          />
        ))}
      </div>

      <div className="mt-10 xs:mt-12 sm:mt-14 h-px bg-gradient-to-r from-transparent via-purple-600/40 to-transparent opacity-60" />
    </motion.div>
  );
}

/* ─── Student Coordinators Block ───────────────────────── */
function StudentCommitteeBlock({ title, subtitle, icon: Icon, members, accent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative"
    >
      <div className="flex items-center justify-center gap-3 xs:gap-4 mb-8 xs:mb-10 sm:mb-12">
        <div className={`w-10 h-10 xs:w-11 xs:h-11 rounded-xl bg-gradient-to-br ${accent.iconBg} border ${accent.iconBorder} flex items-center justify-center shadow-md`}>
          <Icon className={`w-5 h-5 ${accent.iconColor}`} />
        </div>
        <div className="text-center">
          <h3 className="text-xl xs:text-2xl sm:text-3xl font-bold text-white/95">{title}</h3>
          <p className="text-xs xs:text-sm sm:text-base text-gray-400 mt-0.5 xs:mt-1">{subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 gap-6 xs:gap-8 sm:gap-10 md:gap-12 lg:gap-16 justify-items-center">
        {members.map((person, i) => (
          <PersonCard
            key={i}
            person={person}
            index={i}
            accent={accent}
            directAction={true}
          />
        ))}
      </div>

      {/* <div className="mt-10 xs:mt-12 sm:mt-14 h-px bg-gradient-to-r from-transparent via-purple-600/40 to-transparent opacity-60" /> */}
    </motion.div>
  );
}

/* ─── Main Contact Page – Super Responsive for Mobile ───── */
export default function Contact() {
  const [copiedItem, setCopiedItem] = useState(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.05 });
  const isMobile = useIsMobile();

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2200);
  };

  const general = contactInfo.general || {};
  const teachers = contactInfo.teachersCommittee ?? [];
  const students = contactInfo.studentCommittee ?? [];

  const teacherAccent = {
    iconBg: "from-amber-800/50 to-orange-900/40",
    iconBorder: "border-amber-700/50",
    iconColor: "text-amber-300",
    roleColor: "text-amber-300/80",
  };

  const studentAccent = {
    iconBg: "from-cyan-800/50 to-blue-900/40",
    iconBorder: "border-cyan-700/50",
    iconColor: "text-cyan-300",
    roleColor: "text-cyan-300/80",
  };

  const contactTiles = [
    { icon: Mail, label: "Email", id: "email", value: general.email, gradient: "from-violet-600/12 to-transparent" },
    { icon: Phone, label: "Phone", id: "phone", value: general.phone, gradient: "from-fuchsia-600/12 to-transparent" },
    { icon: MapPin, label: "Location", id: "address", value: general.address, gradient: "from-cyan-600/12 to-transparent" },
  ];

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="
        relative min-h-screen pt-16 xs:pt-20 sm:pt-24 md:pt-28 lg:pt-32 
        pb-8 xs:pb-10 sm:pb-12 md:pb-14 lg:pb-16
        px-4 xs:px-5 sm:px-6 md:px-8 lg:px-10 
        overflow-hidden touch-pan-y
      "
      style={{
        background: "linear-gradient(180deg, #0a0012 0%, #12001f 30%, #1a002e 60%, #0f001a 100%)",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/30 via-black/75 to-violet-950/20 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Hero */}
        <div className="text-center mb-12 xs:mb-14 sm:mb-16 md:mb-20 lg:mb-24">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="
              inline-flex items-center gap-2 px-5 xs:px-6 py-2 sm:py-2.5 
              rounded-full bg-black/60 border border-purple-900/50 
              backdrop-blur-xl mb-6 xs:mb-8 mx-auto
            "
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs xs:text-sm font-semibold tracking-wider text-purple-300/80 uppercase">
              Contact DAKSHA 2026
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="
              text-4xl xs:text-5xl sm:text-6xl md:text-7xl 
              font-black text-white/95 tracking-tight mb-4 xs:mb-6
            "
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
              Get in Touch
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="text-base xs:text-lg text-gray-300/90 max-w-lg xs:max-w-xl sm:max-w-2xl mx-auto px-4 xs:px-6 sm:px-0"
          >
            Have questions about DAKSHA 2026? Reach out — our team is ready to assist.
          </motion.p>
        </div>

        {/* Contact Tiles */}
        <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 mb-12 xs:mb-14 sm:mb-16 md:mb-20 lg:mb-24">
          {contactTiles.map((tile, i) => (
            <InfoTile key={tile.id} {...tile} onCopy={copy} copied={copiedItem} delay={i * 0.08} />
          ))}
        </div>

        {/* Committees */}
        <div className="space-y-16 xs:space-y-20 sm:space-y-24 md:space-y-28 lg:space-y-32 mb-6 xs:mb-8 sm:mb-10 md:mb-12">
          <FacultyCommitteeBlock
            title="Faculty Coordinators"
            subtitle="Academic & Institutional Guidance"
            icon={BookOpen}
            members={teachers}
            accent={teacherAccent}
          />

          <StudentCommitteeBlock
            title="Student Coordinators"
            subtitle="Event Execution & Campus Connect"
            icon={GraduationCap}
            members={students}
            accent={studentAccent}
          />
        </div>
      </div>
    </section>
  );
}