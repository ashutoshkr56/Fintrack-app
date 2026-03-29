import React, { useState } from 'react';
import { fmt, getCatIcon, CATS } from '../utils';

function Transactions({ transactions, onDelete }) {
  const [filterType, setFilterType] = useState('all');
  const [filterCat, setFilterCat] = useState('all');

  const allCategories = [...CATS.income, ...CATS.expense];

  const filtered = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterCat !== 'all' && t.category !== filterCat) return false;
    return true;
  });

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div className="panel-title" style={{ margin: 0 }}>All Transactions</div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ padding: '6px 10px', fontSize: '12px' }}>
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ padding: '6px 10px', fontSize: '12px' }}>
            <option value="all">All Categories</option>
            {allCategories.map(c => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      {filtered.length > 0 ? (
        <div className="tx-list" style={{ maxHeight: '420px' }}>
          {filtered.map(tx => (
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
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className={`tx-amount ${tx.type === 'income' ? 'inc' : 'exp'}`}>
                  {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                </div>
                <button className="tx-delete" onClick={() => onDelete(tx.id)}>✕</button>
              </div>
            </div>
          ))}
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
