const assert = require('assert');
const grpc = require('@grpc/grpc-js');
const impl = require('../../calculator/server/service_impl');
const service = require('../../calculator/proto/calculator_grpc_pb');
const {SumRequest} = require('../../calculator/proto/sum_pb');
const {PrimeRequest} = require('../../calculator/proto/primes_pb');
const {AvgRequest} = require('../../calculator/proto/avg_pb');
const {MaxRequest} = require('../../calculator/proto/max_pb');
const {SqrtRequest} = require('../../calculator/proto/sqrt_pb');
const {TestGrpcHelper} = require('../grpc_helper');

describe('Calulator Server', () => {
  const grpcHelper = new TestGrpcHelper();

  before(() => {
    grpcHelper.start(
        service.CalculatorServiceClient,
        service.CalculatorServiceService,
        impl,
    );
  });

  after(() => {
    grpcHelper.stop();
  });

  it('Sum', (done) => {
    const req = new SumRequest();

    req.setFirstNumber(1);
    req.setSecondNumber(1);
    grpcHelper.client.sum(req, (err, res) => {
      assert.ifError(err);
      assert.strictEqual(res.getResult(), 2);
      done();
    });
  });

  it('Primes', (done) => {
    const req = new PrimeRequest();

    req.setNumber(567890);

    const call = grpcHelper.client.primes(req);
    const responses = [];

    call.on('data', (res) => {
      responses.push(res.getResult());
    });

    call.on('error', assert.ifError);

    call.on('end', () => {
      assert.deepStrictEqual(4, responses.length);
      const expected = [2, 5, 109, 521];

      for (let i = 0; i < expected.length; ++i) {
        assert.deepStrictEqual(responses[i], expected[i]);
      }
      done();
    });
  });

  it('Avg', (done) => {
    const names = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const call = grpcHelper.client.avg((err, res) => {
      assert.ifError(err);
      assert.deepStrictEqual(
          5.5,
          res.getResult(),
      );
      done();
    });

    names.map((number) => {
      return new AvgRequest().setNumber(number);
    }).forEach((req) => call.write(req));

    call.end();
  });

  it('Max', (done) => {
    const numbers = [4, 7, 2, 19, 4, 6, 32];
    const call = grpcHelper.client.max();
    let max = numbers[0];

    call.on('data', (res) => {
      max = res.getResult();
    });

    call.on('error', assert.ifError);

    call.on('end', () => {
      assert.strictEqual(max, 32);
      done();
    });

    numbers.map((number) => {
      return new MaxRequest().setNumber(number);
    }).forEach((req) => call.write(req));

    call.end();
  });

  it('Sqrt negative number', (done) => {
    const req = new SqrtRequest();

    req.setNumber(-11);
    grpcHelper.client.sqrt(req, (err, _) => {
      assert(err);
      assert.strictEqual(err.code, grpc.status.INVALID_ARGUMENT);
      assert.strictEqual(
          err.details,
          'Number cannot be negative, received: -11',
      );
      done();
    });
  });
});
