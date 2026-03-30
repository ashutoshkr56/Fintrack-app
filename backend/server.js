const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Income = require('./models/Income');
const Expense = require('./models/Expense');

const app = express();
app.use(cors());
app.use(express.json());

const authRouter = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

app.use('/api/auth', authRouter);

// Routes
// GET all transactions
app.get('/api/transactions', authMiddleware, async (req, res) => {
  try {
    const incomes = await Income.find({ user: req.user.id });
    const expenses = await Expense.find({ user: req.user.id });
    const transactions = [...incomes, ...expenses].sort((a, b) => {
      // Sort by date descending, then secondary condition if needed
      return new Date(b.date) - new Date(a.date);
    });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new transaction
app.post('/api/transactions', authMiddleware, async (req, res) => {
  try {
    const { type, ...rest } = req.body;
    let savedTransaction;
    if (type === 'income') {
      const newIncome = new Income({ ...rest, user: req.user.id });
      savedTransaction = await newIncome.save();
    } else {
      const newExpense = new Expense({ ...rest, user: req.user.id });
      savedTransaction = await newExpense.save();
    }
    res.status(201).json(savedTransaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a transaction
app.delete('/api/transactions/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    let transaction = await Income.findById(id);
    if (transaction) {
      if (transaction.user.toString() !== req.user.id) return res.status(401).json({ error: 'Unauthorized' });
      await Income.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Transaction deleted' });
    }
    
    transaction = await Expense.findById(id);
    if (transaction) {
      if (transaction.user.toString() !== req.user.id) return res.status(401).json({ error: 'Unauthorized' });
      await Expense.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Transaction deleted' });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fintrack';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Only listen if we are not running in production (Vercel)
    if (process.env.NODE_ENV !== 'production') {
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    }
  })
  .catch((err) => {
    console.log('Failed to connect to MongoDB. Ensure your URI is correct:', err.message);
    if (process.env.NODE_ENV !== 'production') {
        app.listen(PORT, () => console.log(`Server running on port ${PORT} WITHOUT DB`));
    }
  });

// Export the app for Vercel serverless function
module.exports = app;
