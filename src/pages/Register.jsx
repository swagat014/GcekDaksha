import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, User, Phone, Trophy, Building2, Plus, Users, Upload, FileText,
  CreditCard, Sparkles, Shield, Star, ChevronRight, CheckCircle2, AlertCircle,
  X, Zap
} from 'lucide-react';
import { supabase } from "../supabaseClient";
import { uploadFile } from "../utils/uploadFile";
import { useSiteContent } from '../contexts/SiteContentContext';

export default function Register() {
  const [formData, setFormData] = useState({
    teamName: '',
    collegeName: '',
    sport: '',
    captainName: '',
    captainMobile: '',
  });
  const [teamMembers, setTeamMembers] = useState([
    { id: Date.now(), name: '', aadhaar: null, idCard: null },
  ]);
  const [captainAadhaar, setCaptainAadhaar] = useState(null);
  const [captainId, setCaptainId] = useState(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [lastSubmission, setLastSubmission] = useState(null);
  const [step, setStep] = useState(1);
  const siteContent = useSiteContent();
  const sports = siteContent.registration?.sports || [];
  const isLive = siteContent.registration?.isLive !== false;

  // Performance monitoring for low-tier mobiles
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768;
      setIsMobile(isMobileDevice);
      
      // Reduce animation quality for low-end devices
      if (isMobileDevice && navigator.hardwareConcurrency <= 2) {
        document.documentElement.style.setProperty('--animation-quality', 'low');
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sportQRMapping = sports.reduce((acc, sport) => {
    acc[sport.name] = sport.qrCode || '';
    return acc;
  }, {});

  const handleImageFileChange = (file) => {
    if (!file) return null;
    const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedFormats.includes(file.type)) {
      setToast({ show: true, message: 'Only PNG and JPEG formats are allowed', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
      return null;
    }
    if (file.size > 5 * 1024 * 1024) {
      setToast({ show: true, message: 'File size must be less than 5MB', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
      return null;
    }
    return file;
  };

  useEffect(() => {
    setLastSubmission(null);
  }, []);

  useEffect(() => {
    if (!formData.sport) return;
    const selectedSport = sports.find((s) => s.name === formData.sport);
    if (!selectedSport) return;
    const memberCount = selectedSport.teamSize - 1;
    const newMembers = Array.from({ length: memberCount }, (_, i) => ({
      id: teamMembers[i]?.id || Date.now() + i,
      name: teamMembers[i]?.name || '',
      aadhaar: teamMembers[i]?.aadhaar || null,
      idCard: teamMembers[i]?.idCard || null,
    }));
    setTeamMembers(newMembers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.sport]);

  const validateStep = (currentStep) => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!formData.teamName.trim()) newErrors.teamName = 'Required';
      if (!formData.collegeName.trim()) newErrors.collegeName = 'Required';
      if (!formData.sport) newErrors.sport = 'Required';
      if (!formData.captainName.trim()) newErrors.captainName = 'Required';
      if (!formData.captainMobile.trim()) newErrors.captainMobile = 'Required';
      else if (!/^[0-9]{10}$/.test(formData.captainMobile))
        newErrors.captainMobile = 'Must be 10 digits';
    }
    if (currentStep === 2) {
      if (!captainAadhaar) newErrors.captainAadhaar = 'Required';
      if (!captainId) newErrors.captainId = 'Required';
      const selectedSport = sports.find((s) => s.name === formData.sport);
      if (selectedSport && !selectedSport.name.toLowerCase().includes('chess')) {
        teamMembers.forEach((member, i) => {
          if (!member.name.trim()) newErrors[`memberName-${i}`] = 'Required';
          if (!member.aadhaar) newErrors[`memberAadhaar-${i}`] = 'Required';
          if (!member.idCard) newErrors[`memberIdCard-${i}`] = 'Required';
        });
      }
    }
    if (currentStep === 3) {
      if (!paymentScreenshot) newErrors.payment = 'Required';
    }
    return newErrors;
  };

  const handleNext = () => {
    const newErrors = validateStep(step);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setToast({ show: true, message: 'Please fill all required fields', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
      return;
    }
    setErrors({});
    setStep((s) => s + 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleMemberChange = (index, field, value) => {
    const newMembers = [...teamMembers];
    newMembers[index][field] = value;
    setTeamMembers(newMembers);
    const key = `member${field.charAt(0).toUpperCase() + field.slice(1)}-${index}`;
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const addTeamMember = () =>
    setTeamMembers([...teamMembers, { id: Date.now(), name: '', aadhaar: null, idCard: null }]);

  const removeTeamMember = (index) => {
    if (teamMembers.length > 1) setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateStep(3);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setIsSubmitting(true);
    try {
      const captainAadhaarUpload = await uploadFile(
        'captain_aadhaar',
        captainAadhaar,
        formData.captainName,
        formData.collegeName
      );
      const captainIdUpload = await uploadFile(
        'captain_id',
        captainId,
        formData.captainName,
        formData.collegeName
      );
      const paymentUpload = await uploadFile(
        'payment_screenshot',
        paymentScreenshot,
        null,
        formData.collegeName,
        formData.sport
      );

      const playerDocUrls = [];
      for (const member of teamMembers) {
        if (member.aadhaar) {
          const u = await uploadFile('player_aadhaar', member.aadhaar, member.name, formData.collegeName);
          playerDocUrls.push({ type: 'aadhaar', name: member.name, url: u.url, fileName: u.fileName });
        }
        if (member.idCard) {
          const u = await uploadFile('player_id', member.idCard, member.name, formData.collegeName);
          playerDocUrls.push({ type: 'id_card', name: member.name, url: u.url, fileName: u.fileName });
        }
      }

      const playersJson = teamMembers
        .filter((m) => m.name.trim())
        .map((m) => ({
          name: m.name.trim(),
          aadhaar: m.aadhaar?.name || null,
          id_card: m.idCard?.name || null,
        }));

      const { error } = await supabase.from('registrations').insert([
        {
          team_name: formData.teamName,
          sport: formData.sport,
          college_name: formData.collegeName,
          captain_name: formData.captainName,
          captain_mobile: formData.captainMobile,
          players: playersJson,
          captain_aadhaar_url: captainAadhaarUpload.url,
          captain_college_id_url: captainIdUpload.url,
          players_docs: playerDocUrls,
          payment_screenshot_url: paymentUpload.url,
          payment_status: 'Paid',
          registration_status: 'Pending',
        },
      ]);
      if (error) throw error;

      setSubmitted(true);
      setToast({ show: true, message: 'Registration successful!', type: 'success' });

      const submissionData = {
        teamName: formData.teamName,
        collegeName: formData.collegeName,
        sport: formData.sport,
        captainName: formData.captainName,
        captainMobile: formData.captainMobile,
        players: teamMembers.filter((m) => m.name.trim()),
        playerCount: (teamMembers.filter((m) => m.name.trim()).length || 0) + 1,
        submittedAt: new Date().toLocaleString(),
      };

      setTimeout(() => {
        setFormData({ teamName: '', collegeName: '', sport: '', captainName: '', captainMobile: '' });
        setTeamMembers([{ id: Date.now(), name: '', aadhaar: null, idCard: null }]);
        setCaptainAadhaar(null);
        setCaptainId(null);
        setPaymentScreenshot(null);
        setPaymentCompleted(false);
        setSubmitted(false);
        setStep(1);
        setLastSubmission(submissionData);
        setToast({ show: false, message: '', type: '' });
      }, 4000);
    } catch (err) {
      setToast({
        show: true,
        message: `Failed: ${err.message || 'Something went wrong'}`,
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
    }
  };

  const selectedSportFee = formData.sport
    ? sports.find((s) => s.name === formData.sport)?.fee || 0
    : 0;

  const inputClass = (error) =>
    `w-full px-4 py-3 bg-white/[0.03] text-white text-sm rounded-xl border ${
      error
        ? 'border-red-500/50 bg-red-500/5'
        : 'border-white/10 focus:border-purple-500/50 hover:border-white/20'
    } transition-all placeholder-gray-500 focus:outline-none focus:bg-white/[0.05]`;

  const fileInputClass =
    'w-full text-sm text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer bg-white/[0.03] rounded-xl border border-white/10 px-3 py-2.5 hover:border-white/20 transition-all';

  return (
    <section id="register" className="min-h-screen py-16 px-4 pt-28 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/50 via-black to-violet-950/30" />
        {/* Desktop-only heavy animations */}
        <div className="hidden md:block">
          <motion.div
            className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(147,51,234,0.15) 0%, transparent 70%)',
            }}
            animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
            }}
            animate={{ scale: [1.2, 1, 1.2], y: [0, -40, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)',
            }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        {/* Simplified mobile background */}
        <div className="md:hidden absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-violet-900/10" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(147,51,234,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(147,51,234,0.5) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2 backdrop-blur-xl border shadow-2xl ${
              toast.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-emerald-500/10'
                : 'bg-red-500/20 text-red-300 border-red-500/30 shadow-red-500/10'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          {isLive ? (
            <motion.div
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold uppercase tracking-widest animate-pulse mb-5 shadow-lg shadow-emerald-500/5 cursor-default"
              whileHover={{ scale: 1.02 }}
            >
              ● Registration is Live Now
            </motion.div>
          ) : (
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5"
              style={{
                background:
                  'linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0.1) 100%)',
                border: '1px solid rgba(239,68,68,0.3)',
              }}
            >
              <Zap className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs font-bold text-red-300 tracking-widest uppercase">
                Registration Closed
              </span>
            </motion.div>
          )}

          <h2
            className="text-4xl md:text-5xl font-black mb-3"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-400 to-violet-400">
              REGISTRATION
            </span>
          </h2>
          <p className="text-gray-400 text-sm">Join the ultimate sports championship</p>
          <p className="text-red-400 text-sm mt-1">
            For any problem in the accommodation or registration form please contact us on our{' '}
            <a
              href={`https://wa.me/${siteContent.registration?.supportWhatsapp || '9875325878'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:underline"
            >
              WhatsApp
            </a>
          </p>
        </motion.div>

        {isLive ? (
          <>
            {/* Step Indicator */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-3 mb-8"
            >
              {[
                { num: 1, label: 'Team', icon: Trophy },
                { num: 2, label: 'Docs', icon: FileText },
                { num: 3, label: 'Pay', icon: CreditCard },
              ].map((s, idx) => {
                const StepIcon = s.icon;
                return (
                  <div key={s.num} className="flex items-center gap-3">
                    <motion.div
                      className="relative"
                      whileHover={{ scale: step >= s.num ? 1.05 : 1 }}
                    >
                      <div
                        className={`relative w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${
                          step >= s.num
                            ? 'bg-gradient-to-br from-purple-600 to-fuchsia-600 shadow-lg shadow-purple-500/30'
                            : 'bg-white/[0.03] border border-white/10'
                        }`}
                      >
                        {step > s.num ? (
                          <Check className="w-5 h-5 text-white" />
                        ) : (
                          <StepIcon
                            className={`w-4 h-4 ${step >= s.num ? 'text-white' : 'text-gray-600'}`}
                          />
                        )}
                      </div>
                      <p
                        className={`text-[10px] font-semibold mt-1.5 text-center ${
                          step >= s.num ? 'text-purple-400' : 'text-gray-600'
                        }`}
                      >
                        {s.label}
                      </p>
                    </motion.div>
                    {idx < 2 && (
                      <div className="w-12 h-0.5 rounded-full bg-white/5 overflow-hidden mb-5">
                        <motion.div
                          className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500"
                          initial={{ width: '0%' }}
                          animate={{ width: step > s.num ? '100%' : '0%' }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </motion.div>

            {/* Last Submission */}
            <AnimatePresence>
              {lastSubmission && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 relative overflow-hidden rounded-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10" />
                  <div className="relative p-5 border border-emerald-500/20 bg-black/40 backdrop-blur-xl">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Last Registration
                      </h3>
                      <motion.button
                        whileHover={{ scale: 1.05, rotate: 90 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setLastSubmission(null)}
                        className="text-xs px-3 py-1.5 bg-emerald-600/20 text-emerald-300 rounded-lg border border-emerald-500/30 hover:bg-emerald-600/30 transition-all"
                      >
                        Close
                      </motion.button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {[
                        ['Team', lastSubmission.teamName],
                        ['Sport', lastSubmission.sport],
                        ['Captain', lastSubmission.captainName],
                        ['Players', lastSubmission.playerCount],
                      ].map(([l, v], i) => (
                        <div key={i} className="bg-white/[0.03] p-3 rounded-lg border border-white/5">
                          <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">{l}</p>
                          <p className="text-white font-semibold">{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
          <div className="relative">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-600/20 via-fuchsia-600/20 to-violet-600/20 rounded-3xl blur-sm" />
            <div
              className="relative rounded-3xl overflow-hidden"
              style={{
                background:
                  'linear-gradient(180deg, rgba(15,5,25,0.95) 0%, rgba(10,3,20,0.98) 100%)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-fuchsia-900/10" />
              <div className="relative p-6 md:p-8 border border-purple-500/10 rounded-3xl">
                {/* ══════ SUCCESS ══════ */}
                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30"
                    >
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-black text-white mb-2">You&apos;re In!</h3>
                    <p className="text-emerald-400 text-sm">
                      Registration complete for DAKSHA 2026
                    </p>
                  </motion.div>
                )}

                {/* ══════ STEP 1: TEAM INFO ══════ */}
                {!submitted && step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-5"
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Team Details</h3>
                        <p className="text-gray-500 text-xs">Basic information</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-400 font-medium mb-1.5 flex items-center gap-1.5">
                          <Trophy className="w-3 h-3 text-purple-400" /> Team Name *
                        </label>
                        <input
                          type="text"
                          name="teamName"
                          value={formData.teamName}
                          onChange={handleChange}
                          placeholder="Enter name"
                          className={inputClass(errors.teamName)}
                        />
                        {errors.teamName && (
                          <p className="text-red-400 text-xs mt-1">{errors.teamName}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 font-medium mb-1.5 flex items-center gap-1.5">
                          <Building2 className="w-3 h-3 text-blue-400" /> College Name *
                        </label>
                        <input
                          type="text"
                          name="collegeName"
                          value={formData.collegeName}
                          onChange={handleChange}
                          placeholder="College name"
                          className={inputClass(errors.collegeName)}
                        />
                        {errors.collegeName && (
                          <p className="text-red-400 text-xs mt-1">{errors.collegeName}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-400 font-medium mb-1.5 flex items-center gap-1.5">
                        <Star className="w-3 h-3 text-amber-400" /> Sport *
                      </label>
                      <div className="relative">
                        <select
                          name="sport"
                          value={formData.sport}
                          onChange={handleChange}
                          className={`${inputClass(errors.sport)} appearance-none cursor-pointer`}
                        >
                          <option value="" className="bg-[#0f0518]">
                            Choose sport...
                          </option>
                          {sports.map((sport) => (
                            <option key={sport.id} value={sport.name} className="bg-[#0f0518]">
                              {sport.name} ({sport.teamSize}P) - ₹{sport.fee}
                            </option>
                          ))}
                        </select>
                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 rotate-90 pointer-events-none" />
                      </div>
                      {errors.sport && (
                        <p className="text-red-400 text-xs mt-1">{errors.sport}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-400 font-medium mb-1.5 flex items-center gap-1.5">
                          <User className="w-3 h-3 text-emerald-400" /> Captain Name *
                        </label>
                        <input
                          type="text"
                          name="captainName"
                          value={formData.captainName}
                          onChange={handleChange}
                          placeholder="Full name"
                          className={inputClass(errors.captainName)}
                        />
                        {errors.captainName && (
                          <p className="text-red-400 text-xs mt-1">{errors.captainName}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 font-medium mb-1.5 flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-cyan-400" /> Captain Mobile *
                        </label>
                        <input
                          type="tel"
                          name="captainMobile"
                          value={formData.captainMobile}
                          onChange={handleChange}
                          placeholder="10-digit number"
                          maxLength={10}
                          className={inputClass(errors.captainMobile)}
                        />
                        {errors.captainMobile && (
                          <p className="text-red-400 text-xs mt-1">{errors.captainMobile}</p>
                        )}
                      </div>
                    </div>

                    <motion.button
                      type="button"
                      onClick={handleNext}
                      whileHover={{ scale: 1.01, y: -1 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full py-3.5 mt-2 rounded-xl text-sm font-bold text-white relative overflow-hidden group"
                      style={{
                        background:
                          'linear-gradient(135deg, #9333ea 0%, #c026d3 50%, #7c3aed 100%)',
                      }}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        Continue{' '}
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </motion.button>
                  </motion.div>
                )}

                {/* ══════ STEP 2: DOCUMENTS & MEMBERS ══════ */}
                {!submitted && step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-5"
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Documents</h3>
                        <p className="text-gray-500 text-xs">Verification files</p>
                      </div>
                    </div>

                    {/* Captain Documents */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-400 font-medium mb-1.5 flex items-center gap-1.5">
                          <Shield className="w-3 h-3 text-purple-400" /> Captain Aadhaar *
                        </label>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          onChange={(e) => {
                            const f = handleImageFileChange(e.target.files[0]);
                            if (f) setCaptainAadhaar(f);
                          }}
                          className={fileInputClass}
                        />
                        {captainAadhaar && (
                          <p className="text-emerald-400 text-xs mt-1 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            {captainAadhaar.name}
                          </p>
                        )}
                        {errors.captainAadhaar && (
                          <p className="text-red-400 text-xs mt-1">{errors.captainAadhaar}</p>
                        )}
                        <p className="text-gray-500 text-xs mt-1">PNG/JPEG only (Max 5MB)</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 font-medium mb-1.5 flex items-center gap-1.5">
                          <Shield className="w-3 h-3 text-blue-400" /> College ID *
                        </label>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          onChange={(e) => {
                            const f = handleImageFileChange(e.target.files[0]);
                            if (f) setCaptainId(f);
                          }}
                          className={fileInputClass}
                        />
                        {captainId && (
                          <p className="text-emerald-400 text-xs mt-1 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            {captainId.name}
                          </p>
                        )}
                        {errors.captainId && (
                          <p className="text-red-400 text-xs mt-1">{errors.captainId}</p>
                        )}
                        <p className="text-gray-500 text-xs mt-1">PNG/JPEG only (Max 5MB)</p>
                      </div>
                    </div>

                    {/* Team Members */}
                    {teamMembers.length > 0 && (
                      <div className="space-y-4 mt-6 pt-6 border-t border-white/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center">
                              <Users className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="text-base font-bold text-white">Team Members</h3>
                          </div>
                          <motion.button
                            type="button"
                            onClick={addTeamMember}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-lg text-xs font-semibold border border-purple-500/20 hover:bg-purple-500/30 transition-all"
                          >
                            <Plus className="w-3 h-3" /> Add
                          </motion.button>
                        </div>

                        {teamMembers.map((member, index) => (
                          <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-xl p-4 border border-purple-500/10"
                            style={{
                              background:
                                'linear-gradient(135deg, rgba(147,51,234,0.05) 0%, rgba(139,92,246,0.02) 100%)',
                            }}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-bold text-purple-400">
                                Player {index + 1}
                              </span>
                              {teamMembers.length > 1 && (
                                <motion.button
                                  type="button"
                                  onClick={() => removeTeamMember(index)}
                                  whileHover={{ scale: 1.1, rotate: 90 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="w-6 h-6 bg-red-600/20 rounded-md flex items-center justify-center text-red-400 border border-red-500/20 hover:bg-red-600/30 transition-all"
                                >
                                  <X className="w-3 h-3" />
                                </motion.button>
                              )}
                            </div>

                            <div className="space-y-3">
                              {/* Player Name */}
                              <div>
                                <input
                                  type="text"
                                  value={member.name}
                                  onChange={(e) =>
                                    handleMemberChange(index, 'name', e.target.value)
                                  }
                                  placeholder="Full name"
                                  className={inputClass(errors[`memberName-${index}`])}
                                />
                                {errors[`memberName-${index}`] && (
                                  <p className="text-red-400 text-xs mt-1">
                                    {errors[`memberName-${index}`]}
                                  </p>
                                )}
                              </div>

                              {/* Player Files */}
                              <div className="grid grid-cols-2 gap-3">
                                {/* Aadhaar */}
                                <div>
                                  <label className="text-xs text-gray-500 mb-1 block">
                                    Aadhaar *
                                  </label>
                                  <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png"
                                    onChange={(e) => {
                                      const f = handleImageFileChange(e.target.files[0]);
                                      if (f) handleMemberChange(index, 'aadhaar', f);
                                    }}
                                    className={fileInputClass}
                                  />
                                  {member.aadhaar && (
                                    <p className="text-emerald-400 text-[10px] mt-1 truncate">
                                      <Check className="w-2.5 h-2.5 inline" />{' '}
                                      {member.aadhaar.name}
                                    </p>
                                  )}
                                  {errors[`memberAadhaar-${index}`] && (
                                    <p className="text-red-400 text-[10px] mt-1">
                                      {errors[`memberAadhaar-${index}`]}
                                    </p>
                                  )}
                                  <p className="text-gray-500 text-[9px] mt-1">
                                    PNG/JPEG (Max 5MB)
                                  </p>
                                </div>

                                {/* ID Card */}
                                <div>
                                  <label className="text-xs text-gray-500 mb-1 block">
                                    ID Card *
                                  </label>
                                  <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png"
                                    onChange={(e) => {
                                      const f = handleImageFileChange(e.target.files[0]);
                                      if (f) handleMemberChange(index, 'idCard', f);
                                    }}
                                    className={fileInputClass}
                                  />
                                  {member.idCard && (
                                    <p className="text-emerald-400 text-[10px] mt-1 truncate">
                                      <Check className="w-2.5 h-2.5 inline" />{' '}
                                      {member.idCard.name}
                                    </p>
                                  )}
                                  {errors[`memberIdCard-${index}`] && (
                                    <p className="text-red-400 text-[10px] mt-1">
                                      {errors[`memberIdCard-${index}`]}
                                    </p>
                                  )}
                                  <p className="text-gray-500 text-[9px] mt-1">
                                    PNG/JPEG (Max 5MB)
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {/* Step 2 Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-400 bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-all"
                      >
                        ← Back
                      </button>
                      <motion.button
                        type="button"
                        onClick={handleNext}
                        whileHover={{ scale: 1.01, y: -1 }}
                        whileTap={{ scale: 0.99 }}
                        className="flex-1 py-3 rounded-xl text-sm font-bold text-white relative overflow-hidden group"
                        style={{
                          background:
                            'linear-gradient(135deg, #9333ea 0%, #c026d3 50%, #7c3aed 100%)',
                        }}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          Continue{' '}
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* ══════ STEP 3: PAYMENT ══════ */}
                {!submitted && step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-5"
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Payment</h3>
                        <p className="text-gray-500 text-xs">Complete registration</p>
                      </div>
                    </div>

                    {/* QR + Upload */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* QR Code */}
                      <div
                        className="rounded-2xl p-4 text-center"
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(251,146,60,0.05) 100%)',
                          border: '1px solid rgba(245,158,11,0.2)',
                        }}
                      >
                        <div className="flex items-center justify-center gap-1.5 mb-3">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-xs font-semibold text-amber-400">
                            Scan QR Code
                          </span>
                        </div>
                        {formData.sport ? (
                          <div className="w-36 h-36 mx-auto bg-white rounded-xl overflow-hidden mb-3 shadow-lg">
                            <img
                              src={sportQRMapping[formData.sport]}
                              alt="QR Code"
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.currentTarget.src =
                                  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZiIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5RUjwvdGV4dD48L3N2Zz4=';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-36 h-36 mx-auto bg-white/5 rounded-xl border-2 border-dashed border-amber-500/30 flex items-center justify-center mb-3">
                            <p className="text-gray-500 text-xs">Select sport first</p>
                          </div>
                        )}
                        <p className="text-3xl font-black text-amber-400">
                          ₹{selectedSportFee}
                        </p>
                      </div>

                      {/* Upload Area */}
                      <div className="space-y-3">
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          className={`relative rounded-xl p-5 border-2 border-dashed transition-all cursor-pointer ${
                            errors.payment
                              ? 'border-red-500/40 bg-red-500/5'
                              : paymentScreenshot
                                ? 'border-emerald-500/40 bg-emerald-500/5'
                                : 'border-purple-500/20 bg-white/[0.02] hover:border-purple-500/40'
                          }`}
                        >
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png"
                            onChange={(e) => {
                              const f = handleImageFileChange(e.target.files[0]);
                              if (f) {
                                setPaymentScreenshot(f);
                                setPaymentCompleted(true);
                                if (errors.payment)
                                  setErrors((prev) => ({ ...prev, payment: '' }));
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div className="flex flex-col items-center">
                            {paymentScreenshot ? (
                              <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-1" />
                            ) : (
                              <Upload className="w-8 h-8 text-purple-400 mb-1" />
                            )}
                            <span className="text-xs text-gray-400">
                              {paymentScreenshot ? 'Uploaded!' : 'Upload Screenshot'}
                            </span>
                            {paymentScreenshot && (
                              <span className="text-[10px] text-emerald-400 mt-1 truncate max-w-full">
                                {paymentScreenshot.name}
                              </span>
                            )}
                          </div>
                        </motion.div>
                        {errors.payment && (
                          <p className="text-red-400 text-xs">{errors.payment}</p>
                        )}
                        <p className="text-gray-500 text-xs">PNG/JPEG only (Max 5MB)</p>

                        <div
                          className="rounded-xl p-3"
                          style={{
                            background:
                              'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(251,146,60,0.05) 100%)',
                            border: '1px solid rgba(245,158,11,0.15)',
                          }}
                        >
                          <p className="text-amber-400 text-[10px] font-semibold mb-1.5">
                            Payment Steps:
                          </p>
                          <ol className="text-gray-400 text-[9px] space-y-0.5 list-decimal list-inside">
                            <li>Scan QR &amp; pay ₹{selectedSportFee}</li>
                            <li>Take screenshot of payment</li>
                            <li>Upload above</li>
                          </ol>
                        </div>
                      </div>
                    </div>

                    {/* Step 3 Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-400 bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-all"
                      >
                        ← Back
                      </button>
                      {paymentCompleted ? (
                        <motion.button
                          type="submit"
                          disabled={isSubmitting}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className="flex-1 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60 flex items-center justify-center gap-2"
                          style={{
                            background:
                              'linear-gradient(135deg, #9333ea 0%, #c026d3 50%, #7c3aed 100%)',
                          }}
                        >
                          {isSubmitting ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: 'linear',
                                }}
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                              />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" /> Register Team
                            </>
                          )}
                        </motion.button>
                      ) : (
                        <div className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-600 bg-white/[0.02] border border-dashed border-white/10 text-center">
                          Upload payment first
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.form>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative mt-8"
          >
            <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-600/20 via-fuchsia-600/20 to-violet-600/20 rounded-3xl blur-sm" />
            <div
              className="relative rounded-3xl p-8 text-center space-y-6 border border-purple-500/10"
              style={{
                background: 'linear-gradient(180deg, rgba(15,5,25,0.95) 0%, rgba(10,3,20,0.98) 100%)',
              }}
            >
              <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto shadow-lg shadow-purple-500/10">
                <AlertCircle className="w-8 h-8 text-purple-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white font-display uppercase tracking-wider">Registration Closed</h3>
                <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
                  We are not accepting online team registrations at this moment. The registration phase has either concluded or hasn&apos;t started yet.
                </p>
              </div>
              <div className="pt-2">
                <p className="text-xs text-gray-500">
                  For emergency queries or verification issues, contact support via WhatsApp:
                </p>
                <a
                  href={`https://wa.me/${siteContent.registration?.supportWhatsapp || '9875325878'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 px-5 py-2.5 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 hover:border-purple-500/40 text-purple-300 hover:text-purple-200 rounded-xl text-xs font-bold transition-all"
                >
                  <Phone className="w-3.5 h-3.5" /> Contact Support WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        )}

        {/* Guidelines */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <div
            className="rounded-2xl p-4 border border-purple-500/10"
            style={{
              background:
                'linear-gradient(135deg, rgba(147,51,234,0.05) 0%, rgba(139,92,246,0.02) 100%)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-purple-300">Guidelines</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['All fields required', '10-digit mobile', 'Valid documents', 'Non-refundable'].map(
                (g, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] text-gray-500">
                    <div className="w-1 h-1 rounded-full bg-purple-500" />
                    {g}
                  </div>
                )
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(147, 51, 234, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #9333ea, #c026d3);
          border-radius: 10px;
        }
      `}</style>
    </section>
  );
}