import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { Wallet, PlayCircle, CheckSquare, Gift, ArrowUpRight, ArrowDownRight, Clock, AlertCircle } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/utils';
import { Link } from 'react-router-dom';

const plans = [
  { id: 'starter', name: 'Starter Plan', investment: 500, dailyProfit: 80, duration: 15, totalReturn: 1200 },
  { id: 'basic', name: 'Basic Plan', investment: 1000, dailyProfit: 170, duration: 15, totalReturn: 2550 },
  { id: 'silver', name: 'Silver Plan', investment: 3000, dailyProfit: 550, duration: 20, totalReturn: 11000 },
  { id: 'gold', name: 'Gold Plan', investment: 5000, dailyProfit: 950, duration: 20, totalReturn: 19000 },
];

export default function Dashboard() {
  const { user, userData } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Forms limits
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('JazzCash');
  const [depositMethod, setDepositMethod] = useState('JazzCash');

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const q = query(
        collection(db, `users/${user?.uid}/transactions`)
      );
      const querySnapshot = await getDocs(q);
      const txs: any[] = [];
      querySnapshot.forEach((doc) => {
        txs.push({ id: doc.id, ...doc.data() });
      });
      setTransactions(txs.sort((a,b) => b.timestamp - a.timestamp));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `users/${user?.uid}/transactions`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(depositAmount);
    if (amount <= 0) return alert('Invalid amount');
    try {
      const txId = Math.random().toString(36).substring(2, 10);
      await setDoc(doc(db, `users/${user?.uid}/transactions`, txId), {
        userId: user?.uid,
        type: 'deposit',
        amount: amount,
        method: depositMethod,
        status: 'pending',
        timestamp: Date.now()
      });
      setDepositAmount('');
      fetchTransactions();
      alert('Deposit request submitted! Please wait for admin approval.');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user?.uid}/transactions`);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    if (!userData?.hasInvested) return alert('You must invest in a plan first to unlock withdrawals.');
    if (amount < 500) return alert('Minimum withdrawal is Rs 500');
    if (amount > (userData?.balance || 0)) return alert('Insufficient balance');
    
    try {
      const txId = Math.random().toString(36).substring(2, 10);
      await setDoc(doc(db, `users/${user?.uid}/transactions`, txId), {
        userId: user?.uid,
        type: 'withdrawal',
        amount: amount,
        method: withdrawMethod,
        status: 'pending',
        timestamp: Date.now()
      });
      // Deduct balance client-side optimistically
      await updateDoc(doc(db, 'users', user!.uid), {
         balance: (userData?.balance || 0) - amount,
         updatedAt: Date.now()
      });
      setWithdrawAmount('');
      fetchTransactions();
      alert('Withdrawal request submitted! Processing takes 5 mins to 24 hours.');
      // Force refresh
      window.location.reload(); 
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user?.uid}/transactions`);
    }
  };

  const handleBuyPlan = async (planId: string, investment: number) => {
    if (!userData) return;
    if (userData.balance < investment) {
        alert('Insufficient balance. Please deposit funds first.');
        return;
    }
    try {
       await updateDoc(doc(db, 'users', user!.uid), {
           balance: userData.balance - investment,
           activePlanId: planId,
           hasInvested: true,
           investmentAmount: userData.investmentAmount + investment,
           updatedAt: Date.now()
       });
       alert('Plan activated successfully!');
       window.location.reload();
    } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user?.uid}`);
    }
  };

  const handleCompleteTask = async (type: 'ad' | 'task', reward: number) => {
      if (!userData?.hasInvested) {
          alert('You must invest in a plan first to unlock tasks and ads.');
          return;
      }
      try {
        const taskId = Math.random().toString(36).substring(2, 10);
        await setDoc(doc(db, `users/${user?.uid}/tasks`, taskId), {
            userId: user?.uid,
            type: type,
            rewardAmount: reward,
            completedAt: Date.now()
        });
        await updateDoc(doc(db, 'users', user!.uid), {
            balance: userData.balance + reward,
            totalEarnings: userData.totalEarnings + reward,
            updatedAt: Date.now()
        });
        alert('Reward collected! Added to your balance.');
        window.location.reload();
      } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `users/${user?.uid}/tasks`);
      }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">Welcome, {userData?.fullName}</h1>
        <p className="text-slate-400">Manage your investments and earnings.</p>
      </div>

      {userData?.role === 'admin' && (
          <div className="mb-2 bg-indigo-500/10 p-4 border border-indigo-500/20 rounded-xl flex items-center justify-between">
              <div>
                  <h3 className="font-bold text-indigo-300">Admin Mode</h3>
                  <p className="text-sm text-indigo-400/80">You have administrator privileges.</p>
              </div>
              <Link to="/admin" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-500 transition-colors">Go to Admin Panel</Link>
          </div>
      )}

      {/* Warning Banner */}
      {!userData?.hasInvested && (
        <div className="mb-4 bg-rose-500/10 border-l-4 border-rose-500 p-4 flex gap-3 rounded-r-lg">
          <AlertCircle className="text-rose-500 shrink-0" />
          <div>
            <h3 className="font-bold text-rose-300">Account Restricted</h3>
            <p className="text-sm text-rose-400/80 mt-1">You must invest in a plan (minimum Rs 500) to activate tasks, ads, and withdrawals. <button onClick={() => setActiveTab('plans')} className="font-bold underline text-rose-200">View Plans</button></p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-indigo-500/20 p-2 rounded-xl text-indigo-400 border border-indigo-500/20"><Wallet size={20} /></div>
            <h3 className="font-medium text-slate-400">Available Balance</h3>
          </div>
          <p className="text-3xl font-bold text-white">Rs {userData?.balance.toLocaleString()}</p>
        </div>
        
        <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400 border border-emerald-500/20"><Gift size={20} /></div>
            <h3 className="font-medium text-slate-400">Total Earnings</h3>
          </div>
          <p className="text-3xl font-bold text-white">Rs {userData?.totalEarnings.toLocaleString()}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-rose-500/20 p-2 rounded-xl text-rose-400 border border-rose-500/20"><ArrowUpRight size={20} /></div>
            <h3 className="font-medium text-slate-400">Total Invested</h3>
          </div>
          <p className="text-3xl font-bold text-white">Rs {userData?.investmentAmount.toLocaleString()}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-amber-500/20 p-2 rounded-xl text-amber-400 border border-amber-500/20"><CheckSquare size={20} /></div>
            <h3 className="font-medium text-slate-400">Active Plan</h3>
          </div>
          <p className="text-3xl font-bold text-white capitalize">{userData?.activePlanId || 'None'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-white/10 mb-4 overflow-x-auto pb-2">
        {['overview', 'plans', 'tasks', 'wallet'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 capitalize font-medium rounded-lg text-sm transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-white/10 text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white"><Clock size={20} className="text-slate-400" /> Recent Activity</h3>
                {transactions.length === 0 ? (
                    <p className="text-slate-500 text-sm">No recent transactions.</p>
                ) : (
                    <ul className="space-y-4">
                        {transactions.slice(0, 5).map(tx => (
                            <li key={tx.id} className="flex justify-between items-center border-b border-white/10 pb-3 last:border-0 last:pb-0">
                                <div>
                                    <p className="font-medium text-white capitalize text-sm">{tx.type.replace('_', ' ')}</p>
                                    <p className="text-xs text-slate-500">{new Date(tx.timestamp).toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold text-sm ${tx.type === 'deposit' || tx.type.includes('reward') ? 'text-emerald-400' : 'text-white'}`}>{tx.type === 'withdrawal' ? '-' : '+'}Rs {tx.amount.toLocaleString()}</p>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide ${tx.status === 'completed' || tx.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : tx.status === 'rejected' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'}`}>{tx.status}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
                <h3 className="text-lg font-bold mb-4 text-white">Referral Program</h3>
                <p className="text-sm text-slate-400 mb-6">Share your link and earn Rs 100 for every friend who joins and activates a plan.</p>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-widest">Your Referral Code</label>
                        <div className="flex gap-2">
                            <input type="text" readOnly value={userData?.referralCode} className="block w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none" />
                            <button onClick={() => {navigator.clipboard.writeText(userData?.referralCode || ''); alert('Copied!')}} className="px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-lg border border-white/10 hover:bg-white/20 transition-all">Copy</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'plans' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, i) => (
                <div key={plan.id} className={`border rounded-3xl p-6 transition-all duration-300 relative overflow-hidden ${userData?.activePlanId === plan.id ? 'bg-indigo-600/20 border-indigo-500/50 ring-1 ring-indigo-500/30' : 'bg-white/5 border-white/10 hover:border-indigo-500/50 hover:bg-white/10'}`}>
                    <h4 className={`text-xs font-bold uppercase mb-1 ${userData?.activePlanId === plan.id ? 'text-indigo-300' : 'text-slate-400'}`}>{plan.name}</h4>
                    <p className="text-2xl font-bold text-white mb-6">Rs {plan.investment}</p>
                    <ul className="space-y-3 mb-6 text-[13px] text-slate-400">
                        <li className="flex justify-between"><span>Daily Profit</span> <strong className="text-emerald-400">Rs {plan.dailyProfit}</strong></li>
                        <li className="flex justify-between"><span>Duration</span> <strong className="text-white">{plan.duration} Days</strong></li>
                        <li className="flex justify-between border-t border-white/10 pt-3"><span>Total Return</span> <strong className="text-white">Rs {plan.totalReturn}</strong></li>
                    </ul>
                    {userData?.activePlanId === plan.id ? (
                        <button disabled className="w-full py-3 bg-indigo-500/50 text-white rounded-xl text-sm font-medium cursor-not-allowed">Active Plan</button>
                    ) : (
                        <button onClick={() => handleBuyPlan(plan.id, plan.investment)} className="w-full py-3 bg-white/10 text-white hover:bg-indigo-600 border border-white/10 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-indigo-600/30 text-center">Activate</button>
                    )}
                </div>
            ))}
        </div>
      )}

      {activeTab === 'tasks' && (
          <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
                  {!userData?.hasInvested && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                          <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
                          <h4 className="text-lg font-bold text-white">Tasks Locked</h4>
                          <p className="text-sm text-slate-300 mt-1 mb-4">Activate a plan to unlock tasks.</p>
                          <button onClick={() => setActiveTab('plans')} className="text-indigo-300 font-medium text-sm border border-indigo-500/50 bg-indigo-500/20 px-4 py-2 rounded-lg hover:bg-indigo-500/30 transition-all">View Plans</button>
                      </div>
                  )}
                  
                  <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/20"><PlayCircle /></div>
                      <div>
                          <h3 className="font-bold text-white">Watch Ads</h3>
                          <p className="text-sm text-slate-400">Earn instantly by watching 30s clips</p>
                      </div>
                  </div>
                  <button onClick={() => handleCompleteTask('ad', 50)} className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-rose-600/20">Watch Ad (Earn Rs 50)</button>
              </div>

              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
                 {!userData?.hasInvested && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                          <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
                          <h4 className="text-lg font-bold text-white">Tasks Locked</h4>
                          <p className="text-sm text-slate-300 mt-1 mb-4">Activate a plan to unlock tasks.</p>
                          <button onClick={() => setActiveTab('plans')} className="text-indigo-300 font-medium text-sm border border-indigo-500/50 bg-indigo-500/20 px-4 py-2 rounded-lg hover:bg-indigo-500/30 transition-all">View Plans</button>
                      </div>
                  )}
                  
                  <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/20"><CheckSquare /></div>
                      <div>
                          <h3 className="font-bold text-white">Daily Tasks</h3>
                          <p className="text-sm text-slate-400">Complete visits to earn rewards</p>
                      </div>
                  </div>
                  <button onClick={() => handleCompleteTask('task', 30)} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 mt-2">Visit Page (Earn Rs 30)</button>
              </div>
          </div>
      )}

      {activeTab === 'wallet' && (
          <div className="grid md:grid-cols-2 gap-8">
              {/* Deposit */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-white"><ArrowDownRight className="text-emerald-400" /> Deposit Funds</h3>
                  <form onSubmit={handleDeposit} className="space-y-5">
                      <div>
                          <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">Amount (Rs)</label>
                          <input type="number" min="500" required value={depositAmount} onChange={e => setDepositAmount(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50" placeholder="500" />
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">Method</label>
                          <select value={depositMethod} onChange={e => setDepositMethod(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 appearance-none">
                              <option value="JazzCash" className="bg-gray-900">JazzCash</option>
                              <option value="Easypaisa" className="bg-gray-900">Easypaisa</option>
                              <option value="USDT (TRC20)" className="bg-gray-900">USDT (TRC20)</option>
                          </select>
                      </div>
                      <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl text-sm text-indigo-200">
                          Transfer to our official account then submit request.
                      </div>
                      <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30">Submit Deposit Request</button>
                  </form>
              </div>

               {/* Withdraw */}
               <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                  {!userData?.hasInvested && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                          <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
                          <h4 className="text-lg font-bold text-white">Withdrawals Locked</h4>
                          <p className="text-sm text-slate-300 mt-1 mb-4">Activate a plan to unlock withdrawals.</p>
                          <button onClick={() => setActiveTab('plans')} className="text-indigo-300 font-medium text-sm border border-indigo-500/50 bg-indigo-500/20 px-4 py-2 rounded-lg hover:bg-indigo-500/30 transition-all">View Plans</button>
                      </div>
                  )}
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-white"><ArrowUpRight className="text-rose-400" /> Withdraw Funds</h3>
                  <form onSubmit={handleWithdraw} className="space-y-5">
                      <div>
                          <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">Amount (Rs)</label>
                          <input type="number" min="500" required value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50" placeholder={`Max: ${userData?.balance}`} />
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">Method</label>
                          <select value={withdrawMethod} onChange={e => setWithdrawMethod(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 appearance-none">
                              <option value="JazzCash" className="bg-gray-900">JazzCash</option>
                              <option value="Easypaisa" className="bg-gray-900">Easypaisa</option>
                              <option value="USDT (TRC20)" className="bg-gray-900">USDT (TRC20)</option>
                          </select>
                      </div>
                      <div className="bg-rose-500/10 p-4 rounded-xl text-sm text-rose-200 border border-rose-500/20">
                          Minimum withdrawal: Rs 500<br/>
                          Processing time: 5 mins - 24 hours.
                      </div>
                      <button type="submit" className="w-full py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 border border-white/10 transition-all">Request Withdrawal</button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}

