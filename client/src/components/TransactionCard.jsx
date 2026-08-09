import { ArrowRight, CheckCircle2, Clock4 } from 'lucide-react';

function TransactionCard({ transaction }) {
  const fromAccountId = transaction.fromAccount?._id || transaction.fromAccount || 'Unknown';
  const toAccountId = transaction.toAccount?._id || transaction.toAccount || 'Unknown';
  const fromUser = transaction.fromAccount?.user;
  const toUser = transaction.toAccount?.user;
  const fromUserName = fromUser?.name || fromUser?.email || 'Unknown sender';
  const toUserName = toUser?.name || toUser?.email || 'Unknown recipient';
  const fromUserEmail = fromUser?.email || 'No email';
  const toUserEmail = toUser?.email || 'No email';

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-soft">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Amount</p>
          <p className="mt-2 text-2xl font-semibold text-white">₹{Number(transaction.amount || 0).toFixed(2)}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-300">
          <Clock4 className="h-4 w-4" />
          {transaction.status || 'COMPLETED'}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-slate-950 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">From account</p>
          <p className="mt-2 text-sm text-slate-100">{fromAccountId}</p>
          <p className="mt-1 text-xs text-slate-500">{fromUserName}</p>
          <p className="mt-1 text-xs text-slate-500">{fromUserEmail}</p>
        </div>
        <div className="rounded-3xl bg-slate-950 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">To account</p>
          <p className="mt-2 text-sm text-slate-100">{toAccountId}</p>
          <p className="mt-1 text-xs text-slate-500">{toUserName}</p>
          <p className="mt-1 text-xs text-slate-500">{toUserEmail}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          Transaction ID: {transaction._id || transaction.id}
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2">
          <ArrowRight className="h-4 w-4 text-cyan-400" />
          {new Date(transaction.createdAt || transaction.date || Date.now()).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

export default TransactionCard;
