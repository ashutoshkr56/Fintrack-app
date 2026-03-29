import React from 'react';
import { Line } from 'react-chartjs-2';
import { fmt, getCatIcon, CAT_COLORS } from '../utils';

function Analytics({ transactions }) {
  const expTxns = transactions.filter(t => t.type === 'expense');
  
  const cats = {};
  expTxns.forEach(t => { cats[t.category] = (cats[t.category] || 0) + t.amount; });
  const totalExp = Object.values(cats).reduce((a, b) => a + b, 0);
  const sortedCats = Object.entries(cats).sort((a, b) => b[1] - a[1]);

  const monthly = {};
  transactions.forEach(t => {
    const ym = t.date.slice(0, 7);
    if (!monthly[ym]) monthly[ym] = { income: 0, expense: 0 };
    monthly[ym][t.type] += t.amount;
  });
  
  const months = Object.keys(monthly).sort();
  
  const lineChartData = {
    labels: months.map(m => new Date(m + '-01').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })),
    datasets: [
      {
        label: 'Income',
        data: months.map(m => monthly[m].income),
        borderColor: '#c8f060',
        backgroundColor: 'rgba(200,240,96,0.08)',
        tension: 0.4,
        pointRadius: 4
      },
      {
        label: 'Expenses',
        data: months.map(m => monthly[m].expense),
        borderColor: '#f06090',
        backgroundColor: 'rgba(240,96,144,0.08)',
        tension: 0.4,
        pointRadius: 4
      }
    ]
  };

  return (
    <div className="dash-grid">
      <div className="panel">
        <div className="panel-title">Category Breakdown</div>
        {sortedCats.length > 0 ? (
          <div>
            {sortedCats.map(([name, val], i) => {
              const pct = totalExp > 0 ? Math.round((val / totalExp) * 100) : 0;
              const col = CAT_COLORS[i % CAT_COLORS.length];
              return (
                <div className="prog-item" key={name}>
                  <div className="prog-header">
                    <span>{getCatIcon(name)} {name}</span>
                    <span style={{ color: col }}>{fmt(val)} ({pct}%)</span>
                  </div>
                  <div className="prog-bar-bg">
                    <div className="prog-bar" style={{ width: `${pct}%`, background: col }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty">
            <div className="empty-icon">📊</div>
            Add expenses to see analytics
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-title">Monthly Trend</div>
        <div style={{ maxHeight: '220px', display: 'flex', justifyContent: 'center' }}>
          <Line
            data={lineChartData}
            options={{
              maintainAspectRatio: false,
              plugins: { legend: { labels: { color: '#888', font: { size: 11 }, boxWidth: 10 } } },
              scales: {
                x: { ticks: { color: '#888' }, grid: { color: '#2e2e2e' } },
                y: { ticks: { color: '#888', callback: v => '₹' + v.toLocaleString('en-IN') }, grid: { color: '#2e2e2e' } }
              }
            }}
          />
        </div>
      </div>

      <div className="panel wide">
        <div className="panel-title">Category Summary</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '12px' }}>
          {sortedCats.map(([name, val], i) => {
            const col = CAT_COLORS[i % CAT_COLORS.length];
            return (
              <div key={name} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '22px', marginBottom: '6px' }}>{getCatIcon(name)}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>{name}</div>
                <div style={{ fontSize: '18px', fontFamily: "'DM Serif Display',serif", color: col }}>{fmt(val)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Analytics;
