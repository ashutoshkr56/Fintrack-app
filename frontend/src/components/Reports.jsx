import React, { useState, useMemo } from 'react';
import { fmt } from '../utils';

// Helper to generate CSV and trigger download
const downloadCSV = (transactions, filename) => {
  // Headers
  const headers = ['Date', 'Type', 'Category', 'Amount', 'Description'];
  const rows = transactions.map(t => {
    const [y, m, d] = t.date.split('-');
    const formattedDate = `${d}/${m}/${y}`;
    return [
      formattedDate,
      t.type,
      t.category,
      t.amount.toString(),
      `"${(t.description || '').replace(/"/g, '""')}"`
    ];
  });
  
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function Reports({ transactions }) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  const [reportMonth, setReportMonth] = useState(currentMonth.toString());
  const [reportMonthYear, setReportMonthYear] = useState(currentYear.toString());
  const [reportYear, setReportYear] = useState(currentYear.toString());
  
  // Extract all available years from transactions to populate dropdowns
  const availableYears = useMemo(() => {
    const years = transactions.map(t => new Date(t.date).getFullYear());
    const uniqueYears = [...new Set(years)];
    if (!uniqueYears.includes(currentYear)) uniqueYears.push(currentYear);
    return uniqueYears.sort((a, b) => b - a); // descending
  }, [transactions, currentYear]);

  // Aggregate functions
  const calcStats = (txList) => {
    let income = 0;
    let exp = 0;
    txList.forEach(t => {
      if (t.type === 'income') income += t.amount;
      if (t.type === 'expense') exp += t.amount;
    });
    const net = income - exp;
    const saveRate = income > 0 ? Math.max(0, ((net / income) * 100)).toFixed(0) : 0;
    
    // Also active months for yearly 
    const monthsSet = new Set(txList.map(t => new Date(t.date).getMonth()));
    
    return { income, exp, net, saveRate, count: txList.length, activeMonths: monthsSet.size };
  };

  // Monthly logic
  const monthlyTx = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear().toString() === reportMonthYear && d.getMonth().toString() === reportMonth;
    });
  }, [transactions, reportMonth, reportMonthYear]);
  
  const mStats = useMemo(() => calcStats(monthlyTx), [monthlyTx]);

  // Yearly logic
  const yearlyTx = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear().toString() === reportYear;
    });
  }, [transactions, reportYear]);
  
  const yStats = useMemo(() => calcStats(yearlyTx), [yearlyTx]);

  return (
    <div className="reports-container">
      {/* Monthly Report Card */}
      <div className="report-card monthly-card">
        <div className="report-icon">📅</div>
        <h2>Monthly Report</h2>
        <p className="report-desc">Download a full breakdown of income, expenses, and savings for any specific month as a CSV file.</p>
        
        <div className="report-controls">
          <select value={reportMonth} onChange={e => setReportMonth(e.target.value)}>
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select value={reportMonthYear} onChange={e => setReportMonthYear(e.target.value)}>
            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        
        <div className="report-actions">
          <button className="btn-report btn-primary" onClick={() => downloadCSV(monthlyTx, `Monthly_Report_${MONTHS[reportMonth]}_${reportMonthYear}.csv`)}>
            ↓ Download CSV
          </button>
          <button className="btn-report btn-secondary" onClick={() => window.print()}>🖨 Print</button>
        </div>
        
        <div className="report-preview">
          <div className="preview-header">PREVIEW — {MONTHS[reportMonth].toUpperCase()} {reportMonthYear}</div>
          <div className="preview-row"><span>Total Income</span> <span className="inc">{fmt(mStats.income)}</span></div>
          <div className="preview-row"><span>Total Expenses</span> <span className="exp">{fmt(mStats.exp)}</span></div>
          <div className="preview-row"><span>Net Balance</span> <span className="net">{fmt(mStats.net)}</span></div>
          <div className="preview-row"><span>Savings Rate</span> <span>{mStats.saveRate}%</span></div>
          <div className="preview-row"><span>Transactions</span> <span>{mStats.count}</span></div>
        </div>
      </div>
      
      {/* Yearly Report Card */}
      <div className="report-card yearly-card">
        <div className="report-icon">📅</div>
        <h2>Yearly Report</h2>
        <p className="report-desc">Download a complete annual summary with month-by-month breakdown, totals, and category-wise spending.</p>
        
        <div className="report-controls">
          <select value={reportYear} onChange={e => setReportYear(e.target.value)}>
            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        
        <div className="report-actions">
          <button className="btn-report btn-primary" onClick={() => downloadCSV(yearlyTx, `Yearly_Report_${reportYear}.csv`)}>
            ↓ Download CSV
          </button>
          <button className="btn-report btn-secondary" onClick={() => window.print()}>🖨 Print</button>
        </div>
        
        <div className="report-preview">
          <div className="preview-header">PREVIEW — {reportYear}</div>
          <div className="preview-row"><span>Total Income</span> <span className="inc">{fmt(yStats.income)}</span></div>
          <div className="preview-row"><span>Total Expenses</span> <span className="exp">{fmt(yStats.exp)}</span></div>
          <div className="preview-row"><span>Net Balance</span> <span className="net">{fmt(yStats.net)}</span></div>
          <div className="preview-row"><span>Savings Rate</span> <span>{yStats.saveRate}%</span></div>
          <div className="preview-row"><span>Transactions</span> <span>{yStats.count}</span></div>
          <div className="preview-row"><span>Active Months</span> <span>{yStats.activeMonths}</span></div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
