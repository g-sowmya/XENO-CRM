const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  totalSpend: { type: Number, default: 0 },
  visits: { type: Number, default: 0 },
  lastPurchaseDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Customer', customerSchema);
