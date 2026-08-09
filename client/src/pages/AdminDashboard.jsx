import { ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import axiosInstance from '../api/axios.js';
import Loader from '../components/Loader.jsx';

function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [adminTransfers, setAdminTransfers] = useState([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const [accountsResponse, transactionsResponse] = await Promise.all([
          axiosInstance.get('/accounts'),
          axiosInstance.get('/transactions/admin/all')
        ]);

        setAccounts(accountsResponse.data?.accounts || accountsResponse.data || []);

        const transfers = transactionsResponse.data?.transactions || [];
        const adminOnlyTransfers = transfers.filter(
          (transaction) => transaction.fromAccount?.user?.systemUser === true
        );

        setAdminTransfers(adminOnlyTransfers);
      } catch (error) {
        setAccounts([]);
        setAdminTransfers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const primaryAccount = accounts[0] || { _id: 'N/A', currency: 'N/A' };

  if (loading) return <Loader label="Loading admin dashboard" />;

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-800 bg-slate-900/95 p-8 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Admin panel</p>
            <h1 className="mt-4 text-4xl font-semibold text-white">Admin transfer summary</h1>
            <p className="mt-3 max-w-2xl text-slate-400">See the total amount admin has sent to each recipient account.</p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-3xl bg-slate-950 px-5 py-4 text-sm text-slate-300 shadow-soft">
            <ShieldCheck className="h-5 w-5 text-emerald-300" />
            System user mode
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-soft">
        <h2 className="text-2xl font-semibold text-white">Your financial overview</h2>
        <p className="mt-2 text-sm text-slate-400">User and account details for the logged-in admin.</p>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Name</p>
            <p className="mt-2 text-lg font-semibold text-white">{user?.name || 'Unknown'}</p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Email</p>
            <p className="mt-2 text-lg font-semibold text-white">{user?.email || 'No email available'}</p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Account no.</p>
            <p className="mt-2 text-lg font-semibold text-white">{primaryAccount._id}</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Admin amount distributed</h2>
            <p className="mt-2 text-sm text-slate-400">Payments made by admin to recipient accounts.</p>
          </div>
          <a
            href="/admin/send-money"
            className="inline-flex items-center justify-center rounded-3xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Send money from any account
          </a>
        </div>

        {adminTransfers.length > 0 ? (
          <div className="mt-6 grid gap-4">
            {adminTransfers.map((transaction) => (
              <div key={transaction._id} className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Transaction ID</p>
                <p className="mt-2 text-lg font-semibold text-white">{transaction._id}</p>
                <p className="mt-3 text-sm text-slate-400">
                  Recipient: <span className="text-white">{transaction.toAccount?.user?.name || 'Unknown'}</span>
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Email: <span className="text-white">{transaction.toAccount?.user?.email || 'No email available'}</span>
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Account ID: <span className="text-white">{transaction.toAccount?._id || 'Unknown'}</span>
                </p>
                <p className="mt-3 text-3xl font-semibold text-white">₹{transaction.amount?.toFixed(2)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950 p-6 text-slate-400">
            No admin transfers found yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
