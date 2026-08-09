import { Link, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, CreditCard, Clock4, ShieldCheck, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Accounts', to: '/accounts', icon: CreditCard },
  { label: 'Transactions', to: '/transactions', icon: Clock4 },
];

const adminItems = [
  { label: 'All Accounts', to: '/admin/accounts', icon: Globe },
  { label: 'All Transactions', to: '/admin/transactions', icon: Clock4 },
  { label: 'Admin Transfer', to: '/admin/send-money', icon: CreditCard },
];

function Navbar() {
  const location = useLocation();
  const { logout, user } = useAuth();
  const items = user?.systemUser ? adminItems : navItems;

  return (
    <header className="bg-slate-900 border-b border-slate-800 shadow-soft sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between py-4">
          <Link to="/dashboard" className="flex items-center gap-3 text-white">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 text-slate-950 font-bold">
              LX
            </span>
            <div>
              <p className="text-lg font-semibold">LedgerX</p>
              <p className="text-sm text-slate-400">Digital Banking</p>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-2">
            {items.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                    active ? 'bg-slate-800 text-white shadow-soft' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-900"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
