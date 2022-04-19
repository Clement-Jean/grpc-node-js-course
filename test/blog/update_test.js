const assert = require('assert');
const grpc = require('@grpc/grpc-js');
const {Blog} = require('../../blog/proto/blog_pb');
const service = require('../../blog/proto/blog_grpc_pb');
const impl = require('../../blog/server/service_impl');
const {TestGrpcHelper} = require('../grpc_helper');
const {TestDbHelper} = require('./db_helper');

describe('Blog Server - Update', () => {
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

  it('UpdateBlog', (done) => {
    dbHelper.insertDoc({
      author_id: 'Clement',
      title: 'Title',
      content: 'Content',
    }).then((res) => {
      const id = res.insertedId.toString();
      const req = new Blog()
          .setId(id)
          .setAuthorId('not Clement')
          .setTitle('not Blog')
          .setContent('not Content');

      grpcHelper.client.updateBlog(req, async (err, _) => {
        assert.ifError(err);
        await collection.deleteOne({_id: id});
        done();
      });
    }).catch(assert.ifError);
  });

  it('UpdateBlog invalid ID', (done) => {
    const req = new Blog()
        .setAuthorId('not Clement')
        .setTitle('not Blog')
        .setContent('not Content');

    grpcHelper.client.updateBlog(req, (err, _) => {
      assert.deepStrictEqual(err.code, grpc.status.INVALID_ARGUMENT);
      done();
    });
  });

  it('UpdateBlog not found', (done) => {
    const req = new Blog()
        .setId('624d731f9920e5a155d5338b')
        .setAuthorId('not Clement')
        .setTitle('not Blog')
        .setContent('not Content');

    grpcHelper.client.updateBlog(req, (err, _) => {
      assert.deepStrictEqual(err.code, grpc.status.NOT_FOUND);
      done();
    });
  });
});
