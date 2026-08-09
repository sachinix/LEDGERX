import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Accounts from './pages/Accounts.jsx';
import SendMoney from './pages/SendMoney.jsx';
import Transactions from './pages/Transactions.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminAccounts from './pages/AdminAccounts.jsx';
import AdminTransactions from './pages/AdminTransactions.jsx';
import AdminSendMoney from './pages/AdminSendMoney.jsx';

function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {user && <Navbar />}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounts"
            element={
              <ProtectedRoute>
                <Accounts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/send-money"
            element={
              <ProtectedRoute>
                <SendMoney />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/accounts"
            element={
              <AdminRoute>
                <AdminAccounts />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/transactions"
            element={
              <AdminRoute>
                <AdminTransactions />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/send-money"
            element={
              <AdminRoute>
                <AdminSendMoney />
              </AdminRoute>
            }
          />
          <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
