import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import axiosInstance from '../api/axios.js';
import toast from 'react-hot-toast';

function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [createAccount, setCreateAccount] = useState(true);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.password) return;
    try {
      await register(form);

      if (createAccount) {
        await axiosInstance.post('/accounts');
        toast.success('Bank account created successfully');
      }

      navigate('/dashboard');
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-[2rem] border border-slate-800 bg-slate-950/95 p-10 shadow-soft">
        <div className="space-y-3 text-center">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 to-cyan-400 text-slate-950 text-xl font-bold">
            LX
          </div>
          <h1 className="text-3xl font-semibold text-white">Create your account</h1>
          <p className="text-sm text-slate-400">Start banking with LedgerX and manage your accounts securely.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Full name</label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
              placeholder="Create a strong password"
            />
          </div>

          <label className="flex items-center gap-3 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={createAccount}
              onChange={(event) => setCreateAccount(event.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-400"
            />
            Create bank account after sign up
          </label>

          <button
            type="submit"
            className="w-full rounded-3xl bg-gradient-to-r from-cyan-500 to-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-cyan-300 hover:text-cyan-200">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
