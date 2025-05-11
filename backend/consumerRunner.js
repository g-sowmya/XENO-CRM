const { processCustomerStream, processOrderStream } = require('./services/consumerService');

async function startConsumers() {
  console.log('Starting Redis Stream consumers...');
  processCustomerStream();
  processOrderStream();
}

startConsumers().catch(err => {
  console.error('Error starting consumers:', err);
  process.exit(1);
});
