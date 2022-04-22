const grpc = require('@grpc/grpc-js');
const service = require('../proto/calculator_grpc_pb');
const {SumRequest} = require('../proto/sum_pb');
const {PrimeRequest} = require('../proto/primes_pb');
const {AvgRequest} = require('../proto/avg_pb');
const {MaxRequest} = require('../proto/max_pb');
const {SqrtRequest} = require('../proto/sqrt_pb');
const {DATA} = require('../../constants');

// eslint-disable-next-line no-unused-vars
function doSum(client) {
  console.log('doSum was invoked');
  const req = new SumRequest()
      .setFirstNumber(1)
      .setSecondNumber(1);

  client.sum(req, (err, res) => {
    if (err) {
      return console.log(err);
    }

    console.log('Sum: ', res.getResult());
  });
}

// eslint-disable-next-line no-unused-vars
function doPrimes(client) {
  console.log('doPrimes was invoked');
  const req = new PrimeRequest();

  req.setNumber(12390392840);
  const call = client.primes(req);

  call.on(DATA, (res) => {
    console.log('Primes: ', res.getResult());
  });
}

// eslint-disable-next-line no-unused-vars
function doAvg(client) {
  console.log('doAvg was invoked');
  const numbers = [...Array(11).keys()].slice(1);
  const call = client.avg((err, res) => {
    if (err) {
      return console.error(err);
    }

    console.log('Avg: ', res.getResult());
  });

  numbers.map((number) => {
    return new AvgRequest().setNumber(number);
  }).forEach((req) => call.write(req));

  call.end();
}

// eslint-disable-next-line no-unused-vars
function doMax(client) {
  console.log('doMax was invoked');
  const numbers = [4, 7, 2, 19, 4, 6, 32];
  const call = client.max();

  call.on(DATA, (res) => {
    console.log(`Max: ${res.getResult()}`);
  });

  numbers.map((number) => {
    return new MaxRequest().setNumber(number);
  }).forEach((req) => call.write(req));

  call.end();
}

// eslint-disable-next-line no-unused-vars
function doSqrt(client, n) {
  console.log('doSqrt was invoked');
  const req = new SqrtRequest();

  req.setNumber(n);
  client.sqrt(req, (err, res) => {
    if (err) {
      return console.log(err);
    }

    console.log('Sqrt: ', res.getResult());
  });
}

function main() {
  const client = new service.CalculatorServiceClient(
      '0.0.0.0:50051',
      grpc.credentials.createInsecure(),
  );

  // doSum(client);
  // doPrimes(client);
  // doAvg(client);
  // doMax(client);
  // doSqrt(client, 25);
  // doSqrt(client, -1);
  client.close();
}

main();
