'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { signIn, getAuthErrorMessage } from '@/lib/authService';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      await signIn(email, password);
      router.push('/blog');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#29473d] flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center px-4 py-20 relative">
        {/* Background floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500 rounded-full filter blur-3xl"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-[#29473d] backdrop-blur-sm rounded-3xl border border-white/20 p-8 shadow-2xl shadow-white/20">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Sign In
              </h1>
              <p className="text-white/80">Sign in to manage your blog posts</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all"
                  placeholder="your@email.com"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all"
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>

              <div className="flex justify-end">
                <Link href="/auth/forgot-password" className="text-sm text-white hover:text-white/80 transition-colors font-semibold">
                  Forgot password?
                </Link>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-3 text-red-200 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-[#29473d] hover:bg-white/90 py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-white/80">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-white hover:text-white/80 transition-colors font-semibold">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

