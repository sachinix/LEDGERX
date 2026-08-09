import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios.js';
import Loader from '../components/Loader.jsx';
import useAccounts from '../hooks/useAccounts.js';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

function SendMoney() {
  const navigate = useNavigate();
  const { accounts, loading } = useAccounts('/accounts');
  const [form, setForm] = useState({ fromAccount: '', toAccount: '', amount: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.fromAccount || !form.toAccount || !form.amount) {
      toast.error('Please complete all fields');
      return;
    }

    const confirmed = window.confirm(`Transfer ₹${Number(form.amount).toFixed(2)} to ${form.toAccount}?`);
    if (!confirmed) return;

    setSubmitting(true);
    try {
      await axiosInstance.post('/transactions', {
        ...form,
        amount: Number(form.amount),
        idempotencyKey: uuidv4(),
      });
      toast.success('Money sent successfully');
      navigate('/transactions');
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
        <h2 className="text-2xl font-semibold text-white">Send money</h2>
        <p className="mt-2 text-sm text-slate-400">Choose the sender account, enter the recipient ID, and process your transfer.</p>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-soft">
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
              <label className="text-sm font-medium text-slate-300">Recipient account ID</label>
              <input
                name="toAccount"
                value={form.toAccount}
                onChange={handleChange}
                className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                placeholder="Enter recipient account ID"
              />
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
            {loading || submitting ? 'Sending...' : 'Send money'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SendMoney;
