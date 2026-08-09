import { useEffect, useState } from 'react';
import axiosInstance from '../api/axios.js';
import Loader from '../components/Loader.jsx';
import TransactionCard from '../components/TransactionCard.jsx';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/transactions');
        setTransactions(response.data?.transactions || response.data || []);
      } catch (error) {
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) return <Loader label="Loading transactions" />;

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-800 bg-slate-900/95 p-8 shadow-soft">
        <h2 className="text-2xl font-semibold text-white">Transaction history</h2>
        <p className="mt-2 text-sm text-slate-400">Review all of your completed transfers and transaction details.</p>
      </div>

      <div className="grid gap-6">
        {transactions.length > 0 ? (
          transactions.map((transaction) => <TransactionCard key={transaction._id || transaction.id} transaction={transaction} />)
        ) : (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400 shadow-soft">
            No transactions found. Make a transfer to populate your history.
          </div>
        )}
      </div>
    </div>
  );
}

export default Transactions;
