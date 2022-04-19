const assert = require('assert');
const grpc = require('@grpc/grpc-js');
const {BlogId} = require('../../blog/proto/blog_pb');
const service = require('../../blog/proto/blog_grpc_pb');
const impl = require('../../blog/server/service_impl');
const {TestGrpcHelper} = require('../grpc_helper');
const {TestDbHelper} = require('./db_helper');

describe('Blog Server - Delete', () => {
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

  it('DeleteBlog', (done) => {
    dbHelper.insertDoc({
      author_id: 'Clement',
      title: 'Title',
      content: 'Content',
    }).then((res) => {
      const id = res.insertedId.toString();
      const req = new BlogId()
          .setId(id);

      grpcHelper.client.deleteBlog(req, async (err, _) => {
        assert.ifError(err);
        await collection.deleteOne({_id: id});
        done();
      });
    }).catch(assert.ifError);
  });

  it('DeleteBlog invalid ID', (done) => {
    const req = new BlogId();

    grpcHelper.client.deleteBlog(req, (err, _) => {
      assert.deepStrictEqual(err.code, grpc.status.INVALID_ARGUMENT);
      done();
    });
  });

  it('DeleteBlog not found', (done) => {
    const req = new BlogId()
        .setId('624d731f9920e5a155d5338b');

    grpcHelper.client.deleteBlog(req, (err, _) => {
      assert.deepStrictEqual(err.code, grpc.status.NOT_FOUND);
      done();
    });
  });
});
