import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from "../supabaseClient";
import { ArrowLeft, Users, DollarSign, CreditCard, Check, X, XCircle, Eye, Download } from 'lucide-react';

const AdminAccommodation = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayersModal, setSelectedPlayersModal] = useState({ show: false, players: [] });
  const navigate = useNavigate();

  // Function to get public URL for accommodation payment screenshots
  const getPaymentScreenshotUrl = async (screenshotPath) => {
    if (!screenshotPath) return null;
    
    try {
      const { data } = supabase.storage
        .from('accommodation-payments')
        .getPublicUrl(screenshotPath);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error getting screenshot URL:', error);
      return null;
    }
  };

  const fetchData = async () => {
    try {
      console.log('🔍 Fetching accommodation requests...');
      
      // First check if table exists and get count
      const { count, error: countError } = await supabase
        .from('accommodation_requests')
        .select('*', { count: 'exact', head: true });
      
      console.log('📊 Accommodation requests count:', { count, countError });
      
      // Now fetch actual data
      const { data, error } = await supabase
        .from("accommodation_requests")
        .select("*")
        .order("created_at", { ascending: false });

      console.log('📥 Raw accommodation data:', { data, error });
      console.log('📈 Data length:', data?.length || 0);
      
      if (data && data.length > 0) {
        console.log('📋 First accommodation request:', data[0]);
        data.forEach((req, index) => {
          console.log(`📋 Request ${index + 1}:`, {
            id: req.id,
            team_name: req.team_name,
            college_name: req.college_name,
            sport: req.sport,
            captain_name: req.captain_name,
            total_persons: req.total_persons,
            total_amount: req.total_amount,
            utr_number: req.utr_number,
            status: req.status,
            created_at: req.created_at
          });
        });
      }

      setData(data || []);
    } catch (error) {
      console.error('💥 Error in fetchData:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      console.log(`🔄 Updating request ${id} to status: ${status}`);
      
      const { error } = await supabase
        .from("accommodation_requests")
        .update({ status })
        .eq("id", id);

      if (error) {
        console.error('❌ Update error:', error);
        alert(`Failed to update status: ${error.message}`);
        return;
      }

      console.log(`✅ Successfully updated request ${id} to ${status}`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('💥 Update error:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/admin/dashboard')}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </motion.button>
              <div>
                <h1 className="text-3xl font-bold text-white">Accommodation Requests</h1>
                <p className="text-gray-400 mt-1">Manage team accommodation bookings</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  console.log('🔍 Manual debug trigger');
                  fetchData();
                }}
                className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-colors"
              >
                Debug Refresh
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchData}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Refresh Data
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-white text-xl">Loading accommodation requests...</div>
          </div>
        ) : data.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/50 p-12 text-center"
          >
            <div className="text-gray-400 text-lg">No accommodation requests found</div>
            <p className="text-gray-500 text-sm mt-2">Teams will appear here when they submit accommodation forms</p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/50 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-700/50">
              <h2 className="text-xl font-bold text-white">Accommodation Bookings</h2>
              <p className="text-gray-400 mt-1">Review and manage accommodation requests</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Team</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">College</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Sport</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Captain</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Selected Players</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Persons</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">UTR</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Screenshot</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {data.map((row, index) => (
                    <motion.tr 
                      key={row.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white">{row.team_name}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {row.college_name}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300">
                          {row.sport}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {row.captain_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {row.selected_players && row.selected_players.length > 0 ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedPlayersModal({ show: true, players: row.selected_players })}
                            className="px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/40 transition-colors flex items-center gap-2"
                          >
                            <Users className="w-4 h-4" />
                            <span>View {row.selected_players.length} Players</span>
                          </motion.button>
                        ) : (
                          <div className="text-gray-500 text-sm">No players selected</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          {row.total_persons}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 font-semibold">₹{row.total_amount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          {row.utr_number}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {row.payment_screenshot_url ? (
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={async () => {
                                const screenshotUrl = await getPaymentScreenshotUrl(row.payment_screenshot_url);
                                if (screenshotUrl) {
                                  window.open(screenshotUrl, '_blank');
                                }
                              }}
                              className="p-1.5 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/40 transition-colors"
                              title="View Payment Screenshot"
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            <span className="text-xs text-gray-400">View</span>
                          </div>
                        ) : (
                          <div className="text-gray-500 text-sm">No screenshot</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {row.status === 'approved' ? (
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-400 flex items-center gap-1 w-fit">
                            <Check className="w-3 h-3" />
                            Approved
                          </span>
                        ) : row.status === 'rejected' ? (
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-400 flex items-center gap-1 w-fit">
                            <XCircle className="w-3 h-3" />
                            Rejected
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-400">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {row.status !== 'approved' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => updateStatus(row.id, "approved")}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              Approve
                            </motion.button>
                          )}
                          {row.status !== 'rejected' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => updateStatus(row.id, "rejected")}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              Reject
                            </motion.button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      {/* Selected Players Modal */}
      <AnimatePresence>
        {selectedPlayersModal.show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setSelectedPlayersModal({ show: false, players: [] })}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 border border-gray-700 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Selected Players for Accommodation</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedPlayersModal({ show: false, players: [] })}
                  className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {selectedPlayersModal.players.length > 0 ? (
                  <div className="space-y-3">
                    {selectedPlayersModal.players.map((player, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg border border-gray-600/50"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{player}</p>
                          <p className="text-gray-400 text-sm">Player {index + 1}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No players selected for accommodation</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminAccommodation;
