import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from "../supabaseClient";
import {
  X, User, Phone, Trophy, Users, Building2, CreditCard, Check, XCircle,
  Eye, LayoutDashboard, Home, FileEdit, LogOut, RefreshCw, SlidersHorizontal,
  ExternalLink, Search, Trash2, Landmark, CheckCircle2, Activity
} from 'lucide-react';

export default function AdminAccommodation() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [adminRecord, setAdminRecord] = useState(null);
  
  // Search and filters
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Interactivity Overlays
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
    fetchData();
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
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: list, error } = await supabase
        .from("accommodation_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setData(list || []);
    } catch (error) {
      console.error('Error fetching accommodation requests:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from("accommodation_requests")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      setData(data.map(item => item.id === id ? { ...item, status } : item));
      showToast(`Request updated successfully.`, 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to update status.', 'error');
    }
  };

  // Open Payment Verification Modal
  const openApproveModal = (item) => {
    const total = Number(item.total_amount || 0);
    setPaymentApprovalState({
      show: true,
      id: item.id,
      name: item.team_name,
      totalAmount: total,
      paymentMethod: 'UPI',
      cashAmount: 0,
      upiAmount: total
    });
  };

  // Confirm Payment & Approve Status in Supabase
  const handleConfirmApproval = async () => {
    const { id, name, paymentMethod, cashAmount, upiAmount } = paymentApprovalState;
    try {
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
      
      setData(data.map(a => a.id === id ? { 
        ...a, 
        status: 'approved',
        payment_method: paymentMethod,
        cash_amount: cashAmount,
        upi_amount: upiAmount
      } : a));
      
      showToast(`Accommodation booking for team "${name}" approved!`, 'success');
      setPaymentApprovalState({ ...paymentApprovalState, show: false });
    } catch (err) {
      console.error(err);
      showToast(`Failed to complete approval. Error: ${err.message || err.details || JSON.stringify(err)}`, 'error');
    }
  };

  // Delete Accommodation Request
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
          setData(data.filter(a => a.id !== id));
          showToast(`Accommodation request deleted successfully.`, 'success');
        } catch (error) {
          console.error(error);
          showToast('Failed to delete request.', 'error');
        }
      },
      'Delete Accommodation'
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const getPaymentScreenshotUrl = (screenshotPath) => {
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

  const filteredData = data.filter(a => {
    const matchesSearch = 
      (a.team_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.college_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.captain_name || '').toLowerCase().includes(search.toLowerCase());
    const matchesSport = sportFilter === 'All' || a.sport === sportFilter;
    const matchesStatus = statusFilter === 'All' || 
      (statusFilter === 'Approved' && a.status === 'approved') ||
      (statusFilter === 'Rejected' && a.status === 'rejected') ||
      (statusFilter === 'Pending' && a.status === 'pending');
    return matchesSearch && matchesSport && matchesStatus;
  });

  const allSports = Array.from(new Set(data.map(a => a.sport).filter(Boolean)));

  const pendingCount = data.filter(a => a.status === 'pending').length;

  if (loading && data.length === 0) {
    return (
      <div className="min-h-screen bg-[#05050c] flex flex-col items-center justify-center">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          <Home className="w-6 h-6 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="text-gray-400 font-medium tracking-wide">Loading Booking Records...</p>
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
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-transparent text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/[0.02] transition-all"
              >
                <LayoutDashboard className="w-4 h-4 text-gray-500" />
                <span>Overview</span>
              </button>
              
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-transparent text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/[0.02] transition-all"
              >
                <Users className="w-4 h-4 text-gray-500" />
                <span>Registrations</span>
              </button>

              <button
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border bg-purple-600/15 border-purple-500/30 text-purple-300 shadow-lg shadow-purple-500/5 text-sm font-semibold transition-all"
              >
                <div className="flex items-center gap-3">
                  <Home className="w-4 h-4 text-purple-400" />
                  <span>Hostel Bookings</span>
                </div>
                {pendingCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-purple-500 text-white font-bold text-[10px] flex items-center justify-center animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate('/admin/dashboard')}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border border-transparent text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/[0.02] transition-all"
              >
                <FileEdit className="w-4 h-4 text-gray-500" />
                <span>Content Studio</span>
              </button>
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
              <h2 className="text-lg font-bold text-white">Hostel Accommodations</h2>
              <p className="text-xs text-gray-400">Review and manage hostel requests</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchData}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-purple-500/10 border border-purple-500/30"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Sync Bookings
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
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          
          {/* Filters Toolbar */}
          <div className="bg-white/[0.01] border border-white/[0.05] p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="w-4 h-4 text-gray-500 absolute top-1/2 left-4 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by team, college or captain name..."
                className="w-full pl-11 pr-4 py-3 bg-white/[0.02] border border-white/[0.06] rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/40 hover:border-white/10 transition-all text-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Sport Filter */}
              <div className="relative">
                <select
                  value={sportFilter}
                  onChange={(e) => setSportFilter(e.target.value)}
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
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
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
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/[0.06] text-xs font-semibold text-purple-300 uppercase tracking-wider">
                    <th className="px-6 py-4.5">Team</th>
                    <th className="px-6 py-4.5">College</th>
                    <th className="px-6 py-4.5">Sport</th>
                    <th className="px-6 py-4.5">Roster Count</th>
                    <th className="px-6 py-4.5">Sum Charge</th>
                    <th className="px-6 py-4.5">UTR / Bill</th>
                    <th className="px-6 py-4.5">Screenshot</th>
                    <th className="px-6 py-4.5">Status</th>
                    <th className="px-6 py-4.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredData.map((row, idx) => {
                    const screenshotUrl = getPaymentScreenshotUrl(row.payment_screenshot_url);
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
                        <td className="px-6 py-4 text-xs text-gray-300 font-mono">
                          <div className="flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-gray-500" />
                            {row.utr_number}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {screenshotUrl ? (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setLightboxUrl(screenshotUrl)}
                              className="p-1.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-lg hover:bg-purple-500/30 flex items-center justify-center"
                              title="View Attachment"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </motion.button>
                          ) : (
                            <span className="text-xs text-gray-600">None</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {row.status === 'approved' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                              <Check className="w-3 h-3" /> Approved
                            </span>
                          ) : row.status === 'rejected' ? (
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
                            {row.status !== 'approved' && (
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => openApproveModal(row)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
                              >
                                Approve
                              </motion.button>
                            )}
                            {row.status !== 'rejected' && (
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => updateStatus(row.id, 'rejected')}
                                className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 rounded-lg text-xs font-bold transition-all"
                              >
                                Reject
                              </motion.button>
                            )}
                            {adminRecord?.role === 'super_admin' && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
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
              {filteredData.length === 0 && (
                <div className="text-center py-16 text-gray-500">
                  <Home className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                  <p className="text-sm">No accommodation requests match your filters.</p>
                </div>
              )}
            </div>
          </div>

        </main>
      </div>

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
              onClick={(e) => e.stopPropagation()}
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
                          className={`py-3 rounded-xl border text-xs font-semibold transition-all ${
                            active
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
