const assert = require('assert');
const impl = require('../../blog/server/service_impl');
const service = require('../../blog/proto/blog_grpc_pb');
const {TestGrpcHelper} = require('../grpc_helper');
const {TestDbHelper} = require('./db_helper');
const {Empty} = require('google-protobuf/google/protobuf/empty_pb');
const {DATA, ERROR, END} = require('../../constants');

describe('Blog Server - List', () => {
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

  it('ListBlog', (done) => {
    const blogs = [
      {
        author_id: 'Clement',
        title: 'Title',
        content: 'Content',
      },
      {
        author_id: 'Marie',
        title: 'Title',
        content: 'Content',
      },
    ];

    blogs.forEach(async (blog) => await dbHelper.insertDoc(blog));

    let i = 0;
    const call = grpcHelper.client.listBlogs(new Empty());

    call.on(ERROR, assert.ifError);
    call.on(DATA, () => ++i);
    call.on(END, async () => {
      assert.strictEqual(i, blogs.length);
      await collection.deleteMany({});
      done();
    });
  });
});
