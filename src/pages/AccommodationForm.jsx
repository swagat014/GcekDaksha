import { useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { Check, User, Phone, Trophy, Building2, Upload, CreditCard, Sparkles, Shield, Star, ChevronRight, CheckCircle2, AlertCircle, X, Zap, Users } from 'lucide-react';
import { supabase } from "../supabaseClient";
import PlayerCheckbox from "../components/PlayerCheckbox";
import { useSiteContent } from "../contexts/SiteContentContext";

const AccommodationForm = () => {
  const siteContent = useSiteContent();
  const sports = siteContent.registration?.sports || [];
  const PRICE = Number(siteContent.registration?.accommodationCharge || 550);
  const isAccommodationLive = siteContent.registration?.isAccommodationLive !== false;
  const [form, setForm] = useState({
    teamName: "",
    collegeName: "",
    sport: "",
    captainName: "",
    captainMobile: "",
  });

  const [players, setPlayers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [utr, setUtr] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

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
      // First, try exact match with captain details
      let { data, error } = await supabase
        .from("registrations")
        .select("captain_name, captain_mobile, players, team_name, college_name, sport")
        .eq("team_name", form.teamName.trim())
        .eq("college_name", form.collegeName.trim())
        .eq("sport", form.sport.trim())
        .eq("captain_name", form.captainName.trim())
        .eq("captain_mobile", form.captainMobile.trim())
        .single();

      // If exact match fails, try case-insensitive match for captain name with exact mobile match
      if (error || !data) {
        const { data: allTeams, error: fetchError } = await supabase
          .from("registrations")
          .select("captain_name, captain_mobile, players, team_name, college_name, sport");

        if (fetchError) {
          console.error('Supabase error:', fetchError);
          setToast({ show: true, message: `Error fetching teams: ${fetchError.message}`, type: 'error' });
          setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
          return;
        }

        // Find matching team using case-insensitive comparison for name and exact match for mobile
        data = allTeams?.find(team => 
          team.team_name.toLowerCase() === form.teamName.trim().toLowerCase() &&
          team.college_name.toLowerCase() === form.collegeName.trim().toLowerCase() &&
          team.sport.toLowerCase() === form.sport.trim().toLowerCase() &&
          team.captain_name.toLowerCase() === form.captainName.trim().toLowerCase() &&
          team.captain_mobile === form.captainMobile.trim()
        );

        if (!data) {
          setToast({ show: true, message: 'No team found with these details. Captain name  and mobile number must match exactly', type: 'error' });
          setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
          return;
        }
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

      setPlayers(allTeamMembers);
      setSelected([]);
      setToast({ show: true, message: `Found ${allTeamMembers.length} team members`, type: 'success' });
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
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

  const totalPersons = selected.length;
  const totalAmount = totalPersons * PRICE;

  const submitAccommodation = async () => {
    if (!file || !utr) {
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
      const path = `team-${form.teamName}/${Date.now()}.png`;

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

      const { error: insertError } = await supabase.from("accommodation_requests").insert({
        team_name: form.teamName.trim(),
        college_name: form.collegeName.trim(),
        sport: form.sport.trim(),
        captain_name: form.captainName.trim(),
        captain_mobile: form.captainMobile.trim(),
        selected_players: selected,
        total_persons: totalPersons,
        total_amount: totalAmount,
        utr_number: utr.trim(),
        payment_screenshot_url: uploadData.path,
        status: "pending",
      });

      console.log('📝 Inserting accommodation request:', {
        team_name: form.teamName.trim(),
        college_name: form.collegeName.trim(),
        sport: form.sport.trim(),
        captain_name: form.captainName.trim(),
        captain_mobile: form.captainMobile.trim(),
        selected_players: selected,
        total_persons: totalPersons,
        total_amount: totalAmount,
        utr_number: utr.trim(),
        payment_screenshot_url: uploadData.path,
        status: "pending",
      });

      if (insertError) {
        console.error('❌ Insert error:', insertError);
        setToast({ show: true, message: `Failed to save request: ${insertError.message}`, type: 'error' });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
        setLoading(false);
        return;
      }

      console.log('✅ Accommodation request inserted successfully!');

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
      setUtr("");
      setFile(null);
      setLoading(false);
    } catch (err) {
      console.error('Submit error:', err);
      setToast({ show: true, message: 'Failed to submit accommodation request', type: 'error' });
      setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
      setLoading(false);
    }
  };

  const inputClass = (error) =>
    `w-full px-4 py-3 bg-white/[0.03] text-white text-sm rounded-xl border ${error ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 focus:border-purple-500/50 hover:border-white/20'} transition-all placeholder-gray-500 focus:outline-none focus:bg-white/[0.05]`;

  const fileInputClass = "w-full text-sm text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer bg-white/[0.03] rounded-xl border border-white/10 px-3 py-2.5 hover:border-white/20 transition-all";

  return (
    <section id="accommodation" className="min-h-screen py-16 px-4 relative overflow-hidden">
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

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          {isAccommodationLive ? (
            <motion.div 
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold uppercase tracking-widest animate-pulse mb-5 shadow-lg shadow-emerald-500/5 cursor-default"
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
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-400 to-violet-400"
              style={{ textShadow: '0 0 40px rgba(147,51,234,0.5)' }}>
              ACCOMMODATION
            </span>
          </h2>
          <p className="text-gray-400 text-md">
            It includes the charges for Food + Accommodation for 3 days
          </p>
          <p className="text-red-400 text-sm">
            For any problem in the accomodation or registration form please contact us on our <a href={`https://wa.me/${siteContent.registration?.supportWhatsapp || "9875325878"}`} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">WhatsApp</a>
          </p>
        </motion.div>

        {/* Form Card */}
        {isAccommodationLive ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="relative">
            {/* Card glow */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-600/20 via-fuchsia-600/20 to-violet-600/20 rounded-3xl blur-sm" />
            
            <div className="relative rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(180deg, rgba(15,5,25,0.95) 0%, rgba(10,3,20,0.98) 100%)' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-fuchsia-900/10" />
              <div className="relative p-6 md:p-8 border border-purple-500/10">
                <div className="space-y-5">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Team Details</h3>
                      <p className="text-gray-500 text-xs">Verify your team information</p>
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
                    className="w-full py-3.5 rounded-xl text-sm font-bold text-white relative overflow-hidden group"
                    style={{ background: 'linear-gradient(135deg, #9333ea 0%, #c026d3 50%, #7c3aed 100%)' }}>
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Users className="w-4 h-4" />
                      Fetch Team Players
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </motion.button>

                  {players.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 pt-6 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-400" />
                        <h3 className="text-base font-bold text-white">Select Players</h3>
                      </div>

                      <div className="space-y-2">
                        {players.map((playerName, index) => (
                          <motion.div
                            key={playerName}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-3 p-3 rounded-xl border border-purple-500/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer"
                            onClick={() => togglePlayer(playerName)}>
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                              selected.includes(playerName) 
                                ? 'bg-purple-600 border-purple-600' 
                                : 'border-gray-600 hover:border-purple-500'
                            }`}>
                              {selected.includes(playerName) && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-white text-sm">{playerName}</span>
                          </motion.div>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-900/20 to-fuchsia-900/20 border border-purple-500/20">
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Total Persons</p>
                          <p className="text-2xl font-black text-purple-400">{totalPersons}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Total Amount</p>
                          <p className="text-2xl font-black text-fuchsia-400">₹{totalAmount}</p>
                        </div>
                      </div>

                      {totalAmount > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4 pt-6 border-t border-white/5">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                              <CreditCard className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white">Payment</h3>
                              <p className="text-gray-500 text-xs">Complete accommodation booking</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="rounded-2xl p-4 text-center" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(251,146,60,0.05) 100%)', border: '1px solid rgba(245,158,11,0.2)' }}>
                              <div className="flex items-center justify-center gap-1.5 mb-3">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                <span className="text-xs font-semibold text-amber-400">Scan QR Code</span>
                              </div>
                              <div className="w-36 h-36 mx-auto bg-white rounded-xl overflow-hidden mb-3 shadow-lg">
                                <img src={siteContent.registration?.accommodationQrCode || "/acco.jpeg"} alt="Accommodation QR Code" className="w-full h-full object-contain" 
                                  onError={(e) => { e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZiIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5RUjwvdGV4dD48L3N2Zz4='; }} />
                              </div>
                              <p className="text-3xl font-black text-amber-400">₹{totalAmount}</p>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <label className="text-xs text-gray-400 font-medium mb-1.5 flex items-center gap-1.5">
                                  <CreditCard className="w-3 h-3 text-purple-400" /> UTR Number *
                                </label>
                                <input
                                  type="text"
                                  placeholder="Enter UTR number"
                                  className={inputClass()}
                                  value={utr}
                                  onChange={(e) => setUtr(e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-400 font-medium mb-1.5 flex items-center gap-1.5">
                                  <Upload className="w-3 h-3 text-purple-400" /> Payment Screenshot *
                                </label>
                                <input
                                  type="file"
                                  accept="image/jpeg,image/jpg,image/png"
                                  onChange={handleFileChange}
                                  className={fileInputClass}
                                />
                                {file && <p className="text-emerald-400 text-xs mt-1 flex items-center gap-1"><Check className="w-3 h-3" />{file.name}</p>}
                                <p className="text-gray-500 text-xs mt-1">Only PNG and JPEG formats are allowed (Max 5MB)</p>
                              </div>
                            </div>
                          </div>

                          <motion.button
                            onClick={submitAccommodation}
                            disabled={loading}
                            whileHover={{ scale: 1.01, y: -1 }}
                            whileTap={{ scale: 0.99 }}
                            className="w-full py-3.5 rounded-xl text-sm font-bold text-white relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ background: 'linear-gradient(135deg, #9333ea 0%, #c026d3 50%, #7c3aed 100%)' }}>
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              {loading ? (
                                <>
                                  <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4" />
                                  Submit Accommodation
                                </>
                              )}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                          </motion.button>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
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
    </section>
  );
};

export default AccommodationForm;
