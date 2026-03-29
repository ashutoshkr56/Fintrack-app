import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { fmt, getCatIcon, CAT_COLORS } from '../utils';

function Dashboard({ transactions, onDelete }) {
  const inc = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const exp = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const bal = inc - exp;
  const rate = inc > 0 ? Math.round((bal / inc) * 100) : 0;

  const recent = transactions.slice(0, 5);
  const expTxns = transactions.filter(t => t.type === 'expense');
  
  const cats = {};
  expTxns.forEach(t => { cats[t.category] = (cats[t.category] || 0) + t.amount; });
  const pieLabels = Object.keys(cats);
  const pieData = Object.values(cats);

  const pieChartData = {
    labels: pieLabels,
    datasets: [{
      data: pieData,
      backgroundColor: CAT_COLORS.slice(0, pieLabels.length),
      borderWidth: 0,
      hoverOffset: 6
    }]
  };

  const barChartData = {
    labels: ['Income', 'Expenses', 'Balance'],
    datasets: [{
      data: [inc, exp, Math.max(0, bal)],
      backgroundColor: ['rgba(200,240,96,0.7)', 'rgba(240,96,144,0.7)', 'rgba(96,200,240,0.7)'],
      borderRadius: 6,
      borderSkipped: false,
    }]
  };

  return (
    <div>
      <div className="cards">
        <div className="card income">
          <div className="card-label">Total Income</div>
          <div className="card-value">{fmt(inc)}</div>
          <div className="card-sub">{transactions.filter(t => t.type === 'income').length} transactions</div>
        </div>
        <div className="card expense">
          <div className="card-label">Total Expenses</div>
          <div className="card-value">{fmt(exp)}</div>
          <div className="card-sub">{transactions.filter(t => t.type === 'expense').length} transactions</div>
        </div>
        <div className="card balance">
          <div className="card-label">Net Balance</div>
          <div className="card-value" style={{ color: bal >= 0 ? 'var(--accent2)' : 'var(--expense)' }}>{fmt(bal)}</div>
          <div className="card-sub">Savings rate: {rate}%</div>
        </div>
      </div>
      
      <div className="dash-grid">
        <div className="panel">
          <div className="panel-title">Expense by Category</div>
          {pieLabels.length ? (
            <div style={{ maxHeight: '220px', display: 'flex', justifyContent: 'center' }}>
              <Doughnut data={pieChartData} options={{ maintainAspectRatio: false, plugins: { legend: { labels: { color: '#888', font: { size: 11 }, boxWidth: 12 } } }, cutout: '62%' }} />
            </div>
          ) : (
            <div className="empty">
              <div className="empty-icon">🍩</div>
              Add expenses to see breakdown
            </div>
          )}
        </div>
        
        <div className="panel">
          <div className="panel-title">Income vs Expense</div>
          <div style={{ maxHeight: '220px', display: 'flex', justifyContent: 'center' }}>
            <Bar data={barChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#888' }, grid: { color: '#2e2e2e' } }, y: { ticks: { color: '#888', callback: v => '₹' + v.toLocaleString('en-IN') }, grid: { color: '#2e2e2e' } } } }} />
          </div>
        </div>
        
        <div className="panel wide">
          <div className="panel-title">Recent Transactions</div>
          {recent.length ? (
            <div className="tx-list">
              {recent.map(tx => (
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
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">
              <div className="empty-icon">📋</div>
              No transactions yet. Add your first entry!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
