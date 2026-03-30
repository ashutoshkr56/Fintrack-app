import React, { useState } from 'react';
import { CATS } from '../utils';
import { addTransaction, addCategory } from '../api';

function AddEntry({ onAddSuccess, user, setUser }) {
  const [type, setType] = useState('income');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const { data } = await addCategory(newCatName.trim());
      setUser({ ...user, categories: data.categories });
      localStorage.setItem('user', JSON.stringify({ ...user, categories: data.categories }));
      setCategory(newCatName.trim());
      setIsAddingCategory(false);
      setNewCatName('');
    } catch (err) {
      alert('Failed to add category');
    }
  };

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return alert('Please enter a valid amount.');
    if (!date) return alert('Please select a date.');
    if (!category) return alert('Please select a category.');
    if (!description.trim()) return alert('Please add a description.');

    try {
      await addTransaction({
        type,
        amount: parsedAmount,
        date,
        category,
        description: description.trim()
      });
      setAmount('');
      setDescription('');
      onAddSuccess();
    } catch (err) {
      alert('Failed to add transaction. Is the backend running?');
    }
  };

  return (
    <div className="panel" style={{ maxWidth: '560px', margin: '0 auto' }}>
      <div className="panel-title">New Transaction</div>
      <div className="form-grid">
        <div className="form-group full">
          <label>Type</label>
          <div className="type-toggle">
            <div
              className={`type-btn ${type === 'income' ? 'active inc' : ''}`}
              onClick={() => { setType('income'); setCategory(''); }}
            >
              ↑ Income
            </div>
            <div
              className={`type-btn ${type === 'expense' ? 'active exp' : ''} exp`}
              onClick={() => { setType('expense'); setCategory(''); }}
            >
              ↓ Expense
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <label>Amount (₹)</label>
          <input
            type="number"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>Category</label>
          {!isAddingCategory ? (
            <select 
              value={category} 
              onChange={(e) => {
                if (e.target.value === 'ADD_NEW') setIsAddingCategory(true);
                else setCategory(e.target.value);
              }}
            >
              <option value="">Select category</option>
              {CATS[type].map(c => (
                <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
              ))}
              <optgroup label="Custom Categories">
                {user?.categories?.filter(c => !CATS[type].find(dc => dc.name === c)).map(c => (
                  <option key={c} value={c}>💳 {c}</option>
                ))}
                <option value="ADD_NEW">+ Add New Category</option>
              </optgroup>
            </select>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                placeholder="New category..." 
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                autoFocus
              />
              <button 
                className="btn-submit" 
                style={{ width: 'auto', padding: '0 15px', background: 'var(--success)' }}
                onClick={handleCreateCategory}
              >
                Add
              </button>
              <button 
                className="btn-submit" 
                style={{ width: 'auto', padding: '0 15px', background: 'var(--surface2)', color: 'var(--text)' }}
                onClick={() => setIsAddingCategory(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <input
            type="text"
            placeholder="e.g. Grocery shopping"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>
      
      <button className="btn-submit" onClick={handleSubmit}>Add Transaction</button>
    </div>
  );
}

export default AddEntry;
