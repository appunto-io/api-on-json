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

beforeEach((done) => {
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

afterEach(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.1Yv6_KkkdfizAkirOLkPh_xnFGu8B_003xZvu_YxgFY';

describe('Testsuite on empty database:', () => {
  const dataModelCar = {
      'cars': {
          schema: {
              'brand' : {type : 'String', 'required' : true},
              'model' : {type: 'String', 'default' : 'None'}
          }
      }
  };

  let api = new API(dataModelCar);
  api.createApi(mongoose);

  describe('Test that should work:', () => {

    beforeEach(() => {
      api.listen(3000);
    });

    afterEach(function(done) {
      api.close();
      done();
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
  });

  describe('Test that shouldn\'t work:', () => {

    beforeEach(() => {
      api.listen(3000);
    });

    afterEach(function(done) {
      api.close();
      done();
    });

    describe('/GET 2nd car', () => {
      it('it should fail because there is no car with _id = 2', (done) => {

        chai.request('http://localhost:3000')
          .get('/cars/2')
          .set('Authorization', token)
          .end(function(err, res) {
              expect(res).to.have.status(400);
              done();
        });
      });
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
  });
});

describe('Testsuite on set database', () => {

  let letterDataModel = {
    'letters': {
      schema: {
        'Author': {type: 'String'},
        'Message': {type: 'String'},
        'Destination': {type: 'String', 'required': true}
      }
    }
  };

  let api = new API(letterDataModel);
  api.createApi(mongoose);

  let letterModel = mongoose.model('letters');

  let letter1 = new letterModel({
    Author: 'Arnold P.',
    Message: 'Come visit me this friday',
    Destination: '234 Baker Street, London'
  });

  let letter2 = new letterModel({
    Author: 'Camille W.',
    Message: 'Let us have a dinner next week',
    Destination: '54 Holoah Avenue, Caraholia'
  });

  let letter3 = new letterModel({
    Destination: 'Nowhere'
  });

  letter1.save();
  letter2.save();
  letter3.save();


  describe('Test that should work:', () => {

    beforeEach(() => {
      api.listen(3000);
    });

    afterEach(function(done) {
      api.close();
      done();
    });

    describe('/GET letters', () => {
      it('it should GET all the letters thanks to the token', (done) => {
        chai.request('http://localhost:3000')
          .get('/letters')
          .set('Authorization', token)
          .end(function(err, res) {
              expect(res).to.have.status(200);
              done();
        });
      });
    });

    describe('/POST letters', () => {
      it('it should POST a new letter from Nicolas Tesla', (done) => {
        chai.request('http://localhost:3000')
          .post('/letters')
          .set('Authorization', token)
          .send({ Author: "Nicolas T.", Destination: "Oslo" })
          .end(function(err, res) {
              expect(err).to.be.null;
              expect(res).to.have.status(200);
              done();
        });
      });
    });
  });

  describe('Test that shouldn\'t work:', () => {

    beforeEach(() => {
      api.listen(3000);
    });

    afterEach(function(done) {
      api.close();
      done();
    });

    describe('/GET letters', () => {
      it('it should fail, because no token in headers', (done) => {
        chai.request('http://localhost:3000')
          .get('/letters')
          .end(function(err, res) {
              expect(res).to.have.status(401);
              done();
        });
      });
    });
  });
});
