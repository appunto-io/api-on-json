const chai     = require('chai');
const chaiHTTP = require('chai-http');
const jwt      = require('jsonwebtoken');

const {
        ApiModel,
        Server }            = require('./index.js');

const expect = chai.expect;
chai.use(chaiHTTP);


// TBD
const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.1Yv6_KkkdfizAkirOLkPh_xnFGu8B_003xZvu_YxgFY';

/**********************************************
  Generic HTTP requests based on chai HTTP
*/
async function get(collection) {
  return chai.request('http://localhost:3000')
    .get(`/${collection}`)
    .set('Authorization', token);
}

async function getId(collection, id) {
  return chai.request('http://localhost:3000')
    .get(`/${collection}/` + id)
    .set('Authorization', token);
}

async function query(collection, query) {
  return chai.request('http://localhost:3000')
    .get(`/${collection}`)
    .query(query)
    .set('Authorization', token);
}

async function post(collection, data) {
  return chai.request('http://localhost:3000')
    .post(`/${collection}`)
    .set('Authorization', token)
    .send(data);
}

async function put(collection, id, data) {
  return chai.request('http://localhost:3000')
    .put(`/${collection}/` + id)
    .set('Authorization', token)
    .send(data);
}

async function patch(collection, id, data) {
  return chai.request('http://localhost:3000')
    .patch(`/${collection}/` + id)
    .set('Authorization', token)
    .send(data);
}

async function erase(collection, id) {
  return chai.request('http://localhost:3000')
    .delete(`/${collection}/` + id)
    .set('Authorization', token);
}

function get_many() {
  return 'getMany';
}

function get_id(id) {
  return 'getId';
}

function post() {
  return 'post';
}

function put(id) {
  return 'put';
}

function patch(id) {
  return 'patch';
}

function remove(id) {
  return 'remove';
}

function connect() {
  return 'connect';
}

function disconnect() {
  return 'disconnect';
}

function message(message) {
  return 'message';
}

const apiModel = {
  "isApiModel": true,
  "handlers": {},
  "filters": {},
  "realTime": false,
  "auth": {
    "GET"     : { "requiresAuth": true, "requiresRoles": false },
    "HEAD"    : { "requiresAuth": true, "requiresRoles": false },
    "OPTIONS" : { "requiresAuth": true, "requiresRoles": false },
    "POST"    : { "requiresAuth": true, "requiresRoles": false },
    "PUT"     : { "requiresAuth": true, "requiresRoles": false },
    "PATCH"   : { "requiresAuth": true, "requiresRoles": false },
    "DELETE"  : { "requiresAuth": true, "requiresRoles": false },
    "realTime": { "requiresAuth": true, "requiresRoles": false }
  },
  "fields": {},
  "/cars": {
    "handlers": {
      "GET"    : [get_many],
      "POST"   : [post],
      "PUT"    : [put],
      "PATCH"  : [patch],
      "DELETE" : [remove],
    },
    "realTime": {
      "connect": [connect],
      "message": [message],
      "disconnect": [disconnect]
    },
    "auth": {
      "GET"     : { "requiresAuth": true, "requiresRoles": false },
      "HEAD"    : { "requiresAuth": true, "requiresRoles": false },
      "OPTIONS" : { "requiresAuth": true, "requiresRoles": false },
      "POST"    : { "requiresAuth": true, "requiresRoles": false },
      "PUT"     : { "requiresAuth": true, "requiresRoles": false },
      "PATCH"   : { "requiresAuth": true, "requiresRoles": false },
      "DELETE"  : { "requiresAuth": true, "requiresRoles": false },
      "realTime": { "requiresAuth": true, "requiresRoles": ["admin"] }
    },
    "fields": {},
    "/:id": {
      "handlers": {
        "GET"    : [get_id],
        "POST"   : [post],
        "PUT"    : [put],
        "PATCH"  : [patch],
        "DELETE" : [remove],
      },
      "realTime": {
        "connect": [connect],
        "message": [message],
        "disconnect": [disconnect]
      },
      "auth": {
        "GET"     : { "requiresAuth": true, "requiresRoles": false },
        "HEAD"    : { "requiresAuth": true, "requiresRoles": false },
        "OPTIONS" : { "requiresAuth": true, "requiresRoles": false },
        "POST"    : { "requiresAuth": true, "requiresRoles": false },
        "PUT"     : { "requiresAuth": true, "requiresRoles": false },
        "PATCH"   : { "requiresAuth": true, "requiresRoles": false },
        "DELETE"  : { "requiresAuth": true, "requiresRoles": false },
        "realTime": { "requiresAuth": true, "requiresRoles": false }
      },
      "fields": {}
    }
  },
  "hasRealtime": true
};

describe('realTime test suite', async function() {
  var api  = new ApiModel(apiModel);

  const env = {
    jwtSecret : "--default-jwt-secret--"
  }

  const admin  = jwt.sign({ role: 'admin' }, env.jwtSecret);
  const user   = jwt.sign({ role: 'user' }, env.jwtSecret);
  const collab = jwt.sign({ role: 'collab' }, env.jwtSecret);

  before(async () => {


    this.server  = api.toServer(env);
    await this.server.listen(3000);
  });

  after(async () => {
    await this.server.close();
  });

  it('Testing get route', async function() {
    const response = await get('cars');
    expect(response.text).to.be.equal('getMany');
  });

  it('Testing get id', async function() {
    const response = await getId('cars', 'id');
    expect(response.text).to.be.equal('getId');
  });

  it('Testing post', async function() {
    const response = await post('cars', 'data');
    expect(response).to.be.equal('post');
  });

  it('Testing put', async function() {
    const response = await put('cars', 'id', 'data');
    expect(response).to.be.equal('put');
  });

  it('Testing patch', async function() {
    const response = await patch('cars', 'id', 'data');
    expect(response).to.be.equal('patch');
  });

  it('Testing delete', async function() {
    const response = await delete('id');
    expect(response).to.be.true;
  });
});
