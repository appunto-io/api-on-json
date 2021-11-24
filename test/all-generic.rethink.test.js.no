const { Rethink }    = require('../src/databases/databases.js');
const { DataModel }  = require('../src/index.js');
const {
  dataModels,
  databaseTestSuite,
  jwtSecret }        = require('./all-generic.js');

describe('api-on-json test suite rethinkdb', async function() {
  let db = new Rethink("localhost", "28015", "db");

  const opt = {
    realTime: false
  };

  before(async() => {
    const dataModel = new DataModel(dataModels);

    await db.connect();
    if (db.database) {
      await db.init(dataModel);
      const apiModel = dataModel.toApi(opt);

      const env = {
        db,
        jwtSecret
      }

      this.server2 = apiModel.toServer(env);
      await this.server2.listen(3000);
    }
  });

  after(async () => {
    await this.server2.close();
  });

  databaseTestSuite();
});
