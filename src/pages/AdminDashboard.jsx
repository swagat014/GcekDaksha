import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { X, User, Phone, GraduationCap, FileText, Eye, Trash2, Check, XCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    fetchTeams();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/admin/login');
    } else {
      setUser(user);
    }
  };

  const fetchTeams = async () => {
    try {
      console.log('🔍 Starting to fetch teams from registrations table...');
      
      // Test basic Supabase connection first
      console.log('🧪 Testing Supabase connection...');
      const { data: testUser, error: testError } = await supabase.auth.getUser();
      console.log('👤 Auth test result:', { user: testUser?.user?.email, error: testError });
      
      // Check what tables exist
      console.log('📋 Checking available tables...');
      const { data: tables, error: tablesError } = await supabase
        .from('registrations')
        .select('count()', { count: 'exact', head: true });
      console.log('📊 Tables check:', { tables, tablesError });
      
      // Try to get count first
      const { count, error: countError } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true });
      
      console.log('🔢 Registration count:', { count, countError });
      
      // Now fetch the actual data
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('📥 Raw fetch result:', { data, error });

      if (error) {
        console.error('❌ Supabase error:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details
        });
        throw error;
      }
      
      console.log('✅ Successfully fetched teams:', data);
      console.log('📈 Team count:', data?.length || 0);
      
      if (data && data.length > 0) {
        console.log('📋 First team details:', data[0]);
        // Log specific fields to verify data structure
        data.forEach((team, index) => {
          console.log(`📋 Team ${index + 1}:`, {
            id: team.id,
            team_name: team.team_name,
            sport: team.sport,
            college_name: team.college_name,
            captain_name: team.captain_name,
            created_at: team.created_at
          });
        });
      }
      
      setTeams(data || []);
    } catch (error) {
      console.error('💥 Error in fetchTeams function:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      // Show error in UI
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  // Add manual refresh button for testing
  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    setLoading(true);
    fetchTeams();
  };

  const handleDelete = async (teamId, teamName) => {
    if (!window.confirm(`Are you sure you want to delete the team "${teamName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', teamId);

      if (error) throw error;

      // Update local state to remove the deleted team
      setTeams(teams.filter(team => team.id !== teamId));
      
      alert(`Team "${teamName}" has been deleted successfully.`);
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Failed to delete team. Please try again.');
    }
  };

  // Function to fetch payment screenshot from storage bucket
  const fetchPaymentScreenshot = async (collegeName, sport) => {
    try {
      console.log('🔍 Searching for payment with college:', collegeName, 'sport:', sport);
      
      // First try to find by listing files in captain-docs bucket
      const { data: files, error } = await supabase.storage
        .from('captain-docs')
        .list();

      if (error) {
        console.error('❌ Error listing files:', error.message);
        alert('Cannot access storage bucket. Please check permissions.');
        return null;
      } 
      
      if (!files || files.length === 0) {
        console.log('⚠️ No files found in captain-docs bucket');
        return null;
      }

      console.log('📸 All files in captain-docs:', files?.map(f => f.name));

      // Find payment file matching the team (college_sport_payment_...)
      const college = collegeName?.toLowerCase().replace(/\s+/g, '_') || '';
      const sportLower = sport?.toLowerCase().replace(/\s+/g, '_') || '';
      
      console.log('🔍 Looking for pattern:', `${college}_${sportLower}_payment`);
      
      const paymentFile = files?.find(file => 
        file.name.includes(`${college}_${sportLower}_payment`) ||
        file.name.includes('_payment_')
      );

      if (paymentFile) {
        const { data: { publicUrl } } = supabase.storage
          .from('captain-docs')
          .getPublicUrl(paymentFile.name);
        console.log('✅ Found payment file:', paymentFile.name);
        return publicUrl;
      }

      console.log('⚠️ No matching payment file found');
      return null;
    } catch (err) {
      console.error('❌ Error fetching payment screenshot:', err);
      return null;
    }
  };

  const handleApprove = async (teamId, teamName) => {
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ registration_status: 'Approved' })
        .eq('id', teamId);

      if (error) throw error;

      // Update local state
      setTeams(teams.map(team => 
        team.id === teamId ? { ...team, registration_status: 'Approved' } : team
      ));
      
      alert(`Team "${teamName}" has been approved!`);
    } catch (error) {
      console.error('Error approving team:', error);
      alert('Failed to approve team. Please try again.');
    }
  };

  const handleReject = async (teamId, teamName) => {
    if (!window.confirm(`Are you sure you want to mark "${teamName}" as not registered?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('registrations')
        .update({ registration_status: 'Rejected' })
        .eq('id', teamId);

      if (error) throw error;

      // Update local state
      setTeams(teams.map(team => 
        team.id === teamId ? { ...team, registration_status: 'Rejected' } : team
      ));
      
      alert(`Team "${teamName}" has been marked as not registered.`);
    } catch (error) {
      console.error('Error rejecting team:', error);
      alert('Failed to update team status. Please try again.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-400 mt-1">Manage registered teams and participants</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-300">Welcome, {user?.email}</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors mr-2"
              >
                Refresh Data
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50"
          >
            <h3 className="text-gray-400 text-sm uppercase tracking-wider">Total Teams</h3>
            <p className="text-3xl font-bold text-white mt-2">{teams.length}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50"
          >
            <h3 className="text-gray-400 text-sm uppercase tracking-wider">Sports</h3>
            <p className="text-3xl font-bold text-white mt-2">
              {new Set(teams.map(t => t.sport)).size}
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50"
          >
            <h3 className="text-gray-400 text-sm uppercase tracking-wider">Colleges</h3>
            <p className="text-3xl font-bold text-white mt-2">
              {new Set(teams.map(t => t.college_name)).size}
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-gray-700/50"
          >
            <h3 className="text-gray-400 text-sm uppercase tracking-wider">Players</h3>
            <p className="text-3xl font-bold text-white mt-2">
              {teams.reduce((total, team) => total + (team.players?.length || 0) + 1, 0)}
            </p>
          </motion.div>
        </div>

        {/* Teams List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/50 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-700/50">
            <h2 className="text-xl font-bold text-white">Registered Teams</h2>
            <p className="text-gray-400 mt-1">Manage and view all team registrations</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Team</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Sport</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">College</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Captain</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Players</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Payment</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Registered</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {teams.map((team, index) => (
                  <motion.tr 
                    key={team.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{team.team_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300">
                        {team.sport}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {team.college_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {team.captain_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {(team.players?.length || 0) + 1} {/* +1 for captain */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* Status with tick and cross buttons */}
                      {team.registration_status === 'Approved' ? (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-400 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Approved
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleReject(team.id, team.team_name)}
                            className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40 transition-colors"
                            title="Mark as Not Registered"
                          >
                            <XCircle className="w-4 h-4" />
                          </motion.button>
                        </div>
                      ) : team.registration_status === 'Rejected' ? (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-400 flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            Rejected
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleApprove(team.id, team.team_name)}
                            className="p-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/40 transition-colors"
                            title="Mark as Registered"
                          >
                            <Check className="w-4 h-4" />
                          </motion.button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-400">
                            Pending
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleApprove(team.id, team.team_name)}
                            className="p-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/40 transition-colors"
                            title="Approve Registration"
                          >
                            <Check className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleReject(team.id, team.team_name)}
                            className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40 transition-colors"
                            title="Reject Registration"
                          >
                            <XCircle className="w-4 h-4" />
                          </motion.button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {team.payment_status === 'Paid' || team.payment_screenshot_url ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-400 flex items-center gap-1 w-fit">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Paid
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-400">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {formatDate(team.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={async () => {
                          console.log('📋 Selected Team Data:', JSON.stringify(team, null, 2));
                          console.log('📋 All keys in team:', Object.keys(team));
                          console.log('📋 Captain Aadhaar URL:', team.captain_aadhaar_url);
                          console.log('📋 Captain College ID URL:', team.captain_college_id_url);
                          console.log('📋 Players Docs:', team.players_docs);
                          console.log('📋 Players:', team.players);
                          console.log('📋 College:', team.college_name);
                          console.log('📋 Sport:', team.sport);
                          
                          // Try to fetch payment screenshot from storage if not in database
                          let paymentUrl = team.payment_screenshot_url;
                          if (!paymentUrl) {
                            console.log('📸 Fetching payment screenshot from storage...');
                            paymentUrl = await fetchPaymentScreenshot(team.college_name, team.sport);
                            console.log('📸 Fetched payment URL from storage:', paymentUrl);
                            if (!paymentUrl) {
                              console.log('📸 Payment screenshot not found in storage');
                            }
                          }
                          setPaymentScreenshotUrl(paymentUrl);
                          
                          setSelectedTeam(team);
                          setViewMode(true);
                        }}
                        className="px-3 py-1 bg-accent-blue/20 text-accent-blue rounded-lg hover:bg-accent-blue/30 transition-colors mr-2"
                      >
                        View
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(team.id, team.team_name)}
                        className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        Delete
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            
            {teams.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-lg">No teams registered yet</p>
                <p className="text-gray-500 text-sm mt-2">Registrations will appear here once teams start signing up</p>
                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg max-w-md mx-auto">
                  <p className="text-yellow-300 text-sm font-medium">💡 Debug Info:</p>
                  <p className="text-yellow-400 text-xs mt-1">Check browser console (F12) for detailed logs</p>
                  <p className="text-yellow-400 text-xs mt-1">Look for messages starting with 🔍, 📊, 📥, or ❌</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Team Details Modal */}
      <AnimatePresence>
        {viewMode && selectedTeam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setViewMode(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800/95 backdrop-blur-xl rounded-2xl border border-gray-700/50 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gray-800/95 backdrop-blur-xl p-6 border-b border-gray-700/50 flex justify-between items-center rounded-t-2xl">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedTeam.team_name}</h2>
                  <p className="text-gray-400 mt-1">{selectedTeam.sport} - {selectedTeam.college_name}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setViewMode(false)}
                  className="p-2 bg-gray-700/50 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Debug Info - Remove in production */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-xs">
                  <p className="text-yellow-400 font-semibold mb-2">Debug Info:</p>
                  <p className="text-gray-400">captain_aadhaar_url: <span className={selectedTeam.captain_aadhaar_url ? 'text-green-400' : 'text-red-400'}>{selectedTeam.captain_aadhaar_url || 'NOT FOUND'}</span></p>
                  <p className="text-gray-400">captain_college_id_url: <span className={selectedTeam.captain_college_id_url ? 'text-green-400' : 'text-red-400'}>{selectedTeam.captain_college_id_url || 'NOT FOUND'}</span></p>
                  <p className="text-gray-400">payment_screenshot_url: <span className={selectedTeam.payment_screenshot_url ? 'text-green-400' : 'text-red-400'}>{selectedTeam.payment_screenshot_url || 'NOT FOUND'}</span></p>
                  <p className="text-gray-400">Fetched payment URL: <span className={paymentScreenshotUrl ? 'text-green-400' : 'text-yellow-400'}>{paymentScreenshotUrl || 'Not fetched yet'}</span></p>
                  <p className="text-gray-400">All keys: {Object.keys(selectedTeam).filter(k => k.includes('payment') || k.includes('screenshot')).join(', ') || 'none'}</p>
                  <p className="text-gray-400">payment_status: <span className={selectedTeam.payment_status === 'Paid' ? 'text-green-400' : 'text-red-400'}>{selectedTeam.payment_status || 'NOT SET'}</span></p>
                  <p className="text-gray-400">registration_status: <span className={selectedTeam.registration_status === 'Approved' ? 'text-green-400' : selectedTeam.registration_status === 'Rejected' ? 'text-red-400' : 'text-yellow-400'}>{selectedTeam.registration_status || 'NOT SET'}</span></p>
                  <p className="text-gray-400">players_docs: <span className={selectedTeam.players_docs?.length ? 'text-green-400' : 'text-red-400'}>{selectedTeam.players_docs?.length ? `Found (${selectedTeam.players_docs.length} items)` : 'NOT FOUND'}</span></p>
                  <p className="text-gray-400">players: <span className={selectedTeam.players?.length ? 'text-green-400' : 'text-red-400'}>{selectedTeam.players?.length ? `Found (${selectedTeam.players.length} players)` : 'NOT FOUND'}</span></p>
                  {selectedTeam.players && selectedTeam.players.length > 0 && (
                    <p className="text-gray-400 mt-2">Player names: {selectedTeam.players.map(p => p.name || 'Unnamed').join(', ')}</p>
                  )}
                </div>

                {/* Captain Details */}
                <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-5 border border-purple-500/20">
                  <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Captain Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                      <p className="text-gray-400 text-sm mb-1">Captain Name</p>
                      <p className="text-white font-medium">{selectedTeam.captain_name}</p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                      <p className="text-gray-400 text-sm mb-1 flex items-center gap-2">
                        <Phone className="w-4 h-4" /> Mobile
                      </p>
                      <p className="text-white font-medium">{selectedTeam.captain_mobile}</p>
                    </div>
                  </div>

                  {/* Captain Documents */}
                  <div className="mt-4">
                    <p className="text-gray-400 text-sm mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Captain Documents
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Captain Aadhaar */}
                      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                        <p className="text-gray-400 text-sm mb-2">Aadhaar Card</p>
                        {selectedTeam.captain_aadhaar_url ? (
                          <div className="relative group">
                            <img
                              src={selectedTeam.captain_aadhaar_url}
                              alt="Captain Aadhaar"
                              className="w-full h-40 object-cover rounded-lg border border-gray-600"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-end justify-center pb-2">
                              <a
                                href={selectedTeam.captain_aadhaar_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-white/20 text-white text-xs rounded-lg backdrop-blur-sm hover:bg-white/30"
                              >
                                View Full
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-40 bg-gray-700/50 rounded-lg flex items-center justify-center text-gray-500">
                            No Aadhaar uploaded
                          </div>
                        )}
                      </div>

                      {/* Captain College ID */}
                      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                        <p className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                          <GraduationCap className="w-4 h-4" /> College ID Card
                        </p>
                        {selectedTeam.captain_college_id_url ? (
                          <div className="relative group">
                            <img
                              src={selectedTeam.captain_college_id_url}
                              alt="Captain College ID"
                              className="w-full h-40 object-cover rounded-lg border border-gray-600"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-end justify-center pb-2">
                              <a
                                href={selectedTeam.captain_college_id_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-white/20 text-white text-xs rounded-lg backdrop-blur-sm hover:bg-white/30"
                              >
                                View Full
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-40 bg-gray-700/50 rounded-lg flex items-center justify-center text-gray-500">
                            No College ID uploaded
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Screenshot */}
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-5 border border-yellow-500/20">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Payment Screenshot
                  </h3>
                  
                  {selectedTeam.payment_screenshot_url ? (
                    <div className="relative group">
                      <img
                        src={selectedTeam.payment_screenshot_url}
                        alt="Payment Screenshot"
                        className="w-full max-h-64 object-contain rounded-lg border border-gray-600 bg-gray-900/50"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-end justify-center pb-2">
                        <a
                          href={selectedTeam.payment_screenshot_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-white/20 text-white text-xs rounded-lg backdrop-blur-sm hover:bg-white/30"
                        >
                          View Full
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-400 text-sm mb-3">
                        Payment screenshot URL not saved in database.
                      </p>
                      <p className="text-gray-500 text-xs">
                        This team registered before payment tracking was added. The screenshot is stored in Supabase but URL was not saved.
                      </p>
                    </div>
                  )}
                </div>

                {/* Team Members */}
                <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-xl p-5 border border-blue-500/20">
                  <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Team Members ({selectedTeam.players?.length || 0} + Captain)
                  </h3>
                  
                  {selectedTeam.players && selectedTeam.players.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {selectedTeam.players.map((player, index) => (
                        <div 
                          key={index}
                          className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50 hover:border-blue-500/30 transition-colors"
                          style={{
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          {/* Dark green gradient from top */}
                          <div 
                            className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-600 via-emerald-500 to-green-600"
                          />
                          
                          <div className="flex flex-col md:flex-row md:items-start gap-4">
                            {/* Player Info */}
                            <div className="flex-1">
                              <p className="text-white font-semibold flex items-center gap-2">
                                <User className="w-4 h-4 text-blue-400" />
                                {player.name || `Player ${index + 1}`}
                              </p>
                              <p className="text-gray-400 text-sm mt-1">Member #{index + 1}</p>
                            </div>

                            {/* Player Documents */}
                            <div className="grid grid-cols-2 gap-3 flex-1">
                              {/* Aadhaar */}
                              <div>
                                <p className="text-gray-400 text-xs mb-2 flex items-center gap-1">
                                  <FileText className="w-3 h-3" /> Aadhaar Card
                                </p>
                                {(() => {
                                  const playerAadhaar = selectedTeam.players_docs?.find(
                                    doc => doc.type === 'aadhaar' && doc.name === player.name
                                  );
                                  return playerAadhaar ? (
                                    <div className="relative group">
                                      <img
                                        src={playerAadhaar.url}
                                        alt={`${player.name} Aadhaar`}
                                        className="w-full h-24 object-cover rounded-lg border border-gray-600"
                                      />
                                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                        <a
                                          href={playerAadhaar.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="px-2 py-1 bg-white/20 text-white text-xs rounded"
                                        >
                                          View
                                        </a>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-full h-24 bg-gray-700/50 rounded-lg flex items-center justify-center text-gray-500 text-xs">
                                      Not uploaded
                                    </div>
                                  );
                                })()}
                              </div>

                              {/* College ID */}
                              <div>
                                <p className="text-gray-400 text-xs mb-2 flex items-center gap-1">
                                  <GraduationCap className="w-3 h-3" /> College ID
                                </p>
                                {(() => {
                                  const playerIdCard = selectedTeam.players_docs?.find(
                                    doc => doc.type === 'id_card' && doc.name === player.name
                                  );
                                  return playerIdCard ? (
                                    <div className="relative group">
                                      <img
                                        src={playerIdCard.url}
                                        alt={`${player.name} College ID`}
                                        className="w-full h-24 object-cover rounded-lg border border-gray-600"
                                      />
                                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                        <a
                                          href={playerIdCard.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="px-2 py-1 bg-white/20 text-white text-xs rounded"
                                        >
                                          View
                                        </a>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-full h-24 bg-gray-700/50 rounded-lg flex items-center justify-center text-gray-500 text-xs">
                                      Not uploaded
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No team members registered
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-800/95 backdrop-blur-xl p-4 border-t border-gray-700/50 flex justify-end gap-3 rounded-b-2xl">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setViewMode(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}