const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Transaction = require('./models/Transaction');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
// GET all transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1, _id: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const newTransaction = new Transaction(req.body);
    const savedTransaction = await newTransaction.save();
    res.status(201).json(savedTransaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a transaction
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Transaction deleted' });
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
