const assert = require('assert');
const grpc = require('@grpc/grpc-js');
const {BlogId} = require('../../blog/proto/blog_pb');
const impl = require('../../blog/server/service_impl');
const service = require('../../blog/proto/blog_grpc_pb');
const {TestGrpcHelper} = require('../grpc_helper');
const {TestDbHelper} = require('./db_helper');

describe('Blog Server - Read', () => {
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

  it('ReadBlog with invalid ID', (done) => {
    const req = new BlogId();

    grpcHelper.client.readBlog(req, (err, _) => {
      assert.deepStrictEqual(err.code, grpc.status.INVALID_ARGUMENT);
      done();
    });
  });

  it('ReadBlog with valid ID', (done) => {
    dbHelper.insertDoc({
      author_id: 'Clement',
      title: 'Title',
      content: 'Content',
    }).then((res) => {
      const id = res.insertedId.toString();
      const req = new BlogId().setId(id);

      grpcHelper.client.readBlog(req, async (err, res) => {
        assert.ifError(err);
        assert.deepStrictEqual(res.getId(), id);
        await collection.deleteOne({_id: id});
        done();
      });
    }).catch(assert.ifError);
  });
});
