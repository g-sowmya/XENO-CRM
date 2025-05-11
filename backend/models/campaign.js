const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  segmentRules: { type: Object, required: true }, // JSON object representing audience segment rules
  createdBy: { type: String, required: true }, // user id or email
  createdAt: { type: Date, default: Date.now },
  deliveryStats: {
    sent: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    audienceSize: { type: Number, default: 0 },
  },
});

module.exports = mongoose.model('Campaign', campaignSchema);
