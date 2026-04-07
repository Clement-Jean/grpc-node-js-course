const fs = require('fs');
const grpc = require('@grpc/grpc-js');
const {GreetRequest} = require('../proto/greet_pb');
const {GreetServiceClient} = require('../proto/greet_grpc_pb');
const {DATA} = require('../../constants');

// eslint-disable-next-line no-unused-vars
function doGreet(client) {
  console.log('doGreet was invoked');
  const req = new GreetRequest()
      .setFirstName('Clement');

  client.greet(req, (err, res) => {
    if (err) {
      return console.log(err);
    }

    console.log(`Greet: ${res.getResult()}`);
    client.close();
  });
}

// eslint-disable-next-line no-unused-vars
function doGreetManyTimes(client) {
  console.log('doGreetManyTimes was invoked');
  const req = new GreetRequest()
      .setFirstName('Clement');
  const call = client.greetManyTimes(req);

  call.on(DATA, (res) => {
    console.log(`GreetManyTimes: ${res.getResult()}`);
  });
}

// eslint-disable-next-line no-unused-vars
function doLongGreet(client) {
  console.log('doLongGreet was invoked');
  const names = ['Clement', 'Marie', 'Test'];
  const call = client.longGreet((err, res) => {
    if (err) {
      return console.error(err);
    }

    console.log(`LongGreet: ${res.getResult()}`);
  });

  names.map((name) => {
    return new GreetRequest().setFirstName(name);
  }).forEach((req) => call.write(req));

  call.end();
}

// eslint-disable-next-line no-unused-vars
function doGreetEveryone(client) {
  console.log('doGreetEveryone was invoked');
  const names = ['Clement', 'Marie', 'Test'];
  const call = client.greetEveryone();

  call.on(DATA, (res) => {
    console.log(`GreetEveryone: ${res.getResult()}`);
  });

  names.map((name) => {
    return new GreetRequest().setFirstName(name);
  }).forEach((req) => call.write(req));

  call.end();
}

// eslint-disable-next-line no-unused-vars
function doGreetWithDeadline(client, ms) {
  console.log('doGreetWithDeadline was invoked');
  const req = new GreetRequest()
      .setFirstName('Clement');

  client.greetWithDeadline(req, {
    deadline: new Date(Date.now() + ms),
  }, (err, res) => {
    if (err) {
      return console.log(err);
    }

    console.log(`GreetWithDeadline: ${res.getResult()}`);
  });
}

function main() {
  const tls = true;
  let creds;

  if (tls) {
    const rootCert = fs.readFileSync('./ssl/ca.crt');

    creds = grpc.ChannelCredentials.createSsl(rootCert);
  } else {
    creds = grpc.ChannelCredentials.createInsecure();
  }

  const client = new GreetServiceClient(
      'localhost:50051',
      creds,
  );

  doGreet(client);
  // doGreetManyTimes(client);
  // doLongGreet(client);
  // doGreetEveryone(client);
  // doGreetWithDeadline(client, 5000);
  // doGreetWithDeadline(client, 1000);
  // client.close();
}

main();
