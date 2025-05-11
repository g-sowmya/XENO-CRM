const express = require('express');
const router = express.Router();
const { ingestCustomer, ingestOrder } = require('../services/dataIngestionService');
const { ensureAuthenticated } = require('../services/authService');

// Customer data ingestion
router.post('/customers', ensureAuthenticated, async (req, res) => {
  try {
    await ingestCustomer(req.body);
    res.status(201).json({ message: 'Customer data ingested successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Order data ingestion
router.post('/orders', ensureAuthenticated, async (req, res) => {
  try {
    await ingestOrder(req.body);
    res.status(201).json({ message: 'Order data ingested successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
