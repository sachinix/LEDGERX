import { ArrowRight, CreditCard, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/Loader.jsx';
import useAccounts from '../hooks/useAccounts.js';
import axiosInstance from '../api/axios.js';

function Dashboard() {
  const { user } = useAuth();
  const { accounts, loading } = useAccounts('/accounts');
  const [systemTransfers, setSystemTransfers] = useState([]);

  useEffect(() => {
    const fetchSystemTransfers = async () => {
      try {
        const transactionResponse = await axiosInstance.get('/transactions');
        const transactionsData = transactionResponse.data?.transactions || [];

        const ownedAccountIds = accounts.map((account) => String(account._id));
        const receivedFromSystem = transactionsData.filter((transaction) => {
          const toAccountId = transaction.toAccount?._id || transaction.toAccount;
          const fromAccountUser = transaction.fromAccount?.user;
          return (
            ownedAccountIds.includes(String(toAccountId)) &&
            fromAccountUser?.systemUser === true
          );
        });

        setSystemTransfers(receivedFromSystem);
      } catch (error) {
        setSystemTransfers([]);
      }
    };

    if (accounts.length > 0) {
      fetchSystemTransfers();
    }
  }, [accounts]);

  const totalBalance = useMemo(
    () => accounts.reduce((sum, account) => sum + Number(account.balance ?? 0), 0),
    [accounts]
  );

  const accountStatus = accounts.length > 0 ? 'Active' : 'No active accounts';
  const primaryAccount = accounts[0] || { _id: 'N/A', currency: 'N/A' };

  if (loading) return <Loader label="Loading your dashboard" />;

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-800 bg-slate-900/95 p-8 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Welcome to LedgerX</p>
            <h1 className="mt-4 text-4xl font-semibold text-white">Your financial overview</h1>
            <p className="mt-3 max-w-2xl text-slate-400">Track balances, accounts, and transfers all from your secure dashboard.</p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-3xl bg-slate-950 px-5 py-4 text-sm text-slate-300 shadow-soft">
            <Sparkles className="h-5 w-5 text-cyan-300" />
            {accounts.length} active account{accounts.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Total balance</p>
          <p className="mt-4 text-3xl font-semibold text-white">₹{totalBalance.toFixed(2)}</p>
          <p className="mt-2 text-sm text-slate-400">Current portfolio of all your LedgerX accounts.</p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Your profile</p>
          <p className="mt-4 text-2xl font-semibold text-white">{user?.name || 'Unknown user'}</p>
          <p className="mt-2 text-sm text-slate-400">{user?.email || 'No email available'}</p>
          <p className="mt-3 text-sm text-slate-400">Account ID: <span className="text-white">{primaryAccount._id}</span></p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-cyan-300" />
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Primary account</p>
          </div>
          <p className="mt-4 text-2xl font-semibold text-white">{primaryAccount._id}</p>
          <p className="mt-2 text-sm text-slate-400">{primaryAccount.currency || 'N/A'}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link
          to="/send-money"
          className="rounded-[2rem] border border-cyan-500/10 bg-gradient-to-br from-slate-900 to-slate-950 p-8 text-white shadow-soft transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-300">
              <ArrowRight className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold">Send money</p>
              <p className="mt-2 text-sm text-slate-400">Transfer funds to another account quickly and safely.</p>
            </div>
          </div>
        </Link>

        <Link
          to="/transactions"
          className="rounded-[2rem] border border-emerald-500/10 bg-gradient-to-br from-slate-900 to-slate-950 p-8 text-white shadow-soft transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-300">
              <ArrowRight className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold">Transactions</p>
              <p className="mt-2 text-sm text-slate-400">Review your recent transfers and transaction history.</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">System funds received</h2>

        {systemTransfers.length > 0 ? (
          <div className="grid gap-4">
            {systemTransfers.map((transaction) => (
              <div key={transaction._id || transaction.id} className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-soft">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Received from system</p>
                <p className="mt-3 text-3xl font-semibold text-white">₹{transaction.amount.toFixed(2)}</p>
                <p className="mt-2 text-sm text-slate-400">
                  From account: <span className="text-white">{transaction.fromAccount?._id || 'Unknown'}</span>
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Sent by: <span className="text-white">{transaction.fromAccount?.user?.name || 'LedgerX System'}</span>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-400 shadow-soft">
            No system-issued funds found for your account.
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
