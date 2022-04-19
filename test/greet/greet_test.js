const assert = require('assert');
const grpc = require('@grpc/grpc-js');
const impl = require('../../greet/server/service_impl');
const service = require('../../greet/proto/greet_grpc_pb');
const {GreetRequest} = require('../../greet/proto/greet_pb');
const {TestGrpcHelper} = require('../grpc_helper');

describe('Greet Server', () => {
  const grpcHelper = new TestGrpcHelper();

  before(() => {
    grpcHelper.start(
        service.GreetServiceClient,
        service.GreetServiceService,
        impl,
    );
  });

  after(() => {
    grpcHelper.stop();
  });

  it('Greet', (done) => {
    const req = new GreetRequest();

    req.setFirstName('Clement');
    grpcHelper.client.greet(req, (err, res) => {
      assert.ifError(err);
      assert.strictEqual(res.getResult(), 'Hello Clement');
      done();
    });
  });

  it('GreetManyTimes', (done) => {
    const name = 'Clement';
    const req = new GreetRequest();

    req.setFirstName(name);

    const call = grpcHelper.client.greetManyTimes(req);
    const responses = [];

    call.on('data', (res) => {
      responses.push(res.getResult());
    });

    call.on('error', assert.ifError);

    call.on('end', () => {
      assert.deepStrictEqual(10, responses.length);
      for (let i = 0; i < 10; ++i) {
        assert.deepStrictEqual(responses[i], `Hello ${name} - number ${i}`);
      }
      done();
    });
  });

  it('LongGreet', (done) => {
    const names = ['Clement', 'Marie', 'Test'];
    const call = grpcHelper.client.longGreet((err, res) => {
      assert.ifError(err);
      assert.deepStrictEqual(
          names.map((name) => `Hello ${name}\n`).join(''),
          res.getResult(),
      );
      done();
    });

    names.map((name) => {
      return new GreetRequest().setFirstName(name);
    }).forEach((req) => call.write(req));

    call.end();
  });

  it('GreetEveryone', (done) => {
    let i = 0;
    const names = ['Clement', 'Marie', 'Test'];
    const call = grpcHelper.client.greetEveryone();

    call.on('data', (res) => {
      assert.deepStrictEqual(`Hello ${names[i]}`, res.getResult());
      ++i;
    });

    call.on('error', assert.ifError);

    call.on('end', () => {
      assert.strictEqual(i, names.length);
      done();
    });

    names.map((name) => {
      return new GreetRequest().setFirstName(name);
    }).forEach((req) => call.write(req));

    call.end();
  });

  it('GreetWithDeadline exceeded', (done) => {
    const req = new GreetRequest();

    req.setFirstName('Clement');
    grpcHelper.client.greetWithDeadline(req, {
      deadline: new Date(Date.now() + 1000),
    }, (err, _) => {
      assert(err);
      assert.strictEqual(err.code, grpc.status.DEADLINE_EXCEEDED);
      assert.strictEqual(err.details, 'Deadline exceeded');
      done();
    });
  });
});
