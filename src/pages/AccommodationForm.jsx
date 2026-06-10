import { useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { Check, User, Phone, Trophy, Building2, Upload, CreditCard, Sparkles, Shield, Star, ChevronRight, CheckCircle2, AlertCircle, X, Zap, Users } from 'lucide-react';
import { supabase } from "../supabaseClient";
import { useSiteContent } from "../contexts/SiteContentContext";

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? "50%" : "-50%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  },
  exit: (direction) => ({
    x: direction > 0 ? "-50%" : "50%",
    opacity: 0,
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  }),
};

const AccommodationForm = () => {
  const siteContent = useSiteContent();
  const sports = siteContent.registration?.sports || [];
  const PRICE = Number(siteContent.registration?.accommodationCharge || 550);
  const isAccommodationLive = siteContent.registration?.isAccommodationLive !== false;
  
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [form, setForm] = useState({
    teamName: "",
    collegeName: "",
    sport: "",
    captainName: "",
    captainMobile: "",
  });

  const [players, setPlayers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [playerPayments, setPlayerPayments] = useState({}); // { playerName: 'UPI' or 'Cash' }
  const [alreadyBookedPlayers, setAlreadyBookedPlayers] = useState(new Set()); // Set of normalized lowercase names
  const [playerSportsMap, setPlayerSportsMap] = useState({}); // { playerName: [{ sport, team_name }] }
  const [utr, setUtr] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const normalizeName = (nameWithPayment) => {
    if (!nameWithPayment) return "";
    return nameWithPayment.replace(/\s*\((UPI|Cash|Already Paid.*?)\)\s*$/i, "").trim().toLowerCase();
  };

  const isPlayerAlreadyBooked = (playerName) => {
    return alreadyBookedPlayers.has(playerName.toLowerCase().trim());
  };

  const fetchPlayers = async () => {
    if (!form.teamName.trim() || !form.collegeName.trim() || !form.sport.trim() || !form.captainName.trim() || !form.captainMobile.trim()) {
      setToast({ show: true, message: 'Please fill all team details including captain name and mobile number', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
      return;
    }

    // Validate mobile number format
    if (!/^[0-9]{10}$/.test(form.captainMobile.trim())) {
      setToast({ show: true, message: 'Captain mobile number must be exactly 10 digits', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
      return;
    }

    try {
      setPlayerSportsMap({});
      
      // 1. Fetch team players from registrations via RPC
      const { data, error } = await supabase.rpc('get_team_players', {
        p_team_name: form.teamName.trim(),
        p_college_name: form.collegeName.trim(),
        p_sport: form.sport.trim(),
        p_captain_name: form.captainName.trim(),
        p_captain_mobile: form.captainMobile.trim()
      });

      if (error || !data) {
        let errorMsg = 'No team found with these details. Team details must match exactly.';
        if (error) {
          errorMsg = `Database Error: ${error.message || JSON.stringify(error)}`;
          console.error("Error invoking get_team_players RPC:", error);
        }
        setToast({ show: true, message: errorMsg, type: 'error' });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 5000);
        return;
      }

      // Combine captain and players into one array
      const allTeamMembers = [];
      
      // Add captain first
      if (data.captain_name) {
        allTeamMembers.push(data.captain_name);
      }
      
      // Add other players
      if (data.players && Array.isArray(data.players)) {
        data.players.forEach(player => {
          const playerName = player.name || player;
          if (playerName && !allTeamMembers.includes(playerName)) {
            allTeamMembers.push(playerName);
          }
        });
      }

      if (allTeamMembers.length === 0) {
        setToast({ show: true, message: 'No team members found', type: 'error' });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
        return;
      }

      // 2. Query existing active bookings for this college to find who already paid
      const { data: existingRequests, error: reqError } = await supabase
        .rpc('get_college_bookings', { p_college_name: form.collegeName.trim() });

      const bookedSet = new Set();
      if (!reqError && existingRequests) {
        existingRequests.forEach(row => {
          const playersArray = row.selected_players || row;
          if (Array.isArray(playersArray)) {
            playersArray.forEach(p => {
              bookedSet.add(normalizeName(p));
            });
          }
        });
      }

      // 3. Fetch registered sports for all team members via RPC to detect multi-sport players
      try {
        const { data: sportsData, error: sportsError } = await supabase.rpc('get_player_sports', {
          p_college_name: form.collegeName.trim(),
          p_player_names: allTeamMembers
        });
        if (!sportsError && sportsData) {
          setPlayerSportsMap(sportsData);
        } else {
          console.error("Error fetching player sports:", sportsError);
        }
      } catch (e) {
        console.error("Error fetching player sports RPC:", e);
      }

      setPlayers(allTeamMembers);
      setAlreadyBookedPlayers(bookedSet);
      setSelected([]);
      setPlayerPayments({});
      setToast({ show: true, message: `Found ${allTeamMembers.length} team members`, type: 'success' });
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);

      // Transition to Step 2
      setDirection(1);
      setStep(2);
    } catch (err) {
      console.error('Error in fetchPlayers:', err);
      setToast({ show: true, message: 'Failed to fetch team members', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Check file format
    const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedFormats.includes(selectedFile.type)) {
      setToast({ show: true, message: 'Only PNG and JPEG formats are allowed', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
      e.target.value = ''; // Clear the input
      return;
    }

    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setToast({ show: true, message: 'File size must be less than 5MB', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
      e.target.value = ''; // Clear the input
      return;
    }

    setFile(selectedFile);
  };

  const togglePlayer = (player) => {
    setSelected((prev) =>
      prev.includes(player)
        ? prev.filter((p) => p !== player)
        : [...prev, player]
    );
  };

  // Selected players who are NOT already booked
  const billablePlayers = selected.filter(p => !isPlayerAlreadyBooked(p));
  
  // Count of billable players paying by UPI vs Cash
  const upiCount = billablePlayers.filter(p => (playerPayments[p] || 'UPI') === 'UPI').length;
  const cashCount = billablePlayers.filter(p => playerPayments[p] === 'Cash').length;
  const freeCount = players.filter(p => isPlayerAlreadyBooked(p)).length;

  const upiAmount = upiCount * PRICE;
  const cashAmount = cashCount * PRICE;
  const totalAmount = upiAmount + cashAmount;
  const totalPersons = selected.length + freeCount;

  const submitAccommodation = async () => {
    const needsUpiUpload = upiAmount > 0;

    if (needsUpiUpload && (!file || !utr.trim())) {
      setToast({ show: true, message: 'Upload payment screenshot & UTR', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
      return;
    }

    if (selected.length === 0) {
      setToast({ show: true, message: 'Please select at least one player', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
      return;
    }

    setLoading(true);

    try {
      let uploadPath = null;

      if (needsUpiUpload && file) {
        const cleanTeam = form.teamName.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
        const path = `team-${cleanTeam}/${Date.now()}.png`;
        const { data: uploadData, error: uploadError } =
          await supabase.storage
            .from("accommodation-payments")
            .upload(path, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          setToast({ show: true, message: `Upload failed: ${uploadError.message}`, type: 'error' });
          setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
          setLoading(false);
          return;
        }
        uploadPath = uploadData.path;
      }

      const allSelected = [...selected, ...players.filter(p => isPlayerAlreadyBooked(p))];
      const selectedPlayersFormatted = allSelected.map(p => {
        const isAlreadyPaid = isPlayerAlreadyBooked(p);
        if (isAlreadyPaid) {
          const registeredSports = playerSportsMap[p] ? playerSportsMap[p].map(r => r.sport).join(', ') : '';
          return `${p} (Already Paid${registeredSports ? ` - ${registeredSports}` : ''})`;
        }
        return `${p} (${playerPayments[p] || 'UPI'})`;
      });

      const initialPaymentMethod = totalAmount === 0 ? 'Free' : (upiCount > 0 && cashCount > 0) ? 'Mixed' : upiCount > 0 ? 'UPI' : 'Cash';

      const { error: insertError } = await supabase.from("accommodation_requests").insert({
        team_name: form.teamName.trim(),
        college_name: form.collegeName.trim(),
        sport: form.sport.trim(),
        captain_name: form.captainName.trim(),
        captain_mobile: form.captainMobile.trim(),
        selected_players: selectedPlayersFormatted,
        total_persons: totalPersons,
        total_amount: totalAmount,
        utr_number: needsUpiUpload ? utr.trim() : (totalAmount === 0 ? 'FREE_CHECK_IN' : 'CASH_PAYMENT'),
        payment_screenshot_url: uploadPath,
        status: "pending",
        payment_method: initialPaymentMethod,
        cash_amount: cashAmount,
        upi_amount: upiAmount,
      });

      if (insertError) {
        console.error('❌ Insert error:', insertError);
        setToast({ show: true, message: `Failed to save request: ${insertError.message}`, type: 'error' });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
        setLoading(false);
        return;
      }

      setToast({ show: true, message: 'Accommodation request submitted successfully!', type: 'success' });
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
      
      // Reset form
      setForm({
        teamName: "",
        collegeName: "",
        sport: "",
        captainName: "",
        captainMobile: "",
      });
      setPlayers([]);
      setSelected([]);
      setAlreadyBookedPlayers(new Set());
      setPlayerSportsMap({});
      setUtr("");
      setFile(null);
      setLoading(false);
      setDirection(1);
      setStep(1);
    } catch (err) {
      console.error('Submit error:', err);
      setToast({ show: true, message: 'Failed to submit accommodation request', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
      setLoading(false);
    }
  };

  const inputClass = (error) =>
    `w-full px-4 py-3 bg-white/[0.02] text-white text-sm rounded-xl border ${
      error
        ? 'border-red-500/40 bg-red-500/5 focus:border-red-500/60 focus:ring-1 focus:ring-red-500/20'
        : 'border-white/10 focus:border-purple-500/50 hover:border-white/20 focus:ring-1 focus:ring-purple-500/20'
    } transition-all duration-300 placeholder-gray-500 focus:outline-none focus:bg-white/[0.04] backdrop-blur-md`;

  const fileInputClass = "w-full text-sm text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer bg-white/[0.03] rounded-xl border border-white/10 px-3 py-2.5 hover:border-white/20 transition-all";

  return (
    <section id="accommodation" className="min-h-screen py-16 px-4 relative overflow-hidden pt-28">
      {/* Animated Gradient Background - Same as registration */}
      <div className="fixed inset-0 bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/50 via-black to-violet-950/30" />
        <motion.div 
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(147,51,234,0.15) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)' }}
          animate={{ scale: [1.2, 1, 1.2], y: [0, -40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(147,51,234,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(147,51,234,0.5) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }} />
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: -30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -30, scale: 0.9 }}
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2 backdrop-blur-xl border shadow-2xl ${
              toast.type === 'success' 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-emerald-500/10' 
                : 'bg-red-500/20 text-red-300 border-red-500/30 shadow-red-500/10'
            }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          {isAccommodationLive ? (
            <motion.div 
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold uppercase tracking-widest mb-5 shadow-lg shadow-emerald-500/5 cursor-default"
              whileHover={{ scale: 1.02 }}
            >
              ● Accommodation is Live Now
            </motion.div>
          ) : (
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5"
              style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0.1) 100%)', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              <Zap className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs font-bold text-red-300 tracking-widest uppercase">Accommodation Closed</span>
            </motion.div>
          )}
          
          <h2 className="text-4xl md:text-5xl font-black mb-3" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-400 to-violet-400">
              ACCOMMODATION
            </span>
          </h2>
          <p className="text-gray-400 text-sm">
            It includes the charges for Food + Accommodation for 3 days
          </p>
          <p className="text-red-400 text-sm mt-1">
            For any problem in the accommodation or registration form please contact us on our{' '}
            <a href={`https://wa.me/${siteContent.registration?.supportWhatsapp || "9875325878"}`} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
              WhatsApp
            </a>
          </p>
        </motion.div>

        {/* Form Card */}
        {isAccommodationLive ? (
          <div className="max-w-2xl mx-auto mt-6">
            {/* Horizontal Stepper (Desktop & Mobile) */}
            <div className="flex items-center justify-between mb-8 max-w-xl mx-auto relative px-4">
              {/* Background Connecting Line */}
              <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-[2px] bg-white/[0.05] z-0" />
              
              {/* Active Connecting Line */}
              <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-[2px] z-0">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-violet-500 origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: step === 1 ? 0 : step === 2 ? 0.5 : 1 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  style={{ height: '100%' }}
                />
              </div>

              {[
                { num: 1, label: 'Search Team', icon: Trophy },
                { num: 2, label: 'Select Players', icon: Users },
                { num: 3, label: 'Checkout', icon: CreditCard },
              ].map((s) => {
                const StepIcon = s.icon;
                const isActive = step === s.num;
                const isCompleted = step > s.num;
                
                return (
                  <div key={s.num} className="flex flex-col items-center relative z-10">
                    <motion.div
                      whileHover={{ scale: step >= s.num ? 1.05 : 1 }}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        isCompleted
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                          : isActive
                            ? 'bg-gradient-to-br from-purple-600 to-fuchsia-600 shadow-xl shadow-purple-500/30 text-white'
                            : 'bg-[#150a25] border border-white/10 text-gray-500'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </motion.div>
                    <span className={`text-[10px] font-bold mt-2 tracking-wider uppercase ${
                      isActive ? 'text-purple-400' : isCompleted ? 'text-emerald-400' : 'text-gray-500'
                    }`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Form Card Wrapper */}
            <div className="relative">
              {/* Card glow */}
              <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-600/20 via-fuchsia-600/20 to-violet-600/20 rounded-3xl blur-sm" />
              
              <div className="relative rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(15,5,25,0.95) 0%, rgba(10,3,20,0.98) 100%)' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-fuchsia-900/10" />
                <div className="relative p-6 md:p-8 border border-purple-500/10 rounded-3xl">
                  <div className="space-y-5">
                    <AnimatePresence mode="wait" custom={direction}>
                      {step === 1 && (
                        <motion.div
                          key="step1"
                          custom={direction}
                          variants={slideVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          className="space-y-5"
                        >
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                              <Building2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white">Team Verification</h3>
                              <p className="text-gray-500 text-xs">Verify your GCEK Daksha registration details</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs text-gray-400 font-medium mb-1.5 flex items-center gap-1.5">
                                <Trophy className="w-3 h-3 text-purple-400" /> Team Name *
                              </label>
                              <input
                                type="text"
                                placeholder="Enter team name"
                                className={inputClass()}
                                value={form.teamName}
                                onChange={(e) => setForm({ ...form, teamName: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-400 font-medium mb-1.5 flex items-center gap-1.5">
                                <Building2 className="w-3 h-3 text-blue-400" /> College Name *
                              </label>
                              <input
                                type="text"
                                placeholder="College name"
                                className={inputClass()}
                                value={form.collegeName}
                                onChange={(e) => setForm({ ...form, collegeName: e.target.value })}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs text-gray-400 font-medium mb-1.5 flex items-center gap-1.5">
                                <User className="w-3 h-3 text-emerald-400" /> Captain Name *
                              </label>
                              <input
                                type="text"
                                placeholder="Full name"
                                className={inputClass()}
                                value={form.captainName}
                                onChange={(e) => setForm({ ...form, captainName: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-400 font-medium mb-1.5 flex items-center gap-1.5">
                                <Phone className="w-3 h-3 text-cyan-400" /> Captain Mobile *
                              </label>
                              <input
                                type="tel"
                                placeholder="10-digit number"
                                maxLength={10}
                                className={inputClass()}
                                value={form.captainMobile}
                                onChange={(e) => setForm({ ...form, captainMobile: e.target.value })}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-xs text-gray-400 font-medium mb-1.5 flex items-center gap-1.5">
                              <Star className="w-3 h-3 text-amber-400" /> Sport *
                            </label>
                            <div className="relative">
                              <select
                                value={form.sport}
                                onChange={(e) => setForm({ ...form, sport: e.target.value })}
                                className={`${inputClass()} appearance-none cursor-pointer`}
                              >
                                <option value="" className="bg-[#0f0518]">Choose sport...</option>
                                {sports.map(sport => (
                                  <option key={sport.id} value={sport.name} className="bg-[#0f0518]">
                                    {sport.name}
                                  </option>
                                ))}
                              </select>
                              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 rotate-90 pointer-events-none" />
                            </div>
                          </div>

                          <motion.button
                            onClick={fetchPlayers}
                            whileHover={{ scale: 1.01, y: -1 }}
                            whileTap={{ scale: 0.99 }}
                            className="w-full py-3.5 rounded-xl text-sm font-bold text-white relative overflow-hidden group cursor-pointer"
                            style={{ background: 'linear-gradient(135deg, #9333ea 0%, #c026d3 50%, #7c3aed 100%)' }}
                          >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              <Users className="w-4 h-4" />
                              Fetch Team Players
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                          </motion.button>
                        </motion.div>
                      )}

                      {step === 2 && (
                        <motion.div
                          key="step2"
                          custom={direction}
                          variants={slideVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          className="space-y-5"
                        >
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white">Select Players</h3>
                              <p className="text-gray-500 text-xs">Choose members requiring boarding</p>
                            </div>
                          </div>

                          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                            {players.map((playerName, idx) => {
                              const isSelected = selected.includes(playerName);
                              const isAlreadyPaid = isPlayerAlreadyBooked(playerName);
                              return (
                                <motion.div
                                  key={playerName}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.04 }}
                                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all duration-300 ${
                                    isAlreadyPaid
                                      ? 'border-emerald-500/20 bg-emerald-500/[0.02] opacity-80 cursor-default'
                                      : isSelected
                                        ? 'border-purple-500/30 bg-purple-500/5 shadow-md shadow-purple-500/5 hover:border-purple-500/40 hover:bg-purple-500/10'
                                        : 'border-white/[0.06] bg-white/[0.01] hover:border-purple-500/20 hover:bg-white/[0.03] cursor-pointer'
                                  }`}
                                  onClick={() => {
                                    if (!isAlreadyPaid) {
                                      togglePlayer(playerName);
                                    }
                                  }}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                                      isAlreadyPaid
                                        ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                                        : isSelected
                                          ? 'bg-purple-600 border-purple-600 text-white'
                                          : 'border-white/20 hover:border-purple-500'
                                    }`}>
                                      {(isAlreadyPaid || isSelected) && <Check className="w-3.5 h-3.5" />}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-white text-sm font-semibold">{playerName}</span>
                                      {playerSportsMap[playerName] && playerSportsMap[playerName].length > 1 && (
                                        <span className="text-[10px] font-semibold text-purple-400 mt-0.5 flex items-center gap-1">
                                          🎒 Multi-Sport: {playerSportsMap[playerName].map(r => r.sport).join(', ')}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-end">
                                    {isAlreadyPaid ? (
                                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                        ✓ Paid (₹0)
                                      </span>
                                    ) : (
                                      isSelected && (
                                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                          <button
                                            type="button"
                                            onClick={() => setPlayerPayments(p => ({ ...p, [playerName]: 'UPI' }))}
                                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                              (playerPayments[playerName] || 'UPI') === 'UPI'
                                                ? 'bg-purple-600 text-white border border-purple-500 shadow-md shadow-purple-500/20'
                                                : 'bg-white/[0.02] text-gray-400 border border-white/[0.05] hover:text-white'
                                            }`}
                                          >
                                            📱 UPI
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setPlayerPayments(p => ({ ...p, [playerName]: 'Cash' }))}
                                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                              playerPayments[playerName] === 'Cash'
                                                ? 'bg-emerald-600 text-white border border-emerald-500 shadow-md shadow-emerald-500/20'
                                                : 'bg-white/[0.02] text-gray-400 border border-white/[0.05] hover:text-white'
                                            }`}
                                          >
                                            💵 Cash
                                          </button>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>

                          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-900/20 to-fuchsia-900/20 border border-purple-500/20">
                            <div>
                              <p className="text-gray-400 text-xs mb-1">Total Persons Selected</p>
                              <p className="text-2xl font-black text-purple-400">{totalPersons}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs mb-1">Payable Amount</p>
                              <p className="text-2xl font-black text-fuchsia-400">₹{totalAmount}</p>
                            </div>
                          </div>

                          <div className="flex gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => { setDirection(-1); setStep(1); }}
                              className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-400 bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-all cursor-pointer"
                            >
                              ← Back
                            </button>
                            <motion.button
                              type="button"
                              onClick={() => {
                                if (selected.length === 0) {
                                  setToast({ show: true, message: 'Please select at least one player', type: 'error' });
                                  setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
                                  return;
                                }
                                setDirection(1);
                                setStep(3);
                              }}
                              whileHover={{ scale: 1.01, y: -1 }}
                              whileTap={{ scale: 0.99 }}
                              className="flex-1 py-3 rounded-xl text-sm font-bold text-white relative overflow-hidden group cursor-pointer"
                              style={{ background: 'linear-gradient(135deg, #9333ea 0%, #c026d3 50%, #7c3aed 100%)' }}
                            >
                              <span className="relative z-10 flex items-center justify-center gap-2">
                                Continue <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                              </span>
                            </motion.button>
                          </div>
                        </motion.div>
                      )}

                      {step === 3 && (
                        <motion.div
                          key="step3"
                          custom={direction}
                          variants={slideVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          className="space-y-5"
                        >
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                              <CreditCard className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white">Checkout</h3>
                              <p className="text-gray-500 text-xs">Complete accommodation boarding</p>
                            </div>
                          </div>

                          {/* Dynamic layout based on UPI vs Cash breakdown */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-purple-950/20 border border-purple-500/10 mb-6">
                            <div className="text-center md:text-left border-b md:border-b-0 md:border-r border-white/5 pb-2 md:pb-0">
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">UPI Amount</p>
                              <p className="text-lg font-black text-amber-400">₹{upiAmount} <span className="text-xs text-gray-500">({upiCount} players)</span></p>
                            </div>
                            <div className="text-center md:text-left border-b md:border-b-0 md:border-r border-white/5 py-2 md:py-0 md:px-4">
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Cash Amount</p>
                              <p className="text-lg font-black text-emerald-400">₹{cashAmount} <span className="text-xs text-gray-500">({cashCount} players)</span></p>
                            </div>
                            <div className="text-center md:text-left pt-2 md:pt-0 md:px-4">
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Free Amount</p>
                              <p className="text-lg font-black text-purple-400">₹{freeCount * PRICE} <span className="text-xs text-gray-500">({freeCount} already paid)</span></p>
                            </div>
                          </div>

                          {totalAmount > 0 ? (
                            <>
                              {upiAmount > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="rounded-2xl p-4 text-center border border-amber-500/20 bg-amber-500/[0.03]">
                                    <div className="flex items-center justify-center gap-1.5 mb-3">
                                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                      <span className="text-xs font-semibold text-amber-400">Scan QR Code</span>
                                    </div>
                                    <div className="w-36 h-36 mx-auto bg-white rounded-xl overflow-hidden mb-3 shadow-lg">
                                      <img
                                        src={siteContent.registration?.accommodationQrCode || "/acco.jpeg"}
                                        alt="Accommodation QR Code"
                                        className="w-full h-full object-contain" 
                                        onError={(e) => { e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZiIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5RUjwvdGV4dD48L3N2Zz4='; }}
                                      />
                                    </div>
                                    <p className="text-2xl font-black text-amber-400">₹{upiAmount}</p>
                                    <p className="text-[10px] text-gray-500 mt-1">Please pay the UPI amount only</p>
                                  </div>

                                  <div className="space-y-3">
                                    <div>
                                      <label className="text-xs text-gray-400 font-medium mb-1.5 flex items-center gap-1.5">
                                        <CreditCard className="w-3 h-3 text-purple-400" /> UTR Number *
                                      </label>
                                      <input
                                        type="text"
                                        placeholder="Enter 12-digit UTR number"
                                        className={inputClass()}
                                        value={utr}
                                        onChange={(e) => setUtr(e.target.value)}
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-gray-400 font-medium mb-1.5 flex items-center gap-1.5">
                                        <Upload className="w-3 h-3 text-blue-400" /> Payment Screenshot *
                                      </label>
                                      <div 
                                        onClick={() => document.getElementById('accommodationScreenshotInput').click()}
                                        className={`relative rounded-2xl p-5 border-2 border-dashed transition-all duration-300 cursor-pointer text-center group/upload hover:scale-[1.02] ${
                                          file 
                                            ? 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50 shadow-md' 
                                            : 'border-purple-500/25 bg-white/[0.01] hover:border-purple-500/40 hover:bg-white/[0.02]'
                                        }`}
                                      >
                                        <input
                                          id="accommodationScreenshotInput"
                                          type="file"
                                          accept="image/jpeg,image/jpg,image/png"
                                          onChange={handleFileChange}
                                          onClick={(e) => e.stopPropagation()}
                                          className="hidden"
                                        />
                                        <div className="flex flex-col items-center justify-center">
                                          {file ? (
                                            <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-1.5" />
                                          ) : (
                                            <Upload className="w-8 h-8 text-purple-400 mb-1.5" />
                                          )}
                                          <span className="text-xs text-gray-300 font-bold">
                                            {file ? 'Screenshot Uploaded' : 'Upload Screenshot'}
                                          </span>
                                          <span className="text-[9px] text-gray-500 mt-1 truncate max-w-full block">
                                            {file ? file.name : 'PNG/JPEG (Max 5MB)'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.03] text-center space-y-2">
                                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-400">
                                    <CheckCircle2 className="w-6 h-6" />
                                  </div>
                                  <h4 className="text-base font-bold text-white">Cash Only Booking</h4>
                                  <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                                    You have selected Cash payment for all checked-in players. You do not need to scan the QR code or upload a screenshot. Please pay ₹{cashAmount} in cash to the GCEK registration desk upon arrival.
                                  </p>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="p-5 rounded-2xl border border-purple-500/25 bg-purple-500/[0.03] text-center space-y-2">
                              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto text-purple-400">
                                <Sparkles className="w-6 h-6" />
                              </div>
                              <h4 className="text-base font-bold text-white">Free Accommodation Check-In</h4>
                              <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                                All selected players have already paid for accommodation through another sport. There is no additional charge.
                              </p>
                            </div>
                          )}

                          <div className="flex gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => { setDirection(-1); setStep(2); }}
                              className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-400 bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-all cursor-pointer"
                            >
                              ← Back
                            </button>
                            <motion.button
                              onClick={submitAccommodation}
                              disabled={loading}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              className="flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                              style={{ background: 'linear-gradient(135deg, #9333ea 0%, #c026d3 50%, #7c3aed 100%)' }}
                            >
                              {loading ? (
                                <>
                                  <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  Booking Stay...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-4 h-4" />
                                  {totalAmount === 0 ? 'Confirm Free Check-In' : upiAmount === 0 ? 'Confirm Cash Check-In' : 'Confirm Stay Booking'}
                                </>
                              )}
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Guidelines */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6"
            >
              <div
                className="rounded-2xl p-4 border border-purple-500/10 bg-gradient-to-br from-purple-950/20 via-transparent to-violet-950/10 backdrop-blur-md"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-purple-300">Accommodation Guidelines</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'Verify team details before fetching players',
                    'Choose Cash/UPI individually for each player',
                    'Multi-sport players pay accommodation charge once',
                    'Input correct UTR for fast approval'
                  ].map((g, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                      {g}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
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
                <h3 className="text-2xl font-black text-white font-display uppercase tracking-wider">Accommodation Closed</h3>
                <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
                  Hostel room bookings and food reservations are currently offline or fully occupied.
                </p>
              </div>
              <div className="pt-2">
                <p className="text-xs text-gray-500">
                  Please coordinate directly with official hostel wardens or contact support:
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
      </div>

      <style>{`
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
};

export default AccommodationForm;
