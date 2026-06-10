import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import {
  X, User, Phone, Trophy, Users, Building2, Calendar, Activity, Shield,
  LayoutDashboard, Search, Filter, Home, LogOut, RefreshCw, Menu,
  FileEdit, ExternalLink, CreditCard, ChevronRight, CheckCircle2,
  Trash2, Plus, AlertCircle, Eye, EyeOff, Key, FileText
} from 'lucide-react';

const parsePlayerString = (playerStr) => {
  if (!playerStr) return { name: '', status: '', sports: '' };
  const match = playerStr.match(/^([^(]+)\(([^)]+)\)$/);
  if (!match) {
    return { name: playerStr.trim(), status: '', sports: '' };
  }
  const name = match[1].trim();
  const rawDetails = match[2].trim();
  
  if (rawDetails.startsWith('Already Paid')) {
    const parts = rawDetails.split('-');
    const sports = parts[1] ? parts[1].trim() : '';
    return { name, status: 'Already Paid', sports };
  }
  
  return { name, status: rawDetails, sports: '' };
};

export default function SuperAdminDashboard() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState('admins'); // default tab is admins management
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Data States
  const [teams, setTeams] = useState([]);
  const [accommodations, setAccommodations] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [adminRecord, setAdminRecord] = useState(null);
  
  // Search & Filters
  const [regSearch, setRegSearch] = useState('');
  const [regSportFilter, setRegSportFilter] = useState('All');
  const [accSearch, setAccSearch] = useState('');
  const [accSportFilter, setAccSportFilter] = useState('All');

  // Modals & Overlays
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [selectedAdminForPassword, setSelectedAdminForPassword] = useState(null);
  const [selectedPlayersModal, setSelectedPlayersModal] = useState({ show: false, players: [] });
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [viewTeamMode, setViewTeamMode] = useState(false);
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState(null);
  const [revealedPasswords, setRevealedPasswords] = useState({}); // admin_id -> boolean

  // Form inputs
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [adminPasswordChangeText, setAdminPasswordChangeText] = useState('');

  // Toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // Confirmation
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

  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (adminRecord) {
      fetchData();
    }
  }, [adminRecord, activeTab]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/admin/login');
      return;
    }
    setUser(user);

    // Fetch profile to verify role
    const { data: profile } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profile) {
      await supabase.auth.signOut();
      navigate('/admin/login');
    } else if (profile.role !== 'super_admin') {
      navigate('/admin/dashboard'); // regular admins redirected to normal dashboard
    } else {
      setAdminRecord(profile);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    if (activeTab === 'admins') {
      await fetchAdmins();
    } else if (activeTab === 'registrations') {
      await fetchTeams();
    } else if (activeTab === 'accommodations') {
      await fetchAccommodations();
    }
    setLoading(false);
  };

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      setAdmins(data || []);
    } catch (error) {
      console.error(error);
      showToast('Failed to load admin list', 'error');
    }
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
      console.error(error);
      showToast('Failed to load teams registrations', 'error');
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
      console.error(error);
      showToast('Failed to load hostel requests', 'error');
    }
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

  // Admin management Handlers
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminPassword.trim() || !newAdminName.trim()) {
      showToast('Please fill all fields', 'error');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('create_admin_user', {
        admin_email: newAdminEmail.trim(),
        admin_password: newAdminPassword.trim(),
        admin_name: newAdminName.trim()
      });
      if (error) throw error;

      showToast(`Admin profile created for ${newAdminName}!`, 'success');
      setShowAddAdminModal(false);
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminName('');
      fetchAdmins();
    } catch (error) {
      console.error(error);
      showToast(`Creation failed: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!adminPasswordChangeText.trim()) {
      showToast('Password cannot be empty', 'error');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.rpc('update_admin_password_force', {
        target_user_id: selectedAdminForPassword.user_id,
        new_password: adminPasswordChangeText.trim()
      });
      if (error) throw error;

      showToast(`Password updated for ${selectedAdminForPassword.name}!`, 'success');
      setShowChangePasswordModal(false);
      setAdminPasswordChangeText('');
      setSelectedAdminForPassword(null);
      fetchAdmins();
    } catch (error) {
      console.error(error);
      showToast(`Password update failed: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = (targetUserId, targetName) => {
    triggerConfirm(
      `Are you sure you want to permanently delete admin "${targetName}"? They will lose access immediately.`,
      async () => {
        setLoading(true);
        try {
          const { error } = await supabase.rpc('delete_admin_user', {
            target_user_id: targetUserId
          });
          if (error) throw error;

          showToast(`Admin "${targetName}" deleted successfully`, 'success');
          fetchAdmins();
        } catch (error) {
          console.error(error);
          showToast(`Failed to delete admin: ${error.message}`, 'error');
        } finally {
          setLoading(false);
        }
      },
      'Delete Admin Account'
    );
  };

  // Deletions for data tables
  const handleDeleteTeam = (id, name) => {
    triggerConfirm(
      `Are you sure you want to permanently delete the team "${name}"? This will delete all member records and payment history.`,
      async () => {
        setLoading(true);
        try {
          const { error } = await supabase.from('registrations').delete().eq('id', id);
          if (error) throw error;

          showToast(`Team "${name}" deleted.`, 'success');
          fetchTeams();
        } catch (error) {
          console.error(error);
          showToast('Failed to delete team.', 'error');
        } finally {
          setLoading(false);
        }
      },
      'Delete Registration'
    );
  };

  const handleDeleteAccommodation = (id, teamName) => {
    triggerConfirm(
      `Are you sure you want to delete the accommodation request for team "${teamName}"? This cannot be undone.`,
      async () => {
        setLoading(true);
        try {
          const { error } = await supabase.from('accommodation_requests').delete().eq('id', id);
          if (error) throw error;

          showToast('Accommodation booking deleted.', 'success');
          fetchAccommodations();
        } catch (error) {
          console.error(error);
          showToast('Failed to delete request.', 'error');
        } finally {
          setLoading(false);
        }
      },
      'Delete Accommodation Booking'
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  // Helper formats
  const toggleShowPassword = (adminId) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [adminId]: !prev[adminId]
    }));
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
    return matchesSearch && matchesSport;
  });

  const filteredAccommodations = accommodations.filter(a => {
    const matchesSearch = 
      (a.team_name || '').toLowerCase().includes(accSearch.toLowerCase()) ||
      (a.college_name || '').toLowerCase().includes(accSearch.toLowerCase()) ||
      (a.captain_name || '').toLowerCase().includes(accSearch.toLowerCase());
    const matchesSport = accSportFilter === 'All' || a.sport === accSportFilter;
    return matchesSearch && matchesSport;
  });

  const getPaymentScreenshotUrl = (screenshotPath) => {
    if (!screenshotPath) return null;
    const { data } = supabase.storage
      .from('accommodation-payments')
      .getPublicUrl(screenshotPath);
    return data?.publicUrl;
  };

  const allSports = Array.from(new Set([...teams.map(t => t.sport), ...accommodations.map(a => a.sport)].filter(Boolean)));

  if (loading && admins.length === 0 && teams.length === 0 && accommodations.length === 0) {
    return (
      <div className="min-h-screen bg-[#04010a] flex flex-col items-center justify-center">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          <Shield className="w-6 h-6 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="text-gray-400 font-semibold tracking-wider text-xs uppercase animate-pulse">Loading Super Admin Terminal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#04010a] text-white flex overflow-hidden font-body relative">
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/10 via-transparent to-rose-900/5 pointer-events-none" />

      {/* ================= SIDEBAR — Desktop only ================= */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="hidden md:flex h-screen bg-black/40 backdrop-blur-2xl border-r border-white/[0.04] flex-col flex-shrink-0 z-30 overflow-hidden"
          >
            {/* Logo */}
            <div className="p-6 border-b border-white/[0.04] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-purple-500/20 border border-rose-400/20 flex items-center justify-center shadow-lg shadow-rose-500/10">
                <Shield className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-lg font-display font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-rose-300 via-purple-300 to-indigo-300">
                  DAKSHA
                </h3>
                <p className="text-[9px] text-rose-400/70 font-semibold tracking-widest uppercase">Super Admin</p>
              </div>
            </div>

            {/* Menu */}
            <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {[
                { id: 'admins', label: 'Admin Accounts', icon: Shield },
                { id: 'registrations', label: 'Registrations', icon: Users },
                { id: 'accommodations', label: 'Hostel Bookings', icon: Home }
              ].map(item => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl border text-sm font-bold transition-all duration-300 ${
                      active
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-300 shadow-lg shadow-rose-500/5'
                        : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/[0.02]'
                    }`}
                  >
                    <Icon className={`w-4.5 h-4.5 ${active ? 'text-rose-400' : 'text-gray-500'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Profile Footer */}
            <div className="p-4 border-t border-white/[0.04] bg-black/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-rose-500/10 rounded-lg flex items-center justify-center border border-rose-500/20">
                  <User className="w-4 h-4 text-rose-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Logged Super</p>
                  <p className="text-xs font-bold text-white truncate">{adminRecord?.name}</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="w-full py-2.5 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20 text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout Session
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= MAIN CONTAINER ================= */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Header */}
        <header className="bg-[#07040d]/90 backdrop-blur-md border-b border-white/[0.06] px-4 sm:px-6 flex items-center justify-between z-10 gap-2 h-16 md:h-20">
          {/* Left: Logo on mobile | Sidebar toggle on desktop */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Desktop sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex p-2.5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] rounded-xl text-gray-400 hover:text-white transition-all flex-shrink-0 items-center justify-center"
            >
              <Menu className="w-4 h-4 text-rose-400" />
            </button>
            {/* Mobile: DAKSHA logo */}
            <div className="flex items-center gap-2 md:hidden">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500/30 to-purple-500/20 border border-rose-400/25 flex items-center justify-center">
                <Shield className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-rose-300 to-purple-300">DAKSHA</h1>
                <p className="text-[8px] text-rose-400/60 font-semibold tracking-widest uppercase -mt-0.5">Super Admin</p>
              </div>
            </div>
            {/* Desktop page title */}
            <div className="hidden md:block min-w-0">
              <h2 className="text-base font-black tracking-wide uppercase text-white truncate">
                {activeTab === 'admins' ? 'Admin Management' : activeTab === 'registrations' ? 'Sports Registrations' : 'Accommodation Requests'}
              </h2>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Daksha Control Deck</p>
            </div>
          </div>

          {/* Right: Page title on mobile + Reload */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Mobile: current tab label */}
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider md:hidden">
              {activeTab === 'admins' ? 'Admins' : activeTab === 'registrations' ? 'Teams' : 'Hostel'}
            </span>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchData}
              className="p-2 sm:px-4 sm:py-2 bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-rose-500/10 border border-rose-500/30"
              title="Reload Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reload</span>
            </motion.button>
          </div>
        </header>

        {/* Console Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-28 md:pb-6 space-y-5">

          {/* ================= TAB 1: ADMINS MANAGEMENT ================= */}
          {activeTab === 'admins' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Toolbar */}
              <div className="bg-white/[0.01] border border-white/[0.04] p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Console Operators</h3>
                  <p className="text-gray-500 text-[11px] sm:text-xs mt-0.5">Below are the credentials of staff allowed to approve/reject entries.</p>
                </div>
                <button
                  onClick={() => setShowAddAdminModal(true)}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-700 hover:to-purple-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" /> Register Staff Profile
                </button>
              </div>

              {/* Grid Cards list */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {admins.map((adm) => {
                  const isRevealed = revealedPasswords[adm.user_id];
                  const selfAccount = adm.user_id === user?.id;
                  return (
                    <motion.div
                      key={adm.user_id}
                      whileHover={{ y: -3 }}
                      className="bg-white/[0.01] border border-white/[0.04] p-5 rounded-2xl flex flex-col justify-between space-y-5 shadow-lg relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-rose-500/5 to-transparent blur-xl rounded-full" />
                      
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-black text-sm">
                            {adm.name ? adm.name.substring(0, 2).toUpperCase() : 'AD'}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                              {adm.name}
                              {selfAccount && <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400">You</span>}
                            </h4>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">{adm.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2.5 pt-2 border-t border-white/[0.03]">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-500">Privileges:</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${adm.role === 'super_admin' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/15' : 'bg-blue-500/10 text-blue-400 border border-blue-500/15'}`}>
                            {adm.role === 'super_admin' ? '🛡️ Super Admin' : '👤 Regular Admin'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-500">Access Key:</span>
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="text-rose-300 font-bold">
                              {isRevealed ? (adm.password_plain || 'Not Recorded') : '••••••••'}
                            </span>
                            <button
                              onClick={() => toggleShowPassword(adm.user_id)}
                              className="text-gray-500 hover:text-white p-0.5"
                            >
                              {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => {
                            setSelectedAdminForPassword(adm);
                            setShowChangePasswordModal(true);
                          }}
                          className="flex-1 py-2 bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] rounded-xl text-xs font-bold text-gray-300 hover:text-white transition-all text-center flex items-center justify-center gap-1.5 min-h-[44px]"
                        >
                          <Key className="w-3 h-3 text-purple-400" /> Password
                        </button>
                        
                        {!selfAccount && (
                          <button
                            onClick={() => handleDeleteAdmin(adm.user_id, adm.name)}
                            className="py-2 px-3.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 transition-all flex items-center justify-center min-h-[44px]"
                            title="Delete Admin Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ================= TAB 2: REGISTRATIONS LIST ================= */}
          {activeTab === 'registrations' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Search Toolbar */}
              <div className="bg-white/[0.01] border border-white/[0.04] p-4 rounded-2xl flex flex-col gap-3">
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-gray-500 absolute top-1/2 left-4 -translate-y-1/2" />
                  <input
                    type="text"
                    value={regSearch}
                    onChange={(e) => setRegSearch(e.target.value)}
                    placeholder="Search teams, college, captain..."
                    className="w-full pl-11 pr-4 py-3 bg-white/[0.02] border border-white/[0.06] rounded-xl text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500/40 text-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                  <div className="relative flex-1">
                    <select
                      value={regSportFilter}
                      onChange={(e) => setRegSportFilter(e.target.value)}
                      className="w-full px-3 py-2.5 pr-9 bg-white/[0.02] border border-white/[0.06] rounded-xl text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-purple-500/40"
                    >
                      <option value="All" className="bg-[#0f0518]">All Sports</option>
                      {allSports.map(s => (
                        <option key={s} value={s} className="bg-[#0f0518]">{s}</option>
                      ))}
                    </select>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500 rotate-90 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono flex-shrink-0 bg-white/[0.03] px-2 py-1.5 rounded-lg border border-white/[0.04]">
                    {filteredTeams.length} results
                  </span>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white/[0.01] border border-white/[0.04] rounded-2xl overflow-hidden shadow-xl">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/[0.02] border-b border-white/[0.04] text-[10px] font-bold text-rose-300 uppercase tracking-widest">
                        <th className="px-6 py-4">Team Details</th>
                        <th className="px-6 py-4">College Name</th>
                        <th className="px-6 py-4">Selected Sport</th>
                        <th className="px-6 py-4 font-mono text-center">Regist. Status</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02] text-xs">
                      {filteredTeams.map((team) => (
                        <tr key={team.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-bold text-white text-sm">{team.team_name}</span>
                            <div className="text-[10px] text-gray-500 mt-0.5">Cap: {team.captain_name} ({team.captain_mobile})</div>
                          </td>
                          <td className="px-6 py-4 text-gray-300">{team.college_name}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/15 text-purple-300 font-semibold">
                              {team.sport}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              team.registration_status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'
                            }`}>
                              {team.registration_status || 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={async () => {
                                  let paymentUrl = team.payment_screenshot_url;
                                  if (!paymentUrl) {
                                    paymentUrl = await fetchPaymentScreenshot(team.college_name, team.sport);
                                  }
                                  setPaymentScreenshotUrl(paymentUrl);
                                  setSelectedTeam(team);
                                  setViewTeamMode(true);
                                }}
                                className="px-2.5 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 hover:text-purple-200 text-xs font-bold rounded-lg transition-all"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => handleDeleteTeam(team.id, team.team_name)}
                                className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg text-rose-400 transition-all"
                                title="Delete Registry Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card Layout - Registrations */}
                <div className="block md:hidden divide-y divide-white/[0.03]">
                  {filteredTeams.map((team, index) => (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="p-4 hover:bg-white/[0.01] transition-colors"
                    >
                      {/* Card Header */}
                      <div className="flex items-start gap-3 mb-3">
                        {/* Sport Color Dot */}
                        <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Trophy className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h4 className="text-sm font-black text-white leading-tight">{team.team_name}</h4>
                              <p className="text-[10px] text-gray-400 mt-0.5 truncate">{team.college_name}</p>
                            </div>
                            <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                              team.registration_status === 'Approved'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : team.registration_status === 'Rejected'
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                              {team.registration_status === 'Approved' ? '✓ Approved' : team.registration_status === 'Rejected' ? '✗ Rejected' : '⏳ Pending'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-2 mb-3 ml-12">
                        <div className="bg-white/[0.02] rounded-xl p-2.5 border border-white/[0.03]">
                          <p className="text-[8px] text-gray-600 uppercase tracking-wider font-bold mb-0.5">Sport</p>
                          <p className="text-[11px] font-bold text-purple-300">{team.sport || '—'}</p>
                        </div>
                        <div className="bg-white/[0.02] rounded-xl p-2.5 border border-white/[0.03]">
                          <p className="text-[8px] text-gray-600 uppercase tracking-wider font-bold mb-0.5">Captain</p>
                          <p className="text-[11px] font-bold text-gray-200 truncate">{team.captain_name || '—'}</p>
                        </div>
                        <div className="bg-white/[0.02] rounded-xl p-2.5 border border-white/[0.03] col-span-2">
                          <p className="text-[8px] text-gray-600 uppercase tracking-wider font-bold mb-0.5">Contact</p>
                          <p className="text-[11px] font-mono font-bold text-rose-300">{team.captain_mobile || '—'}</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 ml-12">
                        <button
                          onClick={async () => {
                            let paymentUrl = team.payment_screenshot_url;
                            if (!paymentUrl) {
                              paymentUrl = await fetchPaymentScreenshot(team.college_name, team.sport);
                            }
                            setPaymentScreenshotUrl(paymentUrl);
                            setSelectedTeam(team);
                            setViewTeamMode(true);
                          }}
                          className="flex-1 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 active:scale-[0.98] border border-purple-500/20 text-purple-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Details
                        </button>
                        <button
                          onClick={() => handleDeleteTeam(team.id, team.team_name)}
                          className="py-2.5 px-4 bg-rose-500/5 hover:bg-rose-500/15 active:scale-[0.98] border border-rose-500/15 rounded-xl text-rose-400 hover:text-rose-300 transition-all flex items-center justify-center gap-1.5"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {filteredTeams.length === 0 && (
                  <div className="text-center py-16 text-gray-500">
                    <Trophy className="w-12 h-12 mx-auto text-gray-700 mb-3" />
                    <p className="text-sm">No registration records match your filter.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ================= TAB 3: ACCOMMODATIONS LIST ================= */}
          {activeTab === 'accommodations' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Search Toolbar */}
              <div className="bg-white/[0.01] border border-white/[0.04] p-4 rounded-2xl flex flex-col gap-3">
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-gray-500 absolute top-1/2 left-4 -translate-y-1/2" />
                  <input
                    type="text"
                    value={accSearch}
                    onChange={(e) => setAccSearch(e.target.value)}
                    placeholder="Search by team, college, captain..."
                    className="w-full pl-11 pr-4 py-3 bg-white/[0.02] border border-white/[0.06] rounded-xl text-xs placeholder-gray-500 focus:outline-none focus:border-blue-500/40 text-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                  <div className="relative flex-1">
                    <select
                      value={accSportFilter}
                      onChange={(e) => setAccSportFilter(e.target.value)}
                      className="w-full px-3 py-2.5 pr-9 bg-white/[0.02] border border-white/[0.06] rounded-xl text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500/40"
                    >
                      <option value="All" className="bg-[#0f0518]">All Sports</option>
                      {allSports.map(s => (
                        <option key={s} value={s} className="bg-[#0f0518]">{s}</option>
                      ))}
                    </select>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500 rotate-90 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono flex-shrink-0 bg-white/[0.03] px-2 py-1.5 rounded-lg border border-white/[0.04]">
                    {filteredAccommodations.length} results
                  </span>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white/[0.01] border border-white/[0.04] rounded-2xl overflow-hidden shadow-xl">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/[0.02] border-b border-white/[0.04] text-[10px] font-bold text-rose-300 uppercase tracking-widest">
                        <th className="px-6 py-4">Request Team</th>
                        <th className="px-6 py-4">College Name</th>
                        <th className="px-6 py-4">Sport</th>
                        <th className="px-6 py-4">Roster Count</th>
                        <th className="px-6 py-4">UTR Number</th>
                        <th className="px-6 py-4 font-mono text-center">Status</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02] text-xs">
                      {filteredAccommodations.map((row) => {
                        const screenshotUrl = getPaymentScreenshotUrl(row.payment_screenshot_url);
                        return (
                          <tr key={row.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-bold text-white text-sm">{row.team_name}</span>
                              <div className="text-[10px] text-gray-500 mt-0.5">Cap: {row.captain_name}</div>
                            </td>
                            <td className="px-6 py-4 text-gray-300">{row.college_name}</td>
                            <td className="px-6 py-4 text-xs text-gray-300">
                              <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/15 font-bold">
                                {row.sport || '—'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => setSelectedPlayersModal({ show: true, players: row.selected_players || [] })}
                                className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-[10px] text-purple-300 font-bold rounded-lg flex items-center gap-1.5"
                              >
                                <Users className="w-3 h-3" /> {row.total_persons} Persons
                              </button>
                            </td>
                            <td className="px-6 py-4 font-mono font-bold text-rose-300">
                              <div className="flex items-center gap-1.5">
                                <CreditCard className="w-3.5 h-3.5 text-gray-600" />
                                {row.utr_number}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                                row.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'
                              }`}>
                                {row.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                {screenshotUrl && (
                                  <button
                                    onClick={() => setLightboxUrl(screenshotUrl)}
                                    className="p-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 rounded-lg text-purple-300"
                                    title="View Bill Screen"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteAccommodation(row.id, row.team_name)}
                                  className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg text-rose-400 transition-all"
                                  title="Delete Hostel Booking Record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card Layout - Accommodations */}
                <div className="block md:hidden divide-y divide-white/[0.03]">
                  {filteredAccommodations.map((row, index) => {
                    const screenshotUrl = getPaymentScreenshotUrl(row.payment_screenshot_url);
                    const isApproved = row.status === 'approved';
                    return (
                      <motion.div
                        key={row.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className="p-4 hover:bg-white/[0.01] transition-colors"
                      >
                        {/* Card Header */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isApproved ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-amber-500/10 border border-amber-500/20'
                          }`}>
                            <Home className={`w-4 h-4 ${isApproved ? 'text-emerald-400' : 'text-amber-400'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h4 className="text-sm font-black text-white leading-tight">{row.team_name}</h4>
                                <p className="text-[10px] text-gray-400 mt-0.5 truncate">{row.college_name}</p>
                              </div>
                              <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                isApproved
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              }`}>
                                {isApproved ? '✓ Approved' : '⏳ Pending'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-2 mb-3 ml-12">
                          <div className="bg-white/[0.02] rounded-xl p-2.5 border border-white/[0.03]">
                            <p className="text-[8px] text-gray-600 uppercase tracking-wider font-bold mb-0.5">Captain</p>
                            <p className="text-[11px] font-bold text-gray-200 truncate">{row.captain_name || '—'}</p>
                          </div>
                          <div className="bg-white/[0.02] rounded-xl p-2.5 border border-white/[0.03]">
                            <p className="text-[8px] text-gray-600 uppercase tracking-wider font-bold mb-0.5">Sport</p>
                            <span className="text-[11px] font-bold text-rose-300 truncate">{row.sport || '—'}</span>
                          </div>
                          <div className="bg-white/[0.02] rounded-xl p-2.5 border border-white/[0.03]">
                            <p className="text-[8px] text-gray-600 uppercase tracking-wider font-bold mb-0.5">Persons</p>
                            <button
                              onClick={() => setSelectedPlayersModal({ show: true, players: row.selected_players || [] })}
                              className="text-[11px] font-black text-blue-300 flex items-center gap-1 hover:text-blue-200 transition-colors"
                            >
                              <Users className="w-3 h-3" />
                              {row.total_persons} people
                            </button>
                          </div>
                          <div className="bg-white/[0.02] rounded-xl p-2.5 border border-white/[0.03]">
                            <p className="text-[8px] text-gray-600 uppercase tracking-wider font-bold mb-0.5">UTR / Transaction No.</p>
                            <p className="text-[11px] font-mono font-bold text-rose-300 flex items-center gap-1 truncate">
                              <CreditCard className="w-3 h-3 text-gray-500 flex-shrink-0" />
                              <span className="truncate">{row.utr_number || 'Not provided'}</span>
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 ml-12">
                          {screenshotUrl ? (
                            <button
                              onClick={() => setLightboxUrl(screenshotUrl)}
                              className="flex-1 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 active:scale-[0.98] border border-blue-500/20 text-blue-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" /> View Receipt
                            </button>
                          ) : (
                            <div className="flex-1 py-2.5 bg-white/[0.01] border border-white/[0.03] text-gray-600 text-[10px] rounded-xl flex items-center justify-center">
                              No Receipt
                            </div>
                          )}
                          <button
                            onClick={() => handleDeleteAccommodation(row.id, row.team_name)}
                            className="py-2.5 px-4 bg-rose-500/5 hover:bg-rose-500/15 active:scale-[0.98] border border-rose-500/15 rounded-xl text-rose-400 hover:text-rose-300 transition-all flex items-center justify-center"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {filteredAccommodations.length === 0 && (
                  <div className="text-center py-16 text-gray-500">
                    <Home className="w-12 h-12 mx-auto text-gray-700 mb-3" />
                    <p className="text-sm">No accommodation requests match your search.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </main>

        {/* ===== MOBILE BOTTOM NAVIGATION BAR ===== */}
        <nav className="fixed bottom-0 left-0 right-0 md:hidden z-40">
          {/* Blur + gradient background */}
          <div className="absolute inset-0 bg-[#07040d]/95 backdrop-blur-xl border-t border-white/[0.08]" />
          <div className="relative flex items-center justify-around px-2 py-1 safe-area-inset-bottom">
            {/* Admin tab */}
            <button
              onClick={() => setActiveTab('admins')}
              className={`flex flex-col items-center gap-0.5 px-4 py-2.5 rounded-2xl transition-all duration-200 min-w-[60px] ${
                activeTab === 'admins'
                  ? 'bg-rose-500/15 text-rose-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Shield className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'admins' ? 'scale-110' : ''}`} />
              <span className="text-[9px] font-bold tracking-wider uppercase">Admins</span>
              {activeTab === 'admins' && <span className="w-1 h-1 bg-rose-400 rounded-full" />}
            </button>

            {/* Registrations tab */}
            <button
              onClick={() => setActiveTab('registrations')}
              className={`flex flex-col items-center gap-0.5 px-4 py-2.5 rounded-2xl transition-all duration-200 min-w-[60px] ${
                activeTab === 'registrations'
                  ? 'bg-purple-500/15 text-purple-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Users className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'registrations' ? 'scale-110' : ''}`} />
              <span className="text-[9px] font-bold tracking-wider uppercase">Teams</span>
              {activeTab === 'registrations' && <span className="w-1 h-1 bg-purple-400 rounded-full" />}
            </button>

            {/* Hostel tab */}
            <button
              onClick={() => setActiveTab('accommodations')}
              className={`flex flex-col items-center gap-0.5 px-4 py-2.5 rounded-2xl transition-all duration-200 min-w-[60px] ${
                activeTab === 'accommodations'
                  ? 'bg-blue-500/15 text-blue-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Home className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'accommodations' ? 'scale-110' : ''}`} />
              <span className="text-[9px] font-bold tracking-wider uppercase">Hostel</span>
              {activeTab === 'accommodations' && <span className="w-1 h-1 bg-blue-400 rounded-full" />}
            </button>

            {/* Divider */}
            <div className="w-px h-8 bg-white/[0.06] mx-1" />

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-2xl transition-all duration-200 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 min-w-[52px]"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-[9px] font-bold tracking-wider uppercase">Exit</span>
            </button>
          </div>
        </nav>
      </div>

      {/* ================= REGISTER NEW ADMIN USER MODAL ================= */}
      <AnimatePresence>
        {showAddAdminModal && (
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
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-rose-400" /> Register New Admin
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  className="p-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.06] focus:border-rose-500/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none"
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.06] focus:border-rose-500/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none"
                    placeholder="e.g. rahul@daksha.com"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">Password *</label>
                  <input
                    type="text"
                    required
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.06] focus:border-rose-500/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none"
                    placeholder="At least 6 characters"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-750 hover:to-purple-750 border border-rose-500/30 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-500/10"
                >
                  Create Admin Profile
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= CHANGE PASSWORD MODAL OVERLAY ================= */}
      <AnimatePresence>
        {showChangePasswordModal && (
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
              className="bg-[#0a0a14] border border-white/[0.08] max-w-sm w-full rounded-3xl shadow-2xl p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-rose-400" /> Change Password
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePasswordModal(false);
                    setSelectedAdminForPassword(null);
                  }}
                  className="p-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="bg-white/[0.02] border border-white/[0.04] p-3.5 rounded-xl text-xs">
                  <p className="text-gray-500">Updating credentials for:</p>
                  <p className="text-white font-bold mt-1 text-sm">{selectedAdminForPassword?.name}</p>
                  <p className="text-rose-400 font-semibold font-mono mt-0.5">{selectedAdminForPassword?.email}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-semibold mb-1 block">New Password *</label>
                  <input
                    type="text"
                    required
                    value={adminPasswordChangeText}
                    onChange={(e) => setAdminPasswordChangeText(e.target.value)}
                    className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.06] focus:border-rose-500/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none"
                    placeholder="Enter new password"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-750 hover:to-purple-750 border border-rose-500/30 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  Update Password
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= ROSTER PLAYERS MODAL ================= */}
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
                  <Users className="w-5 h-5 text-rose-400" /> Accommodation Bookings
                </h3>
                <button
                  onClick={() => setSelectedPlayersModal({ show: false, players: [] })}
                  className="p-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
                {selectedPlayersModal.players.map((playerStr, index) => {
                  const { name, status, sports } = parsePlayerString(playerStr);
                  return (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:bg-white/[0.04] transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500/20 to-purple-500/20 flex items-center justify-center border border-rose-500/10">
                          <User className="w-4 h-4 text-rose-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{name}</p>
                          <p className="text-[10px] text-gray-500">Participant #{index + 1}</p>
                          {status === 'Already Paid' && sports && (
                            <p className="text-[10px] text-rose-400 font-semibold mt-0.5">
                              🎒 Registered in: {sports}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-end">
                        {status === 'Already Paid' ? (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            ✓ Already Paid
                          </span>
                        ) : status === 'Cash' ? (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            💵 Cash
                          </span>
                        ) : status === 'UPI' ? (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-purple-500/20 text-purple-400 border border-purple-500/30">
                            📱 UPI
                          </span>
                        ) : status ? (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            {status}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
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
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-500/5 to-transparent blur-2xl rounded-full" />
              
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-rose-400" />
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
                    className="flex-1 py-2.5 bg-rose-650 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-rose-500/10"
                  >
                    Yes, Proceed
                  </button>
                </div>
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
                <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-500/5 to-rose-500/5 border border-purple-500/10">
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
                  <h3 className="text-sm font-bold uppercase text-rose-450 tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 animate-pulse" /> Team Roster ({(selectedTeam.players?.length || 0) + 1} Total)
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
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
            ) : toast.type === 'error' ? (
              <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-4 h-4 text-rose-400" />
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
