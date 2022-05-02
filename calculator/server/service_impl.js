const grpc = require('@grpc/grpc-js');
const {DATA, END} = require('../../constants');
const {SumResponse} = require('../proto/sum_pb');
const {PrimeResponse} = require('../proto/primes_pb');
const {AvgResponse} = require('../proto/avg_pb');
const {MaxResponse} = require('../proto/max_pb');
const {SqrtResponse} = require('../proto/sqrt_pb');

exports.sum = (call, callback) => {
  console.log('Sum was invoked');
  const res = new SumResponse()
      .setResult(
          call.request.getFirstNumber() + call.request.getSecondNumber(),
      );

  callback(null, res);
};

exports.primes = (call, _) => {
  console.log('Primes was invoked');
  const res = new PrimeResponse();
  let number = call.request.getNumber();
  let divisor = 2;

  while (number > 1) {
    if (number % divisor == 0) {
      res.setResult(divisor);
      call.write(res);
      number /= divisor;
    } else {
      ++divisor;
    }
  }

  call.end();
};

exports.avg = (call, callback) => {
  console.log('Avg was invoked');
  let count = 0.0;
  let total = 0.0;

  call.on(DATA, (req) => {
    total += req.getNumber();
    ++count;
  });

  call.on(END, () => {
    const res = new AvgResponse()
        .setResult(total / count);

    callback(null, res);
  });
};

exports.max = (call, _) => {
  console.log('Max was invoked');
  let max = 0;

  call.on(DATA, (req) => {
    console.log('Received request: ' + req);
    const number = req.getNumber();

    if (number > max) {
      const res = new MaxResponse()
          .setResult(number);

      console.log('Sending response: ' + res);
      call.write(res);
      max = number;
    }
  });

  call.on(END, () => call.end());
};

exports.sqrt = (call, callback) => {
  console.log('Sqrt was invoked');
  const number = call.request.getNumber();

  if (number < 0) {
    callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: `Number cannot be negative, received: ${number}`,
    });
  }

  const res = new SqrtResponse()
      .setResult(Math.sqrt(number));

  callback(null, res);
};
