const assert = require('assert');
const grpc = require('@grpc/grpc-js');

exports.TestGrpcHelper = class {
  constructor() {
    this.server = null;
    this.client = null;
  }

  start(ClientType, serviceType, serviceImpl) {
    this.server = new grpc.Server();
    this.server.addService(serviceType, serviceImpl);
    this.server.bindAsync(
        '0.0.0.0:0',
        grpc.ServerCredentials.createInsecure(),
        (err, port) => {
          assert.ifError(err);
          this.client = new ClientType(
              `0.0.0.0:${port}`,
              grpc.credentials.createInsecure(),
          );
          this.server.start();
        },
    );
  }

  stop() {
    this.client.close();
    this.server.forceShutdown();
  }
};
