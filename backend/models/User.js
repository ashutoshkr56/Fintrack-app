const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  categories: {
    type: [String],
    default: ["Food", "Transport", "Entertainment", "Shopping", "Bills", "Rent", "Salary", "Freelance", "Investment", "Other"]
  }
}, { timestamps: true });

// Convert _id to id
userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.password; // Don't return password
  }
});

module.exports = mongoose.model('User', userSchema);
