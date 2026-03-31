import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { fmt, getCatIcon, CAT_COLORS } from '../utils';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function Analytics({ transactions }) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  const [reportMonth, setReportMonth] = useState(currentMonth.toString());
  const [reportYear, setReportYear] = useState(currentYear.toString());

  const availableYears = useMemo(() => {
    const years = transactions.map(t => new Date(t.date).getFullYear());
    const uniqueYears = [...new Set(years)];
    if (!uniqueYears.includes(currentYear)) uniqueYears.push(currentYear);
    return uniqueYears.sort((a, b) => b - a);
  }, [transactions, currentYear]);

  // Filter transactions exactly to the selected month
  const monthTxns = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear().toString() === reportYear && d.getMonth().toString() === reportMonth;
    });
  }, [transactions, reportMonth, reportYear]);

  const expTxns = monthTxns.filter(t => t.type === 'expense');
  
  const cats = {};
  expTxns.forEach(t => { cats[t.category] = (cats[t.category] || 0) + t.amount; });
  const totalExp = Object.values(cats).reduce((a, b) => a + b, 0);
  const sortedCats = Object.entries(cats).sort((a, b) => b[1] - a[1]);

  // Daily Trend Data
  const dailyChartData = useMemo(() => {
    const daysInMonth = new Date(parseInt(reportYear), parseInt(reportMonth) + 1, 0).getDate();
    const daily = {};
    for(let i = 1; i <= daysInMonth; i++) daily[i] = { income: 0, expense: 0 };
    
    monthTxns.forEach(t => {
      const parts = t.date.split('-');
      if (parts.length === 3) {
        const day = parseInt(parts[2], 10);
        if (daily[day]) {
          daily[day][t.type] += t.amount;
        }
      }
    });

    const labels = Object.keys(daily);
    return {
      labels,
      datasets: [
        {
          label: 'Income',
          data: labels.map(day => daily[day].income),
          borderColor: '#c8f060',
          backgroundColor: 'rgba(200,240,96,0.08)',
          tension: 0.3,
          pointRadius: 0,
          pointHitRadius: 10,
          borderWidth: 2
        },
        {
          label: 'Expenses',
          data: labels.map(day => daily[day].expense),
          borderColor: '#f06090',
          backgroundColor: 'rgba(240,96,144,0.08)',
          tension: 0.3,
          pointRadius: 0,
          pointHitRadius: 10,
          borderWidth: 2
        }
      ]
    };
  }, [monthTxns, reportMonth, reportYear]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", margin: 0, fontSize: '24px' }}>{MONTHS[reportMonth]} Analytics</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select value={reportMonth} onChange={e => setReportMonth(e.target.value)} style={{ padding: '8px 12px' }}>
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select value={reportYear} onChange={e => setReportYear(e.target.value)} style={{ padding: '8px 12px' }}>
            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="dash-grid">
        <div className="panel">
          <div className="panel-title">Category Breakdown</div>
          {sortedCats.length > 0 ? (
            <div style={{ maxHeight: '220px', overflowY: 'auto', paddingRight: '8px' }}>
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
              No expenses this month
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-title">Daily Trend</div>
          <div style={{ height: '220px', width: '100%', position: 'relative' }}>
            <Line
              data={dailyChartData}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#888', font: { size: 11 }, boxWidth: 10 } } },
                scales: {
                  x: { ticks: { color: '#888', maxTicksLimit: 10 }, grid: { display: false } },
                  y: { ticks: { color: '#888', callback: v => '₹' + v.toLocaleString('en-IN') }, grid: { color: '#2e2e2e' } }
                }
              }}
            />
          </div>
        </div>

        <div className="panel wide">
          <div className="panel-title">Category Summary</div>
          {sortedCats.length > 0 ? (
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
          ) : (
            <div className="empty">
              <div className="empty-icon">📂</div>
              No transactions recorded for this month
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Analytics;
