const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  orderDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
