import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Wallet } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/utils';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    referralCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: formData.fullName });

      // Create user document
      try {
        await setDoc(doc(db, 'users', user.uid), {
             ownerId: user.uid,
             email: formData.email,
             fullName: formData.fullName,
             username: formData.username,
             phoneNumber: formData.phoneNumber,
             balance: 0,
             role: 'user',
             activePlanId: '',
             investmentAmount: 0,
             totalEarnings: 0,
             referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
             referredBy: formData.referralCode || '',
             hasInvested: false,
             tasksCompletedToday: 0,
             adsWatchedToday: 0,
             lastActiveDate: new Date().toISOString(),
             createdAt: Date.now(),
             updatedAt: Date.now(),
        });
      } catch (dbErr) {
          handleFirestoreError(dbErr, OperationType.CREATE, `users/${user.uid}`);
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to register');
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
      // Wait for auth context to create doc or handle here, relying on AuthContext is fine.
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to register with Google');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({...formData, [e.target.name]: e.target.value});
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 w-full">
      <div className="max-w-xl w-full space-y-8 bg-white/5 backdrop-blur-md p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden mb-8">
        <div className="text-center relative z-10">
          <div className="bg-indigo-500/20 text-indigo-400 p-4 rounded-2xl inline-block mb-4 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
            <Wallet size={32} />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Create an account</h2>
          <p className="mt-2 text-sm text-slate-400">
            Start earning daily profits with SmartEarn Pro.
          </p>
        </div>
        
        <div className="relative z-10">
          {error && (
            <div className="bg-rose-500/10 text-rose-300 p-4 rounded-xl text-sm border border-rose-500/20 font-medium mb-6">{error}</div>
          )}

          <form className="space-y-4" onSubmit={handleRegister}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">Full Name</label>
                  <input
                  type="text"
                  name="fullName"
                  required
                  className="block w-full px-4 py-3 bg-black/20 border border-white/10 text-white rounded-xl focus:outline-none focus:border-indigo-500/50 sm:text-sm"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">Username</label>
                  <input
                  type="text"
                  name="username"
                  required
                  className="block w-full px-4 py-3 bg-black/20 border border-white/10 text-white rounded-xl focus:outline-none focus:border-indigo-500/50 sm:text-sm"
                  placeholder="johndoe99"
                  value={formData.username}
                  onChange={handleChange}
                  />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">Email Address</label>
                  <input
                  type="email"
                  name="email"
                  required
                  className="block w-full px-4 py-3 bg-black/20 border border-white/10 text-white rounded-xl focus:outline-none focus:border-indigo-500/50 sm:text-sm"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  />
              </div>
              <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">Phone Number</label>
                  <input
                  type="tel"
                  name="phoneNumber"
                  required
                  className="block w-full px-4 py-3 bg-black/20 border border-white/10 text-white rounded-xl focus:outline-none focus:border-indigo-500/50 sm:text-sm"
                  placeholder="+92 300 1234567"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">Password</label>
              <input
                type="password"
                name="password"
                required
                className="block w-full px-4 py-3 bg-black/20 border border-white/10 text-white rounded-xl focus:outline-none focus:border-indigo-500/50 sm:text-sm"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">Referral Code (Optional)</label>
              <input
                type="text"
                name="referralCode"
                className="block w-full px-4 py-3 bg-black/20 border border-white/10 text-white rounded-xl focus:outline-none focus:border-indigo-500/50 sm:text-sm"
                placeholder="XYZ123"
                value={formData.referralCode}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center mt-6 py-3 px-4 text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
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
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
