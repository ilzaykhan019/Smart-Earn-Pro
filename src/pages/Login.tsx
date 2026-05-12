import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Wallet } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
      if (err.message?.includes('auth/configuration-not-found') || err.message?.includes('auth/operation-not-allowed')) {
          setError('Email/Password provider is not enabled. Please enable it in the Firebase Console under Authentication > Sign-in method.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login with Google');
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address first to reset password.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage('Password reset email sent. Please check your inbox.');
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 w-full">
      <div className="max-w-md w-full space-y-8 bg-white/5 backdrop-blur-md p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="text-center relative z-10">
          <div className="bg-indigo-500/20 text-indigo-400 p-4 rounded-2xl inline-block mb-4 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
            <Wallet size={32} />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to access your investment dashboard.
          </p>
        </div>
        
        <div className="relative z-10">
          {error && (
            <div className="bg-rose-500/10 text-rose-300 p-4 rounded-xl text-sm border border-rose-500/20 font-medium mb-6">{error}</div>
          )}
          {resetMessage && (
            <div className="bg-emerald-500/10 text-emerald-300 p-4 rounded-xl text-sm border border-emerald-500/20 font-medium mb-6">{resetMessage}</div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">Email Address</label>
              <input
                type="email"
                required
                className="block w-full px-4 py-3 bg-black/20 border border-white/10 text-white rounded-xl focus:outline-none focus:border-indigo-500/50 sm:text-sm"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wide">Password</label>
                <button type="button" onClick={handleResetPassword} className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">Forgot password?</button>
              </div>
              <input
                type="password"
                required
                className="block w-full px-4 py-3 bg-black/20 border border-white/10 text-white rounded-xl focus:outline-none focus:border-indigo-500/50 sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 mt-4"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-[#0a0a0a] text-slate-500 text-xs uppercase tracking-widest rounded-full border border-white/5">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex justify-center py-3 px-4 border border-white/10 rounded-xl bg-white/5 text-sm font-bold text-white hover:bg-white/10 transition-all"
              >
                <img className="h-5 w-5 mr-3" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
                Google
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-slate-400 mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
