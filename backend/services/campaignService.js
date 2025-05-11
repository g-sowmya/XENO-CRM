const Campaign = require('../models/campaign');
const Customer = require('../models/customer');
const CommunicationLog = require('../models/communicationLog');
const axios = require('axios');

// Helper function to simulate sending message to dummy vendor API
async function sendMessageToVendor(customer, message, campaignId) {
  // Simulate ~90% success, ~10% failure
  const isSuccess = Math.random() < 0.9;
  const status = isSuccess ? 'sent' : 'failed';

  // Simulate async call to vendor API
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Simulate calling delivery receipt API on backend
  await axios.post('http://localhost:5000/api/campaigns/delivery-receipt', {
    campaignId,
    customerId: customer._id,
    status,
    deliveryTimestamp: new Date(),
  });

  return status;
}

// Function to evaluate segment rules and return matching customers
// For simplicity, assume segmentRules is an object with conditions on totalSpend, visits, lastPurchaseDate
async function getAudience(segmentRules) {
  // Build MongoDB query based on segmentRules
  // This is a simplified example; real implementation would parse complex rules
  const query = {};

  if (segmentRules.totalSpend) {
    if (segmentRules.totalSpend.gt !== undefined) {
      query.totalSpend = { $gt: segmentRules.totalSpend.gt };
    }
  }
  if (segmentRules.visits) {
    if (segmentRules.visits.lt !== undefined) {
      query.visits = { $lt: segmentRules.visits.lt };
    }
  }
  if (segmentRules.inactiveDays) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - segmentRules.inactiveDays);
    query.lastPurchaseDate = { $lt: cutoffDate };
  }

  const customers = await Customer.find(query);
  return customers;
}

async function createCampaign(campaignData, user) {
  const { name, segmentRules, messageTemplate } = campaignData;
  if (!name || !segmentRules || !messageTemplate) {
    throw new Error('Campaign name, segmentRules, and messageTemplate are required');
  }

  // Get audience based on segment rules
  const audience = await getAudience(segmentRules);

  // Create campaign document
  const campaign = new Campaign({
    name,
    segmentRules,
    createdBy: user.id || user.emails[0].value,
    deliveryStats: {
      sent: 0,
      failed: 0,
      audienceSize: audience.length,
    },
  });
  await campaign.save();

  // Send personalized messages and log communication
  let sentCount = 0;
  let failedCount = 0;

  for (const customer of audience) {
    const personalizedMessage = messageTemplate.replace('{name}', customer.name);
    const status = await sendMessageToVendor(customer, personalizedMessage, campaign._id);

    const logEntry = new CommunicationLog({
      campaignId: campaign._id,
      customerId: customer._id,
      message: personalizedMessage,
      status,
      deliveryTimestamp: new Date(),
    });
    await logEntry.save();

    if (status === 'sent') sentCount++;
    else failedCount++;
  }

  // Update campaign delivery stats
  campaign.deliveryStats.sent = sentCount;
  campaign.deliveryStats.failed = failedCount;
  await campaign.save();

  return campaign;
}

async function getCampaignHistory(user) {
  const campaigns = await Campaign.find({ createdBy: user.id || user.emails[0].value })
    .sort({ createdAt: -1 });
  return campaigns;
}

async function receiveDeliveryReceipt(receiptData) {
  const { campaignId, customerId, status, deliveryTimestamp } = receiptData;
  if (!campaignId || !customerId || !status) {
    throw new Error('campaignId, customerId, and status are required');
  }

  // Update communication log entry
  await CommunicationLog.findOneAndUpdate(
    { campaignId, customerId },
    { status, deliveryTimestamp },
  );
}

module.exports = {
  createCampaign,
  getCampaignHistory,
  receiveDeliveryReceipt,
};
