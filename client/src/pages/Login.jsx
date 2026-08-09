import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/Loader.jsx';

function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.email || !form.password) return;
    try {
      await login(form);
      navigate('/dashboard');
    } catch (error) {
      // login handles toast
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-[2rem] border border-slate-800 bg-slate-950/95 p-10 shadow-soft">
        <div className="space-y-3 text-center">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 to-cyan-400 text-slate-950 text-xl font-bold">
            LX
          </div>
          <h1 className="text-3xl font-semibold text-white">Welcome back</h1>
          <p className="text-sm text-slate-400">Login to manage your LedgerX accounts and send money instantly.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-3xl bg-gradient-to-r from-cyan-500 to-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500">
          Don’t have an account?{' '}
          <Link to="/register" className="font-medium text-cyan-300 hover:text-cyan-200">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
