const assert = require('assert');
const {MongoMemoryServer} = require('mongodb-memory-server');
const {MongoClient} = require('mongodb');

global.collection = undefined;

exports.TestDbHelper = class {
  constructor() {
    this.mongoServer = null;
    this.connection = null;
  }

  async start() {
    this.mongoServer = await MongoMemoryServer.create();
    const mongoUri = this.mongoServer.getUri();

    this.connection = await MongoClient.connect(mongoUri);

    const dbName = this.mongoServer.instanceInfo.dbName;
    const db = this.connection.db(dbName);

    collection = db.collection('blog');
  }

  async stop() {
    await collection.drop();
    await this.connection.close();
    await this.mongoServer.stop();
  }

  async insertDoc(document) {
    const res = await collection.insertOne(document);

    assert.notStrictEqual(res, null);
    assert.notStrictEqual(res.acknowledged, false);
    return res;
  }
};
