import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import {
  X, User, Phone, GraduationCap, FileText, Eye, Trash2, Check, XCircle,
  Trophy, Users, Building2, Calendar, TrendingUp, Activity, Shield,
  LayoutDashboard, Settings, Search, Filter, Home, LogOut, RefreshCw,
  SlidersHorizontal, Layers, FileEdit, ExternalLink, CreditCard, ChevronRight, CheckCircle2,
  DollarSign, PieChart, Landmark, Plus
} from 'lucide-react';
import SiteContentManager from '../components/SiteContentManager';

export default function AdminDashboard() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Data States
  const [teams, setTeams] = useState([]);
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [adminRecord, setAdminRecord] = useState(null);

  // Site Content States
  const [siteContent, setSiteContent] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [contentLoading, setContentLoading] = useState(true);



  // Filters & Search
  const [regSearch, setRegSearch] = useState('');
  const [regSportFilter, setRegSportFilter] = useState('All');
  const [regStatusFilter, setRegStatusFilter] = useState('All');

  const [accSearch, setAccSearch] = useState('');
  const [accSportFilter, setAccSportFilter] = useState('All');
  const [accStatusFilter, setAccStatusFilter] = useState('All');

  // Interactive Overlays
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [viewTeamMode, setViewTeamMode] = useState(false);
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState(null);
  const [selectedPlayersModal, setSelectedPlayersModal] = useState({ show: false, players: [] });
  const [lightboxUrl, setLightboxUrl] = useState(null);

  // Custom Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // Custom Confirmation Dialog Modal State
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: 'Confirm Action',
    message: '',
    onConfirm: null
  });
  const triggerConfirm = (message, onConfirm, title = 'Confirm Action') => {
    setConfirmModal({
      show: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, show: false }));
      }
    });
  };

  // Unified Payment Approval Overlay State
  const [paymentApprovalState, setPaymentApprovalState] = useState({
    show: false,
    type: 'team', // 'team' or 'accommodation'
    id: null,
    name: null,
    totalAmount: 0,
    paymentMethod: 'UPI',
    cashAmount: 0,
    upiAmount: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    fetchAllData();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/admin/login');
      return;
    }
    setUser(user);
    const { data: profile } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profile) {
      await supabase.auth.signOut();
      navigate('/admin/login');
    } else {
      setAdminRecord(profile);
      if (profile.role === 'super_admin') {
        navigate('/admin/super-dashboard');
      }
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchTeams(),
      fetchAccommodations(),
      fetchSiteContentData()
    ]);
    setLoading(false);
  };

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      setTeams([]);
    }
  };

  const fetchAccommodations = async () => {
    try {
      const { data, error } = await supabase
        .from('accommodation_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccommodations(data || []);
    } catch (error) {
      console.error('Error fetching accommodations:', error);
      setAccommodations([]);
    }
  };

  const fetchSiteContentData = async () => {
    setContentLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .eq('id', 'active')
        .single();
      if (data) {
        setSiteContent(data.preview_mode ? data.draft_content : data.published_content);
        setPreviewMode(data.preview_mode);
      }
    } catch (err) {
      console.error("Failed to load site content from Supabase:", err);
    } finally {
      setContentLoading(false);
    }
  };

  // Helper to get registration fee dynamically
  const getTeamFee = (team) => {
    const sportItem = siteContent?.registration?.sports?.find(s => s.name === team.sport);
    if (sportItem) return Number(sportItem.fee || 0);

    // Fallback static map
    const defaultFees = {
      "Volleyball": 3000,
      "Kho-Kho (Boys)": 3000,
      "Kho-Kho (Girls)": 3000,
      "Kabaddi (Boys)": 3000,
      "Kabaddi (Girls)": 3000,
      "Badminton (Boys)": 2000,
      "Badminton (Girls)": 1500,
      "Chess": 1500,
      "Cricket": 2800
    };
    return defaultFees[team.sport] || 0;
  };

  // Actions
  const handleRefresh = () => {
    fetchAllData();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  // Open Payment Verification Modal
  const openApproveModal = (type, item) => {
    const total = type === 'team' ? getTeamFee(item) : item.total_amount;
    setPaymentApprovalState({
      show: true,
      type,
      id: item.id,
      name: type === 'team' ? item.team_name : item.team_name,
      totalAmount: total,
      paymentMethod: 'UPI',
      cashAmount: 0,
      upiAmount: total
    });
  };

  // Confirm Payment & Approve Status in Supabase
  const handleConfirmApproval = async () => {
    const { type, id, name, paymentMethod, cashAmount, upiAmount } = paymentApprovalState;
    try {
      if (type === 'team') {
        const { error } = await supabase
          .from('registrations')
          .update({
            registration_status: 'Approved',
            payment_method: paymentMethod,
            cash_amount: cashAmount,
            upi_amount: upiAmount,
            payment_status: 'Paid'
          })
          .eq('id', id);

        if (error) throw error;
        setTeams(teams.map(t => t.id === id ? {
          ...t,
          registration_status: 'Approved',
          payment_method: paymentMethod,
          cash_amount: cashAmount,
          upi_amount: upiAmount,
          payment_status: 'Paid'
        } : t));
        showToast(`Team "${name}" approved successfully!`, 'success');
      } else {
        const { error } = await supabase
          .from('accommodation_requests')
          .update({
            status: 'approved',
            payment_method: paymentMethod,
            cash_amount: cashAmount,
            upi_amount: upiAmount
          })
          .eq('id', id);

        if (error) throw error;
        setAccommodations(accommodations.map(a => a.id === id ? {
          ...a,
          status: 'approved',
          payment_method: paymentMethod,
          cash_amount: cashAmount,
          upi_amount: upiAmount
        } : a));
        showToast(`Accommodation booking for team "${name}" approved!`, 'success');
      }
      setPaymentApprovalState({ ...paymentApprovalState, show: false });
    } catch (err) {
      console.error(err);
      showToast(`Failed to complete approval. Error: ${err.message || err.details || JSON.stringify(err)}`, 'error');
    }
  };

  const handleRejectTeam = (teamId, teamName) => {
    triggerConfirm(
      `Are you sure you want to mark "${teamName}" as not registered?`,
      async () => {
        try {
          const { error } = await supabase
            .from('registrations')
            .update({ registration_status: 'Rejected' })
            .eq('id', teamId);

          if (error) throw error;
          setTeams(teams.map(t => t.id === teamId ? { ...t, registration_status: 'Rejected' } : t));
          showToast(`Team "${teamName}" marked as rejected.`, 'success');
        } catch (error) {
          console.error(error);
          showToast('Failed to update status.', 'error');
        }
      },
      'Reject Team'
    );
  };

  const handleDeleteTeam = (teamId, teamName) => {
    triggerConfirm(
      `Are you sure you want to delete the team "${teamName}"? This action cannot be undone.`,
      async () => {
        try {
          const { error } = await supabase
            .from('registrations')
            .delete()
            .eq('id', teamId);

          if (error) throw error;
          setTeams(teams.filter(t => t.id !== teamId));
          showToast(`Team "${teamName}" deleted.`, 'success');
        } catch (error) {
          console.error(error);
          showToast('Failed to delete team.', 'error');
        }
      },
      'Delete Team'
    );
  };

  const handleUpdateAccStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('accommodation_requests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      setAccommodations(accommodations.map(a => a.id === id ? { ...a, status } : a));
      showToast(`Accommodation request updated to ${status}.`, 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to update accommodation status.', 'error');
    }
  };

  const handleDeleteAccommodation = (id, teamName) => {
    triggerConfirm(
      `Are you sure you want to delete the accommodation request for team "${teamName}"? This action cannot be undone.`,
      async () => {
        try {
          const { error } = await supabase
            .from('accommodation_requests')
            .delete()
            .eq('id', id);

          if (error) throw error;
          setAccommodations(accommodations.filter(a => a.id !== id));
          showToast(`Accommodation request deleted successfully.`, 'success');
        } catch (error) {
          console.error(error);
          showToast('Failed to delete request.', 'error');
        }
      },
      'Delete Accommodation'
    );
  };

  const fetchPaymentScreenshot = async (collegeName, sport) => {
    try {
      const { data: files, error } = await supabase.storage
        .from('captain-docs')
        .list();

      if (error || !files) return null;

      const college = collegeName?.toLowerCase().replace(/\s+/g, '_') || '';
      const sportLower = sport?.toLowerCase().replace(/\s+/g, '_') || '';

      const paymentFile = files.find(file =>
        file.name.includes(`${college}_${sportLower}_payment`) ||
        file.name.includes('_payment_')
      );

      if (paymentFile) {
        const { data: { publicUrl } } = supabase.storage
          .from('captain-docs')
          .getPublicUrl(paymentFile.name);
        return publicUrl;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  const getAccScreenshotUrl = (screenshotPath) => {
    if (!screenshotPath) return null;
    const { data } = supabase.storage
      .from('accommodation-payments')
      .getPublicUrl(screenshotPath);
    return data?.publicUrl;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // Filter calculations
  const filteredTeams = teams.filter(t => {
    const matchesSearch =
      (t.team_name || '').toLowerCase().includes(regSearch.toLowerCase()) ||
      (t.college_name || '').toLowerCase().includes(regSearch.toLowerCase()) ||
      (t.captain_name || '').toLowerCase().includes(regSearch.toLowerCase());
    const matchesSport = regSportFilter === 'All' || t.sport === regSportFilter;
    const matchesStatus = regStatusFilter === 'All' || t.registration_status === regStatusFilter;
    return matchesSearch && matchesSport && matchesStatus;
  });

  const filteredAccommodations = accommodations.filter(a => {
    const matchesSearch =
      (a.team_name || '').toLowerCase().includes(accSearch.toLowerCase()) ||
      (a.college_name || '').toLowerCase().includes(accSearch.toLowerCase()) ||
      (a.captain_name || '').toLowerCase().includes(accSearch.toLowerCase());
    const matchesSport = accSportFilter === 'All' || a.sport === accSportFilter;
    const matchesStatus = accStatusFilter === 'All' ||
      (accStatusFilter === 'Approved' && a.status === 'approved') ||
      (accStatusFilter === 'Rejected' && a.status === 'rejected') ||
      (accStatusFilter === 'Pending' && a.status === 'pending');
    return matchesSearch && matchesSport && matchesStatus;
  });

  // Calculate Financial Bifurcations
  const treasury = (() => {
    let regTotal = 0;
    let regUpi = 0;
    let regCash = 0;

    let accTotal = 0;
    let accUpi = 0;
    let accCash = 0;

    // 1. Registrations
    teams.forEach(t => {
      if (t.registration_status === 'Approved') {
        const fee = getTeamFee(t);
        const cash = Number(t.cash_amount || 0);
        regTotal += fee;

        if (t.payment_method === 'Mixed') {
          regCash += cash;
          regUpi += Math.max(0, fee - cash);
        } else if (t.payment_method === 'Cash') {
          regCash += fee;
        } else {
          regUpi += fee; // Default is fully UPI/Online
        }
      }
    });

    // 2. Accommodations
    accommodations.forEach(a => {
      if (a.status === 'approved') {
        const fee = Number(a.total_amount || 0);
        const cash = Number(a.cash_amount || 0);
        accTotal += fee;

        if (a.payment_method === 'Mixed') {
          accCash += cash;
          accUpi += Math.max(0, fee - cash);
        } else if (a.payment_method === 'Cash') {
          accCash += fee;
        } else {
          accUpi += fee; // Default is fully UPI/Online
        }
      }
    });

    return {
      regTotal, regUpi, regCash,
      accTotal, accUpi, accCash,
      grandTotal: regTotal + accTotal,
      grandUpi: regUpi + accUpi,
      grandCash: regCash + accCash
    };
  })();

  const stats = {
    totalTeams: teams.length,
    approvedTeams: teams.filter(t => t.registration_status === 'Approved').length,
    pendingTeams: teams.filter(t => !t.registration_status || t.registration_status === 'Pending').length,
    totalPlayers: teams.reduce((total, team) => total + (team.players?.length || 0) + 1, 0),
    totalAccRequests: accommodations.length,
    pendingAccRequests: accommodations.filter(a => a.status === 'pending').length,
    uniqueSports: new Set(teams.map(t => t.sport)).size
  };

  const allSports = Array.from(new Set([...teams.map(t => t.sport), ...accommodations.map(a => a.sport)].filter(Boolean)));

  if (loading && teams.length === 0) {
    return (
      <div className="min-h-screen bg-[#05050c] flex flex-col items-center justify-center">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          <Trophy className="w-6 h-6 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="text-gray-400 font-medium tracking-wide">Loading Daksha Console...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05050c] text-white flex overflow-hidden font-body">

      {/* ================= SIDEBAR NAVIGATION ================= */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-screen bg-black/40 backdrop-blur-2xl border-r border-white/[0.06] flex flex-col flex-shrink-0 z-30 relative overflow-hidden"
          >
            {/* Header Brand */}
            <div className="p-6 border-b border-white/[0.06] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-400/20 flex items-center justify-center shadow-lg shadow-purple-500/10">
                <Trophy className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-display font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-violet-300 to-fuchsia-300">
                  DAKSHA
                </h3>
                <p className="text-[9px] text-purple-400/70 font-semibold tracking-widest uppercase">Admin Console</p>
              </div>
            </div>

            {/* Nav Menu */}
            <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {[
                { id: 'overview', label: 'Overview', icon: LayoutDashboard, count: null },
                { id: 'registrations', label: 'Registrations', icon: Users, count: stats.pendingTeams },
                { id: 'accommodations', label: 'Hostel Bookings', icon: Home, count: stats.pendingAccRequests },
                { id: 'content', label: 'Content Studio', icon: FileEdit, count: null }
              ].map(item => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-sm font-semibold transition-all duration-300 ${active
                        ? 'bg-purple-600/15 border-purple-500/30 text-purple-300 shadow-lg shadow-purple-500/5'
                        : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/[0.02]'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${active ? 'text-purple-400' : 'text-gray-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.count > 0 && (
                      <span className="w-5 h-5 rounded-full bg-purple-500 text-white font-bold text-[10px] flex items-center justify-center animate-pulse">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Profile Footer */}
            <div className="p-4 border-t border-white/[0.06] bg-black/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-purple-500/15 rounded-lg flex items-center justify-center border border-purple-500/20">
                  <User className="w-4 h-4 text-purple-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Logged Admin</p>
                  <p className="text-sm font-semibold text-white truncate">{user?.email}</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout Session
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= MAIN CONTENT WRAPPER ================= */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Top frosted Navbar */}
        <header className="h-20 bg-black/20 backdrop-blur-md border-b border-white/[0.06] px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-xl text-gray-400 hover:text-white transition-all"
              title="Toggle Sidebar"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-white capitalize">{activeTab === 'overview' ? 'Dashboard Overview' : activeTab}</h2>
              <p className="text-xs text-gray-400">GCEK Daksha management system</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-purple-500/10 border border-purple-500/30"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Synchronize Data
            </motion.button>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-xl text-gray-400 hover:text-white transition-all"
              title="Open Website"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </header>

        {/* Dynamic Workspace Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">

          {/* ================= TAB 1: OVERVIEW DASHBOARD ================= */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 animate-fade-in"
            >
              {/* Premium Treasury Panel */}
              <div className="bg-white/[0.01] border border-white/[0.05] rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-transparent blur-3xl rounded-full" />

                <h3 className="text-xl font-display font-black text-white tracking-wide mb-6 flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-purple-400" />
                  Financial Treasury Console
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                  {/* Registrations Treasury */}
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
                      <p className="text-sm font-bold text-gray-300">Registration Treasury</p>
                      <Trophy className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-gray-500">Approved Total</span>
                        <span className="text-2xl font-black text-white font-mono">₹{treasury.regTotal}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">📱 Online (UPI)</span>
                        <span className="text-purple-300 font-semibold font-mono">₹{treasury.regUpi}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">💵 Hand Cash</span>
                        <span className="text-emerald-400 font-semibold font-mono">₹{treasury.regCash}</span>
                      </div>
                    </div>
                    {/* Visual bar */}
                    <div className="w-full bg-white/5 h-2 rounded-full mt-4 overflow-hidden flex">
                      <div className="bg-purple-500 h-full" style={{ width: `${(treasury.regUpi / (treasury.regTotal || 1)) * 100}%` }} />
                      <div className="bg-emerald-400 h-full" style={{ width: `${(treasury.regCash / (treasury.regTotal || 1)) * 100}%` }} />
                    </div>
                  </div>

                  {/* Accommodation Treasury */}
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
                      <p className="text-sm font-bold text-gray-300">Accommodation Treasury</p>
                      <Home className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-gray-500">Approved Total</span>
                        <span className="text-2xl font-black text-white font-mono">₹{treasury.accTotal}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">📱 Online (UPI)</span>
                        <span className="text-purple-300 font-semibold font-mono">₹{treasury.accUpi}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">💵 Hand Cash</span>
                        <span className="text-emerald-400 font-semibold font-mono">₹{treasury.accCash}</span>
                      </div>
                    </div>
                    {/* Visual bar */}
                    <div className="w-full bg-white/5 h-2 rounded-full mt-4 overflow-hidden flex">
                      <div className="bg-purple-500 h-full" style={{ width: `${(treasury.accUpi / (treasury.accTotal || 1)) * 100}%` }} />
                      <div className="bg-emerald-400 h-full" style={{ width: `${(treasury.accCash / (treasury.accTotal || 1)) * 100}%` }} />
                    </div>
                  </div>

                  {/* Grand Consolidated Treasury */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                    <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
                      <p className="text-sm font-bold text-purple-200">Consolidated Treasury</p>
                      <Landmark className="w-4 h-4 text-purple-400 animate-pulse" />
                    </div>
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-purple-300/80">Grand Combined</span>
                        <span className="text-3xl font-black text-white font-mono">₹{treasury.grandTotal}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">📱 Combined UPI</span>
                        <span className="text-purple-300 font-bold font-mono">₹{treasury.grandUpi}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">💵 Combined Cash</span>
                        <span className="text-emerald-400 font-bold font-mono">₹{treasury.grandCash}</span>
                      </div>
                    </div>
                    {/* Visual bar */}
                    <div className="w-full bg-white/10 h-2.5 rounded-full mt-4 overflow-hidden flex">
                      <div className="bg-purple-400 h-full" style={{ width: `${(treasury.grandUpi / (treasury.grandTotal || 1)) * 100}%` }} />
                      <div className="bg-emerald-400 h-full" style={{ width: `${(treasury.grandCash / (treasury.grandTotal || 1)) * 100}%` }} />
                    </div>
                  </div>

                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Registrations', value: stats.totalTeams, icon: Trophy, gradient: 'from-purple-500/20 to-indigo-500/20', color: 'text-purple-400' },
                  { label: 'Total Athletes', value: stats.totalPlayers, icon: Users, gradient: 'from-cyan-500/20 to-blue-500/20', color: 'text-cyan-400' },
                  { label: 'Active Sports', value: stats.uniqueSports, icon: Activity, gradient: 'from-green-500/20 to-emerald-500/20', color: 'text-green-400' },
                  { label: 'Accommodations Pending', value: stats.pendingAccRequests, icon: Home, gradient: 'from-amber-500/20 to-orange-500/20', color: 'text-amber-400' }
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={i}
                      whileHover={{ y: -4, scale: 1.02 }}
                      className={`bg-white/[0.01] backdrop-blur-md rounded-2xl p-6 border border-white/[0.05] relative overflow-hidden shadow-lg`}
                    >
                      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.gradient} blur-2xl opacity-40 rounded-full`} />
                      <div className="relative flex items-center justify-between">
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">{stat.label}</p>
                          <p className="text-3xl font-black text-white mt-3 font-display">{stat.value}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Status metrics progress and quick actions */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 bg-white/[0.01] border border-white/[0.05] rounded-3xl p-6 md:p-8 relative overflow-hidden">
                  <h3 className="text-lg font-bold text-white mb-6">Approval velocity</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-center">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">Approved Teams</p>
                      <p className="text-3xl font-black text-emerald-400 font-display">{stats.approvedTeams}</p>
                      <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${(stats.approvedTeams / (stats.totalTeams || 1)) * 100}%` }} />
                      </div>
                    </div>
                    <div className="p-4 bg-yellow-500/5 rounded-2xl border border-yellow-500/10 text-center">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">Pending Review</p>
                      <p className="text-3xl font-black text-yellow-400 font-display">{stats.pendingTeams}</p>
                      <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${(stats.pendingTeams / (stats.totalTeams || 1)) * 100}%` }} />
                      </div>
                    </div>
                    <div className="p-4 bg-red-500/5 rounded-2xl border border-red-500/10 text-center">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">Rejected Entries</p>
                      <p className="text-3xl font-black text-red-400 font-display">{teams.filter(t => t.registration_status === 'Rejected').length}</p>
                      <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-red-400 h-full rounded-full" style={{ width: `${(teams.filter(t => t.registration_status === 'Rejected').length / (stats.totalTeams || 1)) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick actions panel */}
                <div className="lg:col-span-4 bg-white/[0.01] border border-white/[0.05] rounded-3xl p-6 md:p-8 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Console Studio</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">Direct controls to toggle preview schemas, reset layouts or check pending registers.</p>
                  </div>
                  <div className="space-y-3 mt-6">
                    <button
                      onClick={() => setActiveTab('registrations')}
                      className="w-full flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.05] hover:border-purple-500/30 hover:bg-purple-500/5 rounded-xl text-sm font-semibold transition-all group"
                    >
                      <span className="text-gray-300 group-hover:text-white">Review Team Registrations</span>
                      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400" />
                    </button>
                    <button
                      onClick={() => setActiveTab('accommodations')}
                      className="w-full flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.05] hover:border-purple-500/30 hover:bg-purple-500/5 rounded-xl text-sm font-semibold transition-all group"
                    >
                      <span className="text-gray-300 group-hover:text-white">Review Hostel Accommodations</span>
                      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400" />
                    </button>
                    <button
                      onClick={() => setActiveTab('content')}
                      className="w-full flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.05] hover:border-purple-500/30 hover:bg-purple-500/5 rounded-xl text-sm font-semibold transition-all group"
                    >
                      <span className="text-gray-300 group-hover:text-white">Update Homepage Dates & QR</span>
                      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= TAB 2: TEAM REGISTRATIONS ================= */}
          {activeTab === 'registrations' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Advanced Filter Toolbar */}
              <div className="bg-white/[0.01] border border-white/[0.05] p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative max-w-md w-full">
                  <Search className="w-4 h-4 text-gray-500 absolute top-1/2 left-4 -translate-y-1/2" />
                  <input
                    type="text"
                    value={regSearch}
                    onChange={(e) => setRegSearch(e.target.value)}
                    placeholder="Search teams, colleges or captain names..."
                    className="w-full pl-11 pr-4 py-3 bg-white/[0.02] border border-white/[0.06] rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/40 hover:border-white/10 transition-all text-white"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Sport Filter */}
                  <div className="relative">
                    <select
                      value={regSportFilter}
                      onChange={(e) => setRegSportFilter(e.target.value)}
                      className="px-4 py-3 pr-10 bg-white/[0.02] border border-white/[0.06] rounded-xl text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-purple-500/40 hover:border-white/10"
                    >
                      <option value="All" className="bg-[#0f0518]">All Sports</option>
                      {allSports.map(s => (
                        <option key={s} value={s} className="bg-[#0f0518]">{s}</option>
                      ))}
                    </select>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500 rotate-90 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Status Filter */}
                  <div className="relative">
                    <select
                      value={regStatusFilter}
                      onChange={(e) => setRegStatusFilter(e.target.value)}
                      className="px-4 py-3 pr-10 bg-white/[0.02] border border-white/[0.06] rounded-xl text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-purple-500/40 hover:border-white/10"
                    >
                      <option value="All" className="bg-[#0f0518]">All Statuses</option>
                      <option value="Pending" className="bg-[#0f0518]">Pending</option>
                      <option value="Approved" className="bg-[#0f0518]">Approved</option>
                      <option value="Rejected" className="bg-[#0f0518]">Rejected</option>
                    </select>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500 rotate-90 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Table Wrapper */}
              <div className="bg-white/[0.01] border border-white/[0.05] rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] border-collapse text-left">
                    <thead>
                      <tr className="bg-white/[0.02] border-b border-white/[0.06] text-xs font-semibold text-purple-300 uppercase tracking-wider">
                        <th className="px-6 py-4.5">Team & College</th>
                        <th className="px-6 py-4.5">Sport Category</th>
                        <th className="px-6 py-4.5">Captain Details</th>
                        <th className="px-6 py-4.5">Roster Count</th>
                        <th className="px-6 py-4.5">Registration Status</th>
                        <th className="px-6 py-4.5">Payment Method</th>
                        <th className="px-6 py-4.5">Registered On</th>
                        <th className="px-6 py-4.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {filteredTeams.map((team, idx) => {
                        const isApproved = team.registration_status === 'Approved';
                        const isRejected = team.registration_status === 'Rejected';
                        return (
                          <motion.tr
                            key={team.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.04 }}
                            className="hover:bg-white/[0.01] transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="font-bold text-white text-sm">{team.team_name}</div>
                              <div className="text-xs text-gray-400 mt-0.5">{team.college_name}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300">
                                {team.sport}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-semibold text-white">{team.captain_name}</div>
                              <div className="text-xs text-gray-500 mt-0.5">{team.captain_mobile}</div>
                            </td>
                            <td className="px-6 py-4 font-mono text-sm text-gray-300">
                              {(team.players?.length || 0) + 1} players
                            </td>
                            <td className="px-6 py-4">
                              {isApproved ? (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 w-fit">
                                  <Check className="w-3.5 h-3.5" /> Approved
                                </span>
                              ) : isRejected ? (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1.5 w-fit">
                                  <XCircle className="w-3.5 h-3.5" /> Rejected
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 flex items-center gap-1.5 w-fit">
                                  <Activity className="w-3.5 h-3.5 animate-pulse" /> Pending
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {isApproved ? (
                                <div className="text-xs font-semibold">
                                  {team.payment_method === 'Mixed' ? (
                                    <div className="space-y-0.5">
                                      <p className="text-purple-300">Mixed: UPI + Cash</p>
                                      <p className="text-[10px] text-gray-500 font-mono">UPI: ₹{team.upi_amount} | Cash: ₹{team.cash_amount}</p>
                                    </div>
                                  ) : team.payment_method === 'Cash' ? (
                                    <p className="text-emerald-400">💵 Fully Cash (₹{getTeamFee(team)})</p>
                                  ) : (
                                    <p className="text-purple-400">📱 Fully UPI (₹{getTeamFee(team)})</p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-600 font-semibold">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-400 font-mono">
                              {formatDate(team.created_at)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={async () => {
                                    let paymentUrl = team.payment_screenshot_url;
                                    if (!paymentUrl) {
                                      paymentUrl = await fetchPaymentScreenshot(team.college_name, team.sport);
                                    }
                                    setPaymentScreenshotUrl(paymentUrl);
                                    setSelectedTeam(team);
                                    setViewTeamMode(true);
                                  }}
                                  className="px-3 py-1.5 bg-purple-500/15 text-purple-300 border border-purple-500/20 rounded-lg hover:bg-purple-500/30 text-xs font-bold transition-all"
                                >
                                  View Details
                                </motion.button>

                                <div className="flex items-center gap-1 border-l border-white/[0.06] pl-2">
                                  {!isApproved && (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => openApproveModal('team', team)}
                                      className="p-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/30 rounded-lg"
                                      title="Approve Team"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </motion.button>
                                  )}
                                  {!isRejected && (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => handleRejectTeam(team.id, team.team_name)}
                                      className="p-1.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/30 rounded-lg"
                                      title="Reject Team"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </motion.button>
                                  )}
                                  {adminRecord?.role === 'super_admin' && (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => handleDeleteTeam(team.id, team.team_name)}
                                      className="p-1.5 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/30 rounded-lg"
                                      title="Delete Entry"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </motion.button>
                                  )}
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredTeams.length === 0 && (
                    <div className="text-center py-16 text-gray-500">
                      <Users className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                      <p className="text-sm">No team registrations match the filter parameters.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= TAB 3: ACCOMMODATION REQUESTS ================= */}
          {activeTab === 'accommodations' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Filters Toolbar */}
              <div className="bg-white/[0.01] border border-white/[0.05] p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative max-w-md w-full">
                  <Search className="w-4 h-4 text-gray-500 absolute top-1/2 left-4 -translate-y-1/2" />
                  <input
                    type="text"
                    value={accSearch}
                    onChange={(e) => setAccSearch(e.target.value)}
                    placeholder="Search by team, college or captain name..."
                    className="w-full pl-11 pr-4 py-3 bg-white/[0.02] border border-white/[0.06] rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/40 hover:border-white/10 transition-all text-white"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Sport Filter */}
                  <div className="relative">
                    <select
                      value={accSportFilter}
                      onChange={(e) => setAccSportFilter(e.target.value)}
                      className="px-4 py-3 pr-10 bg-white/[0.02] border border-white/[0.06] rounded-xl text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-purple-500/40 hover:border-white/10"
                    >
                      <option value="All" className="bg-[#0f0518]">All Sports</option>
                      {allSports.map(s => (
                        <option key={s} value={s} className="bg-[#0f0518]">{s}</option>
                      ))}
                    </select>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500 rotate-90 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Status Filter */}
                  <div className="relative">
                    <select
                      value={accStatusFilter}
                      onChange={(e) => setAccStatusFilter(e.target.value)}
                      className="px-4 py-3 pr-10 bg-white/[0.02] border border-white/[0.06] rounded-xl text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-purple-500/40 hover:border-white/10"
                    >
                      <option value="All" className="bg-[#0f0518]">All Bookings</option>
                      <option value="Pending" className="bg-[#0f0518]">Pending</option>
                      <option value="Approved" className="bg-[#0f0518]">Approved</option>
                      <option value="Rejected" className="bg-[#0f0518]">Rejected</option>
                    </select>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500 rotate-90 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Table Wrapper */}
              <div className="bg-white/[0.01] border border-white/[0.05] rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left font-sans">
                    <thead>
                      <tr className="bg-white/[0.02] border-b border-white/[0.06] text-xs font-semibold text-purple-300 uppercase tracking-wider">
                        <th className="px-6 py-4.5">Team</th>
                        <th className="px-6 py-4.5">College</th>
                        <th className="px-6 py-4.5">Sport</th>
                        <th className="px-6 py-4.5">Roster Count</th>
                        <th className="px-6 py-4.5">Sum Charge</th>
                        <th className="px-6 py-4.5">Payment Breakup</th>
                        <th className="px-6 py-4.5">UTR / Screenshot</th>
                        <th className="px-6 py-4.5">Status</th>
                        <th className="px-6 py-4.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {filteredAccommodations.map((row, idx) => {
                        const screenshotUrl = getAccScreenshotUrl(row.payment_screenshot_url);
                        const isApproved = row.status === 'approved';
                        const isRejected = row.status === 'rejected';
                        return (
                          <motion.tr
                            key={row.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.04 }}
                            className="hover:bg-white/[0.01] transition-colors"
                          >
                            <td className="px-6 py-4 font-bold text-white text-sm">
                              {row.team_name}
                              <div className="text-[10px] text-gray-500 font-normal mt-0.5">Cap: {row.captain_name}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-300">{row.college_name}</td>
                            <td className="px-6 py-4 text-xs text-gray-300">
                              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/15">
                                {row.sport}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedPlayersModal({ show: true, players: row.selected_players || [] })}
                                className="px-2.5 py-1.5 bg-blue-500/10 text-blue-300 border border-blue-500/15 hover:bg-blue-500/20 text-xs font-bold rounded-lg flex items-center gap-1.5"
                              >
                                <Users className="w-3.5 h-3.5" />
                                <span>{row.total_persons} Players</span>
                              </motion.button>
                            </td>
                            <td className="px-6 py-4 text-sm text-emerald-400 font-bold font-mono">
                              ₹{row.total_amount}
                            </td>
                            <td className="px-6 py-4 text-xs font-semibold">
                              {isApproved ? (
                                <div>
                                  {row.payment_method === 'Mixed' ? (
                                    <div className="space-y-0.5">
                                      <p className="text-purple-300">Mixed: UPI + Cash</p>
                                      <p className="text-[10px] text-gray-500 font-mono">UPI: ₹{row.upi_amount} | Cash: ₹{row.cash_amount}</p>
                                    </div>
                                  ) : row.payment_method === 'Cash' ? (
                                    <p className="text-emerald-400">💵 Fully Cash (₹{row.total_amount})</p>
                                  ) : (
                                    <p className="text-purple-400">📱 Fully UPI (₹{row.total_amount})</p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-600">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-300 font-mono">
                              <div className="flex items-center gap-2">
                                <span title="UTR number">{row.utr_number}</span>
                                {screenshotUrl && (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setLightboxUrl(screenshotUrl)}
                                    className="p-1 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-md hover:bg-purple-500/30"
                                    title="View screenshot attachment"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </motion.button>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {isApproved ? (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                                  <Check className="w-3 h-3" /> Approved
                                </span>
                              ) : isRejected ? (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1 w-fit">
                                  <XCircle className="w-3 h-3" /> Rejected
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 flex items-center gap-1 w-fit">
                                  <Activity className="w-3 h-3 animate-pulse" /> Pending
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                {!isApproved && (
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => openApproveModal('accommodation', row)}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
                                  >
                                    Approve
                                  </motion.button>
                                )}
                                {!isRejected && (
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleUpdateAccStatus(row.id, 'rejected')}
                                    className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 rounded-lg text-xs font-bold transition-all"
                                  >
                                    Reject
                                  </motion.button>
                                )}
                                {adminRecord?.role === 'super_admin' && (
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleDeleteAccommodation(row.id, row.team_name)}
                                    className="p-1.5 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/30 rounded-lg"
                                    title="Delete Accommodation Booking"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </motion.button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredAccommodations.length === 0 && (
                    <div className="text-center py-16 text-gray-500">
                      <Home className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                      <p className="text-sm">No accommodation requests match your filters.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= TAB 4: WEBSITE CONTENT STUDIO ================= */}
          {activeTab === 'content' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white/[0.01] border border-white/[0.05] rounded-3xl p-6 md:p-8 relative overflow-hidden">
                <h2 className="text-xl font-bold text-white mb-2">Content Manager Studio</h2>
                <p className="text-gray-400 mb-6 text-sm">Fine-tune critical front-end components like registration QR codes, whatsapp groups, dates, galleries, and coordinators.</p>
                {contentLoading ? (
                  <div className="text-purple-400 text-sm py-16 flex items-center gap-3 justify-center">
                    <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                    Connecting to Supabase Config Table...
                  </div>
                ) : siteContent ? (
                  <SiteContentManager
                    initialData={siteContent}
                    initialPreviewMode={previewMode}
                    onDraftSaved={(nextData, nextPreview) => {
                      setSiteContent(nextData);
                      setPreviewMode(nextPreview);
                    }}
                    onPublished={(nextData, nextPreview) => {
                      setSiteContent(nextData);
                      setPreviewMode(nextPreview);
                    }}
                  />
                ) : (
                  <div className="text-red-400 text-sm py-16 text-center">
                    Failed to fetch the dynamic configuration rows. Please inspect the Supabase console.
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </main>
      </div>

      {/* ================= PAYMENT APPROVAL MODAL OVERLAY ================= */}
      <AnimatePresence>
        {paymentApprovalState.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="bg-[#0a0a14] border border-white/[0.08] max-w-md w-full rounded-3xl shadow-2xl p-6 relative"
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-purple-400" /> Confirm Payment & Approve
                </h3>
                <button
                  onClick={() => setPaymentApprovalState({ ...paymentApprovalState, show: false })}
                  className="p-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Total Collection Amount</p>
                  <p className="text-3xl font-black text-purple-300 font-mono mt-1">₹{paymentApprovalState.totalAmount}</p>
                </div>

                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-2 block">Choose Payment Method *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'UPI', label: '📱 UPI / Online' },
                      { id: 'Cash', label: '💵 Full Cash' },
                      { id: 'Mixed', label: '🔀 Mixed' }
                    ].map(method => {
                      const active = paymentApprovalState.paymentMethod === method.id;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => {
                            const total = paymentApprovalState.totalAmount;
                            setPaymentApprovalState({
                              ...paymentApprovalState,
                              paymentMethod: method.id,
                              cashAmount: method.id === 'Cash' ? total : 0,
                              upiAmount: method.id === 'UPI' ? total : 0
                            });
                          }}
                          className={`py-3 rounded-xl border text-xs font-semibold transition-all ${active
                              ? 'bg-purple-600/15 border-purple-500/40 text-purple-300 font-bold'
                              : 'bg-white/[0.02] border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.05]'
                            }`}
                        >
                          {method.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mixed Breakdown Input */}
                {paymentApprovalState.paymentMethod === 'Mixed' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 pt-2"
                  >
                    <div>
                      <label className="text-xs text-gray-400 font-semibold mb-1 block">Cash Amount Received (₹) *</label>
                      <input
                        type="number"
                        min="0"
                        max={paymentApprovalState.totalAmount}
                        value={paymentApprovalState.cashAmount || ''}
                        onChange={(e) => {
                          const val = Math.min(paymentApprovalState.totalAmount, Math.max(0, Number(e.target.value || 0)));
                          setPaymentApprovalState({
                            ...paymentApprovalState,
                            cashAmount: val,
                            upiAmount: paymentApprovalState.totalAmount - val
                          });
                        }}
                        className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.06] focus:border-purple-500/50 rounded-xl text-sm font-mono text-white placeholder-gray-600 focus:outline-none"
                        placeholder="Enter cash portion..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 p-3.5 bg-black/40 border border-white/[0.04] rounded-xl text-xs font-mono">
                      <div>
                        <p className="text-gray-500 mb-0.5">💵 Received Cash</p>
                        <p className="text-sm font-bold text-emerald-400">₹{paymentApprovalState.cashAmount}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-0.5">📱 Remaining UPI</p>
                        <p className="text-sm font-bold text-purple-300">₹{paymentApprovalState.upiAmount}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirmApproval}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 border border-purple-500/30 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10"
                >
                  <CheckCircle2 className="w-4 h-4" /> Confirm & Mark Approved
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= STUNNING REGISTRATION DETAIL MODAL ================= */}
      <AnimatePresence>
        {viewTeamMode && selectedTeam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
            onClick={() => setViewTeamMode(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="bg-[#0a0a14] border border-white/[0.08] max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="sticky top-0 bg-[#0a0a14]/95 backdrop-blur-md px-8 py-6 border-b border-white/[0.06] flex justify-between items-center z-10">
                <div>
                  <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 uppercase tracking-wider">
                    {selectedTeam.sport}
                  </span>
                  <h2 className="text-2xl font-black text-white mt-2 leading-tight">{selectedTeam.team_name}</h2>
                  <p className="text-sm text-gray-400 mt-1">{selectedTeam.college_name}</p>
                </div>
                <button
                  onClick={() => setViewTeamMode(false)}
                  className="p-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal contents */}
              <div className="p-8 space-y-8">

                {/* Captain details */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-500/5 to-blue-500/5 border border-purple-500/10">
                  <h3 className="text-sm font-bold uppercase text-purple-400 tracking-wider mb-4 flex items-center gap-2">
                    <User className="w-4 h-4" /> Captain Profile
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-black/30 border border-white/[0.04] p-4 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Full Name</p>
                      <p className="text-sm font-bold text-white">{selectedTeam.captain_name}</p>
                    </div>
                    <div className="bg-black/30 border border-white/[0.04] p-4 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Mobile Number</p>
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        <Phone className="w-4 h-4 text-purple-400" /> {selectedTeam.captain_mobile}
                      </p>
                    </div>
                  </div>

                  {/* Captain documents */}
                  <div className="mt-6 space-y-3">
                    <p className="text-xs text-gray-400 font-semibold">Verification Documents</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Captain Aadhaar Card */}
                      <div className="bg-black/30 border border-white/[0.04] p-4 rounded-xl flex flex-col justify-between h-48">
                        <p className="text-xs text-gray-500">Aadhaar Card</p>
                        {selectedTeam.captain_aadhaar_url ? (
                          <div className="relative group rounded-lg overflow-hidden h-32 border border-white/[0.06] mt-2 bg-black/40">
                            <img src={selectedTeam.captain_aadhaar_url} alt="Aadhaar" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setLightboxUrl(selectedTeam.captain_aadhaar_url)} className="px-3 py-1.5 bg-white text-black font-bold text-xs rounded-lg flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" /> Expand
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="h-32 rounded-lg bg-white/[0.02] border border-dashed border-white/10 flex items-center justify-center text-xs text-gray-600 mt-2">
                            Not uploaded
                          </div>
                        )}
                      </div>

                      {/* Captain ID Card */}
                      <div className="bg-black/30 border border-white/[0.04] p-4 rounded-xl flex flex-col justify-between h-48">
                        <p className="text-xs text-gray-500">College ID Card</p>
                        {selectedTeam.captain_college_id_url ? (
                          <div className="relative group rounded-lg overflow-hidden h-32 border border-white/[0.06] mt-2 bg-black/40">
                            <img src={selectedTeam.captain_college_id_url} alt="College ID" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setLightboxUrl(selectedTeam.captain_college_id_url)} className="px-3 py-1.5 bg-white text-black font-bold text-xs rounded-lg flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" /> Expand
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="h-32 rounded-lg bg-white/[0.02] border border-dashed border-white/10 flex items-center justify-center text-xs text-gray-600 mt-2">
                            Not uploaded
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team roster */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase text-blue-400 tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4" /> Team Roster ({(selectedTeam.players?.length || 0) + 1} Total)
                  </h3>
                  {selectedTeam.players && selectedTeam.players.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedTeam.players.map((player, pIdx) => (
                        <div key={pIdx} className="p-4 bg-[#0d0d1a] border border-white/[0.04] rounded-xl flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-white flex items-center gap-2">
                              <User className="w-3.5 h-3.5 text-gray-500" /> {player.name || player}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-0.5">Player Member #{pIdx + 1}</p>
                          </div>

                          {/* Player Docs */}
                          <div className="flex gap-2">
                            {selectedTeam.players_docs?.filter(doc => doc.name === player.name).map((doc, docIdx) => (
                              <button
                                key={docIdx}
                                onClick={() => setLightboxUrl(doc.url)}
                                className="px-2 py-1.5 bg-white/[0.02] border border-white/[0.06] hover:bg-purple-500/20 hover:border-purple-500/30 text-[10px] font-bold rounded-lg transition-colors text-purple-300 flex items-center gap-1"
                              >
                                <FileText className="w-3 h-3" />
                                {doc.type === 'aadhaar' ? 'Aadhaar' : 'ID'}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">No additional players in the roster.</p>
                  )}
                </div>

                {/* Payment screenshot */}
                {paymentScreenshotUrl && (
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-yellow-500/5 to-amber-500/5 border border-yellow-500/10">
                    <h3 className="text-sm font-bold uppercase text-yellow-500 tracking-wider mb-4 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" /> Registration Payment Bill
                    </h3>
                    <div className="relative group rounded-xl overflow-hidden max-h-80 border border-white/[0.08] bg-black/50">
                      <img src={paymentScreenshotUrl} alt="Bill" className="w-full max-h-80 object-contain mx-auto" />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setLightboxUrl(paymentScreenshotUrl)} className="px-4 py-2 bg-white text-black font-bold text-sm rounded-lg flex items-center gap-1">
                          <Eye className="w-4 h-4" /> Expand Full Bill
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= SELECTED PLAYERS ACCOMMODATION LIST MODAL ================= */}
      <AnimatePresence>
        {selectedPlayersModal.show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedPlayersModal({ show: false, players: [] })}
          >
            <motion.div
              className="bg-[#0a0a14] border border-white/[0.08] rounded-3xl p-6 max-w-md w-full shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" /> Accommodation Bookings
                </h3>
                <button
                  onClick={() => setSelectedPlayersModal({ show: false, players: [] })}
                  className="p-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
                {selectedPlayersModal.players.map((player, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-purple-500/10">
                      <User className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{player}</p>
                      <p className="text-[10px] text-gray-500">Participant #{index + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= LIGHTBOX IMAGE VIEW OVERLAY ================= */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
            onClick={() => setLightboxUrl(null)}
          >
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              src={lightboxUrl}
              alt="High resolution view"
              className="max-h-[90vh] max-w-full object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= STUNNING CUSTOM CONFIRMATION DIALOG ================= */}
      <AnimatePresence>
        {confirmModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="bg-[#0a0a14] border border-white/[0.08] max-w-sm w-full rounded-3xl shadow-2xl p-6 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/5 to-transparent blur-2xl rounded-full" />

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-amber-400" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-white font-display">{confirmModal.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed px-2">{confirmModal.message}</p>
                </div>

                <div className="flex items-center gap-3 w-full pt-2">
                  <button
                    type="button"
                    onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                    className="flex-1 py-2.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmModal.onConfirm}
                    className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-amber-500/10"
                  >
                    Yes, Proceed
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= PREMIUM FLOATING TOAST NOTIFICATION ================= */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[120] max-w-sm w-full p-4 rounded-2xl bg-[#0a0a14] border border-white/[0.08] shadow-2xl flex items-center gap-3 overflow-hidden"
          >
            {toast.type === 'success' ? (
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-emerald-400" />
              </div>
            ) : toast.type === 'error' ? (
              <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-4 h-4 text-red-400" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Activity className="w-4 h-4 text-blue-400" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold font-display">{toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Failed' : 'Notification'}</p>
              <p className="text-xs font-semibold text-white truncate mt-0.5">{toast.message}</p>
            </div>

            <button
              onClick={() => setToast({ ...toast, show: false })}
              className="p-1 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] rounded-lg text-gray-500 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}