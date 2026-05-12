import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, PlayCircle, TrendingUp, Users } from 'lucide-react';

const plans = [
  { id: 1, name: 'Starter Plan', investment: 500, dailyProfit: 80, duration: 15, totalReturn: 1200 },
  { id: 2, name: 'Basic Plan', investment: 1000, dailyProfit: 170, duration: 15, totalReturn: 2550 },
  { id: 3, name: 'Silver Plan', investment: 3000, dailyProfit: 550, duration: 20, totalReturn: 11000 },
  { id: 4, name: 'Gold Plan', investment: 5000, dailyProfit: 950, duration: 20, totalReturn: 19000 },
  { id: 5, name: 'Diamond Plan', investment: 10000, dailyProfit: 2000, duration: 25, totalReturn: 50000 },
  { id: 6, name: 'VIP Plan', investment: 20000, dailyProfit: 4500, duration: 30, totalReturn: 135000 },
  { id: 7, name: 'Premium Plan', investment: 50000, dailyProfit: 12000, duration: 30, totalReturn: 360000 },
  { id: 8, name: 'Royal Plan', investment: 100000, dailyProfit: 25000, duration: 40, totalReturn: 1000000 },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-12 w-full">
      {/* Hero Section */}
      <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-10 md:p-20 text-center relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            Secure Your Future with <span className="text-indigo-400">Smart Investments</span>
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Earn daily profits by completing simple tasks, watching ads, and investing in our highly rewarding plans. Start your journey to financial freedom today.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all">
              Start Earning Now <ArrowRight size={18} />
            </Link>
            <a href="#plans" className="bg-white/10 text-white px-8 py-3 rounded-xl font-medium hover:bg-white/20 transition-all border border-white/10">
              View Plans
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="flex flex-col gap-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">How It Works</h2>
          <p className="mt-2 text-slate-400">Unlocking earnings is as easy as 1-2-3.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 transition-transform hover:scale-[1.02]">
            <div className="bg-indigo-500/20 w-12 h-12 rounded-xl flex items-center justify-center text-indigo-400 mb-6 border border-indigo-500/20">
              <TrendingUp />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">1. Activate a Plan</h3>
            <p className="text-slate-400">Choose from 8 investment plans starting at just Rs 500 to unlock your account and earning features.</p>
          </div>
          <div className="bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-8 transition-transform hover:scale-[1.02]">
            <div className="bg-emerald-500/20 w-12 h-12 rounded-xl flex items-center justify-center text-emerald-400 mb-6 border border-emerald-500/20">
              <PlayCircle />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">2. Watch & Earn</h3>
            <p className="text-emerald-200/70">Watch short ads and complete daily tasks to rapidly increase your account balance securely.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 transition-transform hover:scale-[1.02]">
            <div className="bg-amber-500/20 w-12 h-12 rounded-xl flex items-center justify-center text-amber-400 mb-6 border border-amber-500/20">
              <Users />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">3. Refer Friends</h3>
            <p className="text-slate-400">Invite friends using your unique code and get Rs 100 instantly for every activated referral.</p>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="flex flex-col gap-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Investment Plans</h2>
          <p className="mt-2 text-slate-400">Choose the perfect plan to unlock daily tasks, ads, and withdrawals.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, i) => (
            <div key={plan.id} className={`border rounded-2xl p-6 transition-all duration-300 cursor-pointer relative overflow-hidden group ${i === 2 ? 'bg-indigo-600/20 border-indigo-500/50 ring-1 ring-indigo-500/30 hover:scale-[1.02]' : 'bg-white/5 border-white/10 hover:border-indigo-500/50'}`}>
              {i === 2 && (
                 <div className="absolute top-0 right-0 p-2">
                   <span className="px-3 py-1 bg-indigo-500/30 text-indigo-300 text-[10px] font-bold rounded-full uppercase tracking-widest">Hot</span>
                 </div>
              )}
              <h4 className={`text-xs font-bold uppercase mb-1 ${i === 2 ? 'text-indigo-300' : 'text-slate-400'}`}>{plan.name}</h4>
              <div className="text-2xl font-bold text-white mb-6">Rs {plan.investment}</div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex justify-between text-[13px]">
                   <span className={i === 2 ? 'text-indigo-200' : 'text-slate-400'}>Daily Profit</span>
                   <span className="text-emerald-400 font-bold">Rs {plan.dailyProfit}</span>
                </li>
                 <li className="flex justify-between text-[13px]">
                   <span className={i === 2 ? 'text-indigo-200' : 'text-slate-400'}>Duration</span>
                   <span className="text-white">{plan.duration} Days</span>
                </li>
                 <li className="flex justify-between text-[13px] pt-3 border-t border-white/10">
                   <span className={i === 2 ? 'text-indigo-200' : 'text-slate-400'}>Total Return</span>
                   <span className="text-white font-bold">Rs {plan.totalReturn.toLocaleString()}</span>
                </li>
              </ul>
              
              <Link to="/register" className={`w-full block text-center py-3 rounded-xl text-sm font-bold transition-all ${i === 2 ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40' : 'bg-white/10 text-white hover:bg-indigo-500 border border-white/10'}`}>
                Select Plan
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-8 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 text-center">
          <p className="text-rose-300 font-medium text-sm">
            <span className="font-bold underline uppercase">Important Policy:</span> No investment = No ads access, No tasks access, No withdrawal option. A minimum investment is required to unlock your account earning features.
          </p>
        </div>
      </section>

      {/* FAQs */}
      <section className="flex flex-col gap-8 pb-12">
        <h2 className="text-3xl font-bold text-center text-white">Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            <h4 className="font-bold text-base mb-2 text-white">How do I start earning?</h4>
            <p className="text-slate-400 text-sm leading-relaxed">First register for an account, then activate an investment plan. Once active, your ad and tasks sections will automatically unlock.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            <h4 className="font-bold text-base mb-2 text-white">Can I earn without investment?</h4>
            <p className="text-slate-400 text-sm leading-relaxed">No. An initial plan investment is strictly required to unlock ads, daily tasks, and the ability to withdraw funds.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            <h4 className="font-bold text-base mb-2 text-white">Which payment methods are supported?</h4>
            <p className="text-slate-400 text-sm leading-relaxed">We support JazzCash and Easypaisa for quick local transactions, as well as USDT TRC20, Bitcoin, and Litecoin for crypto users.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 flex flex-col sm:flex-row justify-between items-center text-[12px] text-slate-500 font-medium py-6 border-t border-white/10">
        <p>© 2026 SmartEarn Pro — All Rights Reserved.</p>
        <div className="flex gap-6 mt-4 sm:mt-0 uppercase tracking-widest text-[10px]">
          <a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-indigo-400 transition-colors">Help Center</a>
        </div>
      </footer>
    </div>
  )
}
