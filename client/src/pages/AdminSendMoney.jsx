import { useState } from 'react';
import axiosInstance from '../api/axios.js';
import Loader from '../components/Loader.jsx';
import useAccounts from '../hooks/useAccounts.js';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

function AdminSendMoney() {
  const { accounts, loading } = useAccounts('/accounts/admin/all');
  const [form, setForm] = useState({ fromAccount: '', toAccount: '', amount: '' });
  const [submitting, setSubmitting] = useState(false);
  const accountCount = accounts.length;

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.fromAccount || !form.toAccount || !form.amount) {
      toast.error('Please complete all fields');
      return;
    }

    const confirmed = window.confirm(`Transfer ₹${Number(form.amount).toFixed(2)} from ${form.fromAccount} to ${form.toAccount}?`);
    if (!confirmed) return;

    setSubmitting(true);
    try {
      await axiosInstance.post('/transactions/admin/transfer', {
        fromAccount: form.fromAccount,
        toAccount: form.toAccount,
        amount: Number(form.amount),
        idempotencyKey: uuidv4(),
      });
      toast.success('Admin transfer completed successfully');
      setForm({ fromAccount: '', toAccount: '', amount: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Transfer failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && accounts.length === 0) return <Loader label="Loading account options" />;

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-800 bg-slate-900/95 p-8 shadow-soft">
        <h2 className="text-2xl font-semibold text-white">Admin transfer</h2>
        <p className="mt-2 text-sm text-slate-400">Send money from any account to any account using system privileges.</p>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-soft">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm uppercase tracking-[0.24em] text-slate-500">Admin account access</h3>
            <p className="mt-2 text-sm text-slate-400">System/admin can send money from any account.</p>
          </div>
          <p className="text-sm font-semibold text-white">Accounts available: {accountCount}</p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Sender account</label>
              <select
                name="fromAccount"
                value={form.fromAccount}
                onChange={handleChange}
                className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
              >
                <option value="" disabled>Select account</option>
                {accounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account._id} - ₹{Number(account.balance || 0).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Recipient account</label>
              <select
                name="toAccount"
                value={form.toAccount}
                onChange={handleChange}
                className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
              >
                <option value="" disabled>Select recipient account</option>
                {accounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account._id} - {account.user?.name || 'Unknown'} - {account.user?.email || 'No email'} - ₹{Number(account.balance || 0).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Amount</label>
            <input
              name="amount"
              type="number"
              min="1"
              value={form.amount}
              onChange={handleChange}
              className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
              placeholder="Enter amount"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-3xl bg-gradient-to-r from-cyan-500 to-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading || submitting}
          >
            {loading || submitting ? 'Processing...' : 'Send from any account'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminSendMoney;
