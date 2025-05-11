const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../services/authService');
const {
  createCampaign,
  getCampaignHistory,
  receiveDeliveryReceipt,
} = require('../services/campaignService');

// Create a new campaign
router.post('/campaigns', ensureAuthenticated, async (req, res) => {
  try {
    const campaign = await createCampaign(req.body, req.user);
    res.status(201).json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get campaign history
router.get('/campaigns/history', ensureAuthenticated, async (req, res) => {
  try {
    const history = await getCampaignHistory(req.user);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delivery receipt API
router.post('/campaigns/delivery-receipt', async (req, res) => {
  try {
    await receiveDeliveryReceipt(req.body);
    res.status(200).json({ message: 'Delivery receipt processed' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
