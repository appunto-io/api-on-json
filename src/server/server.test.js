const chai     = require('chai');
const chaiHTTP = require('chai-http');

const { ApiModel } = require('../index.js');

const expect = chai.expect;
chai.use(chaiHTTP);

const PORT = 8321;
// TBD
const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.1Yv6_KkkdfizAkirOLkPh_xnFGu8B_003xZvu_YxgFY';

/**********************************************
  Generic HTTP requests based on chai HTTP
*/
async function get(collection) {
  return chai.request('http://localhost:'+PORT)
    .get(`/${collection}`)
    .set('Authorization', token);
}

async function getId(collection, id) {
  return chai.request('http://localhost:'+PORT)
    .get(`/${collection}/` + id)
    .set('Authorization', token);
}

async function post(collection, data) {
  return chai.request('http://localhost:'+PORT)
    .post(`/${collection}`)
    .set('Authorization', token)
    .send(data);
}

async function put(collection, id, data) {
  return chai.request('http://localhost:'+PORT)
    .put(`/${collection}/` + id)
    .set('Authorization', token)
    .send(data);
}

async function patch(collection, id, data) {
  return chai.request('http://localhost:'+PORT)
    .patch(`/${collection}/` + id)
    .set('Authorization', token)
    .send(data);
}

async function erase(collection, id) {
  return chai.request('http://localhost:'+PORT)
    .delete(`/${collection}/` + id)
    .set('Authorization', token);
}

function get_many() {
  return {data: 'getMany'};
}

function get_id() {
  return {data: 'getId'};
}

function create() {
  return {data: 'post'};
}

function update() {
  return {data: 'put'};
}

function patch_id() {
  return {data: 'patch'};
}

function remove() {
  return {data: 'remove'};
}

function connect() {
  return {data: 'connect'};
}

function disconnect() {
  return {data: 'disconnect'};
}

function message(message) {
  return 'message: ' + message;
}

function failingPolicy(flow, meta) {
  return flow.stop(401, {error : 'fail'});
}

function successfulPolicy(flow, meta) {
  return flow.continue(meta);
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
      "POST"   : [create],
      "PUT"    : [update],
      "PATCH"  : [patch_id],
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
        "POST"   : [create],
        "PUT"    : [update],
        "PATCH"  : [patch_id],
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
  "/policies": {
    "handlers": {
      "GET"    : [get_many],
      "POST"   : [create],
    },
    "auth": {
      "GET" : { "requiresAuth": true, "requiresRoles": false, policies : [successfulPolicy, failingPolicy, successfulPolicy] },
      "POST" : { "requiresAuth": true, "requiresRoles": false, policies : [successfulPolicy, successfulPolicy] },
    }
  },
  "hasRealtime": true
};

describe('realTime test suite', async function() {
  var api  = new ApiModel(apiModel);

  const env = {
    jwtSecret : "--default-jwt-secret--"
  }

  before(async () => {


    this.server  = api.toServer(env);
    await this.server.listen(PORT);
  });

  after(async () => {
    await this.server.close();
  });

  it('Testing get route', async function() {
    const response = await get('cars');
    expect(response.body.data).to.be.equal('getMany');

  });

  it('Testing get id', async function() {
    const response = await getId('cars', 'id');
    expect(response.body.data).to.be.equal('getId');
  });

  it('Testing post', async function() {
    const response = await post('cars', 'data');
    expect(response.body.data).to.be.equal('post');
  });

  it('Testing put', async function() {
    const response = await put('cars', 'id', 'data');
    expect(response.body.data).to.be.equal('put');
  });

  it('Testing patch', async function() {
    const response = await patch('cars', 'id', 'data');
    expect(response.body.data).to.be.equal('patch');
  });

  it('Testing delete', async function() {
    const response = await erase('id');
    expect(response.status).to.to.be.equal(404);
  });

  it('Should stop on unsatisfied policy', async function() {
    const response = await get('policies');
    expect(response.status).to.be.equal(401);
    expect(response.body.error).to.be.equal('fail');
  })

  it('Should not fail when policies are satisfied', async function() {
    const response = await post('policies');
    expect(response.status).to.be.equal(200);
  })
});
