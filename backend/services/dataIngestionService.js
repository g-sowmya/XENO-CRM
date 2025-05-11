const redis = require('redis');
const { promisify } = require('util');
require('dotenv').config();

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});
redisClient.connect();

async function ingestCustomer(customerData) {
  // Basic validation
  if (!customerData.name || !customerData.email) {
    throw new Error('Customer name and email are required');
  }
  // Publish to Redis Stream for async processing
  await redisClient.xAdd('customer_stream', '*', {
    data: JSON.stringify(customerData),
  });
}

async function ingestOrder(orderData) {
  // Basic validation
  if (!orderData.customerId || !orderData.orderDate || !orderData.amount) {
    throw new Error('Order customerId, orderDate, and amount are required');
  }
  // Publish to Redis Stream for async processing
  await redisClient.xAdd('order_stream', '*', {
    data: JSON.stringify(orderData),
  });
}

module.exports = {
  ingestCustomer,
  ingestOrder,
};
