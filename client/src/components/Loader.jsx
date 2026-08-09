function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-3xl border border-slate-800 bg-slate-900 p-8 text-slate-400 shadow-soft">
      <div className="flex items-center gap-3 text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-400" />
        {label}
      </div>
    </div>
  );
}

export default Loader;
