const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');

// Ensure SRV records for Atlas resolve cleanly on local networks
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

require('dotenv').config();

const Income = require('./models/Income');
const Expense = require('./models/Expense');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// Cached connection for serverless / Vercel
let isConnected = false;
const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not set in Vercel Environment Variables. Please add MONGO_URI in Vercel Settings.');
  }
  const db = await mongoose.connect(MONGO_URI);
  isConnected = db.connections[0].readyState === 1;
};

// Root health-check route (does not block on DB)
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'FinTrack Backend API is running',
    dbConnected: mongoose.connection.readyState === 1,
    hasMongoUri: !!MONGO_URI
  });
});

// Middleware to ensure DB is connected before processing API requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection error:', err.message);
    return res.status(500).json({
      error: 'Database connection failed: ' + err.message,
      message: 'Database connection failed: ' + err.message
    });
  }
});

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

// UPDATE a transaction
app.put('/api/transactions/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const { type, amount, date, category, description } = req.body;
    
    // Find where the transaction currently lives
    let isIncome = await Income.findById(id);
    let isExpense = null;
    if (!isIncome) {
      isExpense = await Expense.findById(id);
    }
    
    const oldTransaction = isIncome || isExpense;
    if (!oldTransaction) return res.status(404).json({ error: 'Not found' });
    if (oldTransaction.user.toString() !== req.user.id) return res.status(401).json({ error: 'Unauthorized' });

    const oldType = isIncome ? 'income' : 'expense';

    if (oldType === type) {
      // Standard update
      const updateData = { amount, date, category, description };
      if (oldType === 'income') {
        const updated = await Income.findByIdAndUpdate(id, updateData, { new: true });
        return res.json(updated);
      } else {
        const updated = await Expense.findByIdAndUpdate(id, updateData, { new: true });
        return res.json(updated);
      }
    } else {
      // Type changed, delete from old and insert to new collection
      const newData = { amount, date, category, description, user: req.user.id };
      if (oldType === 'income') {
        await Income.findByIdAndDelete(id);
        const newExpense = new Expense(newData);
        const saved = await newExpense.save();
        return res.json(saved);
      } else {
        await Expense.findByIdAndDelete(id);
        const newIncome = new Income(newData);
        const saved = await newIncome.save();
        return res.json(saved);
      }
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
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

// Only listen when running standalone locally (not on Vercel production serverless)
if (process.env.NODE_ENV !== 'production') {
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }).catch((err) => {
    console.log(`Server running on port ${PORT} WITHOUT DB:`, err.message);
    app.listen(PORT);
  });
}

// Export the app for Vercel serverless function
module.exports = app;
