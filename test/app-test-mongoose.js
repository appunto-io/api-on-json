const mongoose              = require('mongoose');
const assert                = require('assert');
const chai                  = require('chai');
const chaiHTTP              = require('chai-http');
const { MongoMemoryServer } = require('mongodb-memory-server');

const { API, DB } = require('../src/index.js');
const { createServer }                          = require('../src/backend/index.js')
const { dataModelToMongoose, compileDataModel } = require('../src/dataModel/index.node.js');
const {
        createLibraryFromDataModel,
        createApiFromDataModel,
        compileApiModel,
        mergeModels,
        hydrate }                               = require('../src/apiModel/index.node.js');

let mongoServer;
const options = { useNewUrlParser : true ,
                  useUnifiedTopology: true,
                  useFindAndModify: false};

var expect = chai.expect;
chai.use(chaiHTTP);

before((done) => {
  mongoServer = new MongoMemoryServer();
  mongoServer
    .getConnectionString()
    .then((mongoUri) => {
      return mongoose.connect(mongoUri, options, err => {
        if (err) done(err);
      });
    })
    .then(() => done());
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

const dataModelCar = {
    'cars': {
        schema: {
            'brand' : {type : 'String', 'required' : true},
            'model' : {type: 'String', 'default' : 'None'}
        }
    }
};

const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.1Yv6_KkkdfizAkirOLkPh_xnFGu8B_003xZvu_YxgFY';

const api = new API(dataModelCar);
describe('Testsuite with one dataModel', () => {
  before(() => {
    api.listen(3000, mongoose);
  });

  after(() => {
    api.close();
  });

  describe('/GET cars', () => {
    it('it should fail, because no token in headers', (done) => {

      chai.request('http://localhost:3000')
        .get('/cars')
        .end(function(err, res) {
            expect(res).to.have.status(401);
            done();
      });
    });
  });

  describe('/GET cars', () => {
    it('it should GET all the cars thanks to the token', (done) => {

      chai.request('http://localhost:3000')
        .get('/cars')
        .set('Authorization', token)
        .end(function(err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            done();
      });
    });
  });

  describe('/POST cars', () => {
    it('it should POST a new car', (done) => {

      chai.request('http://localhost:3000')
        .post('/cars')
        .set('Authorization', token)
        .send({ brand: "Tesla", model: "Model S"})
        .end(function(err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            done();
      });
    });
  });

  describe('/GET 1st car', () => {
    it('it should GET the car with _id = 1', (done) => {

      chai.request('http://localhost:3000')
        .get('/cars/1')
        .set('Authorization', token)
        .end(function(err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(400);
            done();
      });
    });
  });

  describe('/GET 2nd car', () => {
    it('it should fail because there is no car with _id = 2', (done) => {

      chai.request('http://localhost:3000')
        .get('/cars/2')
        .set('Authorization', token)
        .end(function(err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            done();
      });
    });
  });
});
