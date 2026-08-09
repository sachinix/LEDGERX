import { Copy } from 'lucide-react';
import Loader from '../components/Loader.jsx';
import useAccounts from '../hooks/useAccounts.js';

function AdminAccounts() {
  const { accounts, loading } = useAccounts('/accounts/admin/all');

  if (loading) return <Loader label="Loading admin accounts" />;

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-800 bg-slate-900/95 p-8 shadow-soft">
        <h2 className="text-2xl font-semibold text-white">All accounts</h2>
        <p className="mt-2 text-sm text-slate-400">View every account in the LedgerX system.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {accounts.map((account) => (
          <div key={account._id} className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Account ID</p>
                <p className="mt-2 break-all text-base font-semibold text-white">{account._id}</p>
              </div>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(account._id)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500"
              >
                <Copy className="h-4 w-4" />
                Copy
              </button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-950 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Currency</p>
                <p className="mt-2 text-sm text-slate-100">{account.currency || 'INR'}</p>
              </div>
              <div className="rounded-3xl bg-slate-950 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Status</p>
                <p className="mt-2 text-sm text-slate-100">{account.status || 'Active'}</p>
              </div>
              <div className="rounded-3xl bg-slate-950 p-4 sm:col-span-2">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Balance</p>
                <p className="mt-2 text-xl font-semibold text-white">₹{Number(account.balance || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminAccounts;
