import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/utils';
import { Check, X } from 'lucide-react';

export default function AdminPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersList: any[] = [];
      const txsList: any[] = [];
      
      for (const userDoc of usersSnap.docs) {
          const ud = {id: userDoc.id, ...userDoc.data()} as any;
          usersList.push(ud);

          // Get transactions for user
          const txSnap = await getDocs(collection(db, `users/${ud.id}/transactions`));
          txSnap.forEach(txDoc => {
              txsList.push({ id: txDoc.id, userEmail: ud.email, ...txDoc.data() });
          });
      }
      
      setUsers(usersList);
      setTransactions(txsList.sort((a,b) => b.timestamp - a.timestamp));
    } catch (error) {
       handleFirestoreError(error, OperationType.LIST, `users`);
    } finally {
      setLoading(false);
    }
  };

  const approveTx = async (userId: string, txId: string, amount: number, type: string) => {
    try {
        await updateDoc(doc(db, `users/${userId}/transactions`, txId), { status: 'approved' });
        
        // If deposit, update user balance
        if (type === 'deposit') {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const data = userSnap.data();
                await updateDoc(userRef, { balance: data.balance + amount });
            }
        }
        // Withdrawal balance is optimistic
        
        fetchData();
        alert('Transaction approved!');
    } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${userId}/transactions/${txId}`);
    }
  };

  const rejectTx = async (userId: string, txId: string, amount: number, type: string) => {
      try {
        await updateDoc(doc(db, `users/${userId}/transactions`, txId), { status: 'rejected' });
        
        // If withdrawal is rejected, refund the optimistic balance reduction
        if (type === 'withdrawal') {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const data = userSnap.data();
                await updateDoc(userRef, { balance: data.balance + amount });
            }
        }
        
        fetchData();
        alert('Transaction rejected!');
    } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${userId}/transactions/${txId}`);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  const pendingTxs = transactions.filter(t => t.status === 'pending');

  return (
    <div className="flex flex-col gap-8 w-full">
      <h1 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h1>

      <div className="grid md:grid-cols-2 gap-8 mb-4">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-lg">
              <h2 className="text-sm font-bold mb-4 uppercase tracking-widest text-slate-400">Total Users</h2>
              <p className="text-5xl font-black text-white">{users.length}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-amber-500/20 rounded-3xl p-8 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
              <h2 className="text-sm font-bold mb-4 uppercase tracking-widest text-amber-500">Pending Requests</h2>
              <p className="text-5xl font-black text-amber-400">{pendingTxs.length}</p>
          </div>
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 text-sm rounded-3xl overflow-hidden mb-8 shadow-lg">
          <div className="p-6 border-b border-white/10 bg-white/5">
              <h2 className="text-lg font-bold text-white">Pending Transactions</h2>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead className="bg-black/20 border-b border-white/10 uppercase tracking-wider text-[10px] font-bold">
                      <tr>
                          <th className="px-6 py-4 text-slate-400">User</th>
                          <th className="px-6 py-4 text-slate-400">Type</th>
                          <th className="px-6 py-4 text-slate-400">Amount</th>
                          <th className="px-6 py-4 text-slate-400">Method</th>
                          <th className="px-6 py-4 text-slate-400 text-right">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="text-slate-300">
                      {pendingTxs.map(tx => (
                          <tr key={tx.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4 font-medium text-white">{tx.userEmail}</td>
                              <td className="px-6 py-4 capitalize font-medium text-indigo-300">{tx.type}</td>
                              <td className="px-6 py-4 font-bold">Rs {tx.amount}</td>
                              <td className="px-6 py-4">{tx.method}</td>
                              <td className="px-6 py-4 text-right">
                                  <div className="flex justify-end gap-3">
                                      <button onClick={() => approveTx(tx.userId, tx.id, tx.amount, tx.type)} className="p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 rounded-xl transition-all border border-emerald-500/20 hover:border-emerald-500/50"><Check size={16}/></button>
                                      <button onClick={() => rejectTx(tx.userId, tx.id, tx.amount, tx.type)} className="p-2 bg-rose-500/20 text-rose-400 hover:bg-rose-500/40 rounded-xl transition-all border border-rose-500/20 hover:border-rose-500/50"><X size={16}/></button>
                                  </div>
                              </td>
                          </tr>
                      ))}
                      {pendingTxs.length === 0 && (
                          <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No pending transactions.</td></tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  )
}

