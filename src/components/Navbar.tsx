import { Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { Wallet } from 'lucide-react';

export default function Navbar() {
  const { user, userData } = useAuth();

  return (
    <nav className="relative z-50 flex items-center justify-between bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20">
          <Wallet size={20} className="text-white" />
        </div>
        <Link to="/" className="text-xl font-bold tracking-tight text-white">
          SmartEarn <span className="text-indigo-400">Pro</span>
        </Link>
      </div>
      <div className="flex items-center gap-4 sm:gap-8">
        {user ? (
          <>
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Total Balance</span>
              <span className="text-lg font-mono font-semibold text-emerald-400">Rs {userData?.balance || 0}</span>
            </div>
            <div className="h-10 w-[1px] bg-white/10 hidden sm:block"></div>
            <div className="flex items-center gap-3 bg-white/5 rounded-full pl-2 pr-4 py-1.5 border border-white/10">
              <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">
                {userData?.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium hidden sm:block">{userData?.fullName || 'User'}</span>
            </div>
            {userData?.role === 'admin' && (
              <Link to="/admin" className="text-slate-300 hover:text-indigo-400 text-sm font-medium transition-colors">Admin</Link>
            )}
            <Link to="/dashboard" className="text-slate-300 hover:text-indigo-400 text-sm font-medium transition-colors">Dashboard</Link>
            <button 
              onClick={() => signOut(auth)}
              className="text-slate-300 hover:text-rose-400 text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-slate-300 hover:text-indigo-400 text-sm font-medium transition-colors">Login</Link>
            <Link to="/register" className="bg-white/10 text-white hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/10">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}
