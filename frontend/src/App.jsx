import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import AddEntry from './components/AddEntry';
import Transactions from './components/Transactions';
import Analytics from './components/Analytics';
import Reports from './components/Reports';
import Auth from './components/Auth';
import { getTransactions, deleteTransaction as deleteTxApi } from './api';

import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement
} from 'chart.js';

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
  PointElement, LineElement
);

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const fetchTransactions = async () => {
    if (!token) return;
    try {
      const { data } = await getTransactions();
      setTransactions(data);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
      // Fallback to empty if backend fails or unauthorized
      setTransactions([]);
      if (err.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTransactions();
    } else {
      setTransactions([]);
      setLoading(false);
    }
  }, [token]);

  const handleAuthSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setActiveTab('dashboard');
  };

  const handleDelete = async (id) => {
    try {
      await deleteTxApi(id);
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (err) {
      console.error('Failed to delete transaction', err);
    }
  };

  const monthBadge = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className="app">
      <header>
        <div className="logo">Fin<span>Track</span></div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div className="month-badge" style={{ padding: '8px 16px', fontSize: '14px', borderRadius: '24px' }}>
            {monthBadge}
          </div>
          
          {token && user && (
            <div className="user-badge">
              <div className="avatar">
                {user?.fullName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="username-text">
                {user?.fullName?.split(' ')[0] || user?.username || 'User'}
              </div>
            </div>
          )}

          {token && (
            <button 
              onClick={handleLogout}
              style={{
                background: 'transparent', border: '1px solid var(--border)',
                borderRadius: '24px', padding: '6px 16px', cursor: 'pointer',
                color: 'var(--muted)', fontSize: '14px', transition: 'all 0.2s',
              }}
              onMouseOver={(e) => e.target.style.color = 'var(--text)'}
              onMouseOut={(e) => e.target.style.color = 'var(--muted)'}
            >
              Sign out
            </button>
          )}

          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{
              background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer',
              color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title="Toggle Theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>
      
      {!token ? (
        <Auth onAuthSuccess={handleAuthSuccess} />
      ) : (
        <>
          <div className="tabs">
            <div className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Dashboard</div>
            <div className={`tab ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}>+ Add Entry</div>
            <div className={`tab ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => setActiveTab('transactions')}>Transactions</div>
            <div className={`tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>Analytics</div>
            <div className={`tab ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>↓ Reports</div>
          </div>
      
      <main>
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--muted)' }}>Loading...</div>
        ) : (
          <>
            <div className={`page ${activeTab === 'dashboard' ? 'active' : ''}`}>
              <Dashboard transactions={transactions} onDelete={handleDelete} />
            </div>
            
            <div className={`page ${activeTab === 'add' ? 'active' : ''}`}>
              <AddEntry 
                user={user} 
                setUser={setUser} 
                onAddSuccess={() => { fetchTransactions(); setActiveTab('dashboard'); }} 
              />
            </div>
            
            <div className={`page ${activeTab === 'transactions' ? 'active' : ''}`}>
              <Transactions 
                transactions={transactions} 
                onDelete={handleDelete} 
                onEditSuccess={fetchTransactions} 
                user={user} 
                setUser={setUser}
              />
            </div>
            
            <div className={`page ${activeTab === 'analytics' ? 'active' : ''}`}>
              <Analytics transactions={transactions} />
            </div>

            <div className={`page ${activeTab === 'reports' ? 'active' : ''}`}>
              <Reports transactions={transactions} />
            </div>
          </>
        )}
      </main>
        </>
      )}
    </div>
  );
}

export default App;
