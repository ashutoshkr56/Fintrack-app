import React, { useState, useMemo } from 'react';
import { fmt, getCatIcon, CATS } from '../utils';
import { updateTransaction } from '../api';

function Transactions({ transactions, onDelete, onEditSuccess, user }) {
  const [filterType, setFilterType] = useState('all');
  const [filterCat, setFilterCat] = useState('all');
  const [viewType, setViewType] = useState('list'); // 'list' or 'monthly'

  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const allCategories = useMemo(() => {
    const base = [...CATS.income, ...CATS.expense].map(c => c.name);
    const userCats = user?.categories || [];
    const txCats = transactions.map(t => t.category);
    return [...new Set([...base, ...userCats, ...txCats])];
  }, [transactions, user]);

  const filtered = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterCat !== 'all' && t.category !== filterCat) return false;
    return true;
  });

  const handleEditClick = (tx) => {
    setEditingId(tx.id);
    setEditFormData({ ...tx });
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    try {
      const parsedAmount = parseFloat(editFormData.amount);
      if (!parsedAmount || parsedAmount <= 0) return alert('Invalid amount');
      
      await updateTransaction(editingId, {
        ...editFormData,
        amount: parsedAmount
      });
      setEditingId(null);
      if (onEditSuccess) onEditSuccess();
    } catch (err) {
      alert('Failed to update transaction');
    }
  };

  const monthlyData = useMemo(() => {
    const groups = {};
    filtered.forEach(tx => {
      const d = new Date(tx.date);
      const monthYear = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      if (!groups[monthYear]) {
        groups[monthYear] = { income: 0, expense: 0, timestamp: d.getTime() };
      }
      if (tx.type === 'income') groups[monthYear].income += tx.amount;
      else groups[monthYear].expense += tx.amount;
    });

    return Object.entries(groups).sort((a, b) => b[1].timestamp - a[1].timestamp);
  }, [filtered]);

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div className="panel-title" style={{ margin: 0 }}>ALL TRANSACTIONS</div>
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div className="view-toggle">
            <button className={viewType === 'list' ? 'active' : ''} onClick={() => setViewType('list')}>List</button>
            <button className={viewType === 'monthly' ? 'active' : ''} onClick={() => setViewType('monthly')}>Monthly</button>
          </div>

          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="tx-filter-select">
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="tx-filter-select">
            <option value="all">All Categories</option>
            {allCategories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      
      {filtered.length > 0 ? (
        <div className="tx-list" style={{ maxHeight: '480px', overflowY: 'auto' }}>
          {viewType === 'list' ? (
            filtered.map(tx => (
              editingId === tx.id ? (
                <div className="tx-item edit-mode" key={tx.id}>
                  <div className="edit-form-grid">
                    <input type="text" name="description" value={editFormData.description} onChange={handleEditChange} placeholder="Description" />
                    <input type="number" name="amount" value={editFormData.amount} onChange={handleEditChange} placeholder="Amount" />
                    <input type="date" name="date" value={editFormData.date} onChange={handleEditChange} />
                    <select name="type" value={editFormData.type} onChange={handleEditChange}>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                    <select name="category" value={editFormData.category} onChange={handleEditChange}>
                      <option value="">Category</option>
                      {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="edit-actions">
                    <button className="btn-save" onClick={handleEditSave}>Save</button>
                    <button className="btn-cancel" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="tx-item" key={tx.id}>
                  <div className="tx-left">
                    <div className="tx-icon" style={{ background: tx.type === 'income' ? 'rgba(200,240,96,0.12)' : 'rgba(240,96,144,0.12)' }}>
                      {getCatIcon(tx.category)}
                    </div>
                    <div>
                      <div className="tx-desc">{tx.description}</div>
                      <div className="tx-meta">{tx.category} · {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className={`tx-amount ${tx.type === 'income' ? 'inc' : 'exp'}`}>
                      {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                    </div>
                    <div className="tx-actions">
                      <button className="tx-action-btn" onClick={() => handleEditClick(tx)} title="Edit">✎</button>
                      <button className="tx-action-btn delete-btn" onClick={() => onDelete(tx.id)} title="Delete">✕</button>
                    </div>
                  </div>
                </div>
              )
            ))
          ) : (
            <div className="monthly-view-list">
              {monthlyData.map(([month, data]) => (
                <div className="monthly-summary-card" key={month}>
                  <div className="month-title">{month}</div>
                  <div className="month-stats">
                    <div className="stat-col">
                      <span className="stat-label">Income</span>
                      <span className="stat-val inc">{fmt(data.income)}</span>
                    </div>
                    <div className="stat-col">
                      <span className="stat-label">Expense</span>
                      <span className="stat-val exp">{fmt(data.expense)}</span>
                    </div>
                    <div className="stat-col">
                      <span className="stat-label">Net</span>
                      <span className="stat-val net">{fmt(data.income - data.expense)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="empty" id="allTxEmpty">
          <div className="empty-icon">📂</div>
          No transactions found.
        </div>
      )}
    </div>
  );
}

export default Transactions;
