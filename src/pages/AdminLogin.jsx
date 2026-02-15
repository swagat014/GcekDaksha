import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1️⃣ Sign in with Supabase
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (loginError || !loginData.user) {
        setError('Invalid credentials');
        return;
      }

      // 2️⃣ Check admins table
      const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', loginData.user.id)
        .maybeSingle();

      if (adminError || !admin) {
        await supabase.auth.signOut();
        setError('Access denied: Admins only');
        return;
      }

      // 3️⃣ Admin verified
      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
      setError('Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-xl w-full max-w-md">
        <h1 className="text-white text-2xl font-bold mb-6">Admin Login</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <label className="block text-gray-300 mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-3 mb-4 rounded bg-gray-700 text-white"
          required
        />

        <label className="block text-gray-300 mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full p-3 mb-4 rounded bg-gray-700 text-white"
          required
        />

        <button
          type="submit"
          className="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
