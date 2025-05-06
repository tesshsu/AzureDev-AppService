const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'stock-api-usage-consumer',
  brokers: ['50.85.95.49:9092'], // Replace with kafka LoadBalancer EXTERNAL-IP
});

const consumer = kafka.consumer({ groupId: 'stock-usage-monitoring-group' });

const runConsumer = async () => {
  await consumer.connect();
  console.log('Kafka Consumer connected');

  await consumer.subscribe({ topic: 'stock-api-usage', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const usageData = JSON.parse(message.value.toString());
      console.log(`API Usage: ${usageData.method} ${usageData.route} - Status: ${usageData.status} at ${usageData.timestamp} (User-Agent: ${usageData.userAgent})`);
    },
  });
};

runConsumer().catch(console.error);