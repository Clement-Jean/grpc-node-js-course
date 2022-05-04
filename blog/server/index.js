const grpc = require('@grpc/grpc-js');
const {MongoClient} = require('mongodb');
const service = require('../proto/blog_grpc_pb');
const serviceImpl = require('./service_impl');

const addr = '0.0.0.0:50051';
const uri = 'mongodb://root:root@localhost:27017/';
const mongoClient = new MongoClient(uri, {
  connectTimeoutMS: 1000,
  serverSelectionTimeoutMS: 1000,
});

global.collection = undefined;

async function cleanup(server) {
  console.log('Cleanup');

  if (server) {
    await mongoClient.close();
    server.forceShutdown();
  }
}

async function main() {
  process.on('SIGINT', () => {
    console.log('Caught interrupt signal');
    cleanup(server);
  });

  await mongoClient.connect();

  const database = mongoClient.db('blogdb');
  collection = database.collection('blog');

  const creds = grpc.ServerCredentials.createInsecure();
  server = new grpc.Server();
  server.addService(service.BlogServiceService, serviceImpl);
  server.bindAsync(addr, creds, (err, _) => {
    if (err) {
      return cleanup(server);
    }

    server.start();
  });

  console.log('Listening on: ' + addr);
}

main().catch(cleanup);
