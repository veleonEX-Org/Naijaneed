'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Lock, Mail } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/api/admin/auth/login', formData);
      localStorage.setItem('nn_admin_token', data.token);
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
        <div className="p-10">
          <div className="flex flex-col items-center mb-10">
            <Image 
              src="/images/logo.png" 
              alt="NaijaNeed" 
              width={200} 
              height={60} 
              className="h-12 w-auto object-contain mb-2"
              priority
            />
            <p className="text-gray-500 dark:text-gray-400">Secure operator portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {error && (
              <div className="p-3 md:p-4 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-1.5 md:mb-2">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" size={20} />
                <input
                  name="email"
                  type="email"
                  placeholder="admin@naijaneed.ng"
                  className="w-full p-3 pl-10 md:p-4 md:pl-12 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5 md:mb-2">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" size={20} />
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full p-3 pl-10 md:p-4 md:pl-12 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 md:py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-lg shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 mt-4 active:scale-95"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>

        <div>
          <p className="text-xs text-gray-500 tracking-wider">Super Admin Email: admin@naijaneed.com</p>
          <p className="text-xs text-gray-500 tracking-wider">Super Admin Password: securepassword123</p>
          <p className="text-xs text-gray-500 tracking-wider">Super Admin Phone: 08000000000</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-6 text-center border-t dark:border-gray-700">
           <p className="text-xs text-gray-500 tracking-wider">SECURE ACCESS ONLY · v1.0 MVP</p>
        </div>
      </div>
    </div>
  );
}
