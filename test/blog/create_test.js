const assert = require('assert');
const {Blog} = require('../../blog/proto/blog_pb');
const impl = require('../../blog/server/service_impl');
const service = require('../../blog/proto/blog_grpc_pb');
const {TestGrpcHelper} = require('../grpc_helper');
const {TestDbHelper} = require('./db_helper');

describe('Blog Server - Create', () => {
  const grpcHelper = new TestGrpcHelper();
  const dbHelper = new TestDbHelper();

  before(async () => {
    await dbHelper.start();
    grpcHelper.start(
        service.BlogServiceClient,
        service.BlogServiceService,
        impl,
    );
  });

  after(async () => {
    await dbHelper.stop();
    grpcHelper.stop();
  });

  it('CreateBlog', (done) => {
    const req = new Blog()
        .setAuthorId('Clement')
        .setTitle('Blog')
        .setContent('Content');

    grpcHelper.client.createBlog(req, (err, res) => {
      assert.ifError(err);
      assert.notDeepEqual(res.getId(), '');
      done();
    });
  });
});
