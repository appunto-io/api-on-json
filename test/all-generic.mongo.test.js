const mongoose              = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const { Mongo }       = require('../src/databases/databases.js');
const { DataModel }   = require('../src/index.js');
const {
  dataModels,
  databaseTestSuite,
  jwtSecret } = require('./all-generic.js');

describe('api-on-json test suite mongoose', async function() {
  let db;
  let mongoServer;

  before((done) => {
    mongoServer = new MongoMemoryServer();
    mongoServer
    .getConnectionString()
    .then((mongoUri) => {
      db = new Mongo(mongoUri);
      return db.connect();
    })
    .then(async() => {
      const dataModel = new DataModel(dataModels);

      await db.connect();
      await db.init(dataModel);

      const opt = {
        realTime: false
      };

      const apiModel  = dataModel.toApi(opt);

      const env = {
        db,
        jwtSecret
      }

      this.server  = apiModel.toServer(env);
      await this.server.listen(3003);
      done()});
  });
  after(async () => {
    await this.server.close();
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  databaseTestSuite();
});
