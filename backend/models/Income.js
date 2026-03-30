const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: String,   // Store as YYYY-MM-DD
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Convert _id to id when sending JSON to match frontend expectations
incomeSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    ret.type = 'income'; // Dynamically add type for frontend
  }
});

module.exports = mongoose.model('Income', incomeSchema);
