const redis = require('redis');
const Customer = require('../models/customer');
const Order = require('../models/order');
require('dotenv').config();

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});
redisClient.connect();

async function processCustomerStream() {
  let lastId = '0-0';
  while (true) {
    try {
      const streams = await redisClient.xRead(
        [{ key: 'customer_stream', id: lastId }],
        { BLOCK: 0, COUNT: 10 }
      );
      if (streams) {
        for (const stream of streams) {
          for (const message of stream.messages) {
            lastId = message.id;
            const data = JSON.parse(message.message.data);
            // Save to MongoDB
            await Customer.updateOne(
              { email: data.email },
              { $set: data },
              { upsert: true }
            );
          }
        }
      }
    } catch (error) {
      console.error('Error processing customer stream:', error);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

async function processOrderStream() {
  let lastId = '0-0';
  while (true) {
    try {
      const streams = await redisClient.xRead(
        [{ key: 'order_stream', id: lastId }],
        { BLOCK: 0, COUNT: 10 }
      );
      if (streams) {
        for (const stream of streams) {
          for (const message of stream.messages) {
            lastId = message.id;
            const data = JSON.parse(message.message.data);
            // Save to MongoDB
            await Order.create(data);
          }
        }
      }
    } catch (error) {
      console.error('Error processing order stream:', error);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

module.exports = {
  processCustomerStream,
  processOrderStream,
};
