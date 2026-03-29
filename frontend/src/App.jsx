import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import AddEntry from './components/AddEntry';
import Transactions from './components/Transactions';
import Analytics from './components/Analytics';
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

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const fetchTransactions = async () => {
    try {
      const { data } = await getTransactions();
      setTransactions(data);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
      // Fallback to empty if backend fails
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

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
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{
              background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer',
              color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title="Toggle Theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <div className="month-badge">{monthBadge}</div>
        </div>
      </header>
      
      <div className="tabs">
        <div className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Dashboard</div>
        <div className={`tab ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}>+ Add Entry</div>
        <div className={`tab ${activeTab === 'transactions' ? 'active' : ''}`} onClick={() => setActiveTab('transactions')}>Transactions</div>
        <div className={`tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>Analytics</div>
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
              <AddEntry onAddSuccess={() => { fetchTransactions(); setActiveTab('dashboard'); }} />
            </div>
            
            <div className={`page ${activeTab === 'transactions' ? 'active' : ''}`}>
              <Transactions transactions={transactions} onDelete={handleDelete} />
            </div>
            
            <div className={`page ${activeTab === 'analytics' ? 'active' : ''}`}>
              <Analytics transactions={transactions} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
