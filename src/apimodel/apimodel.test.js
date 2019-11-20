const chai   = require('chai');
const expect = chai.expect;

const { createAuthHandler } = require('../server/helpers/helpers.js');
const { ApiModel }          = require('./apimodel.js');

const carsApiModel = {
  isApiModel: true,
  hasRealtime: false,
  '/cars': {
    auth : {
      "GET"     : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
      "HEAD"    : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
      "OPTIONS" : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
      "POST"    : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
      "PUT"     : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
      "PATCH"   : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
      "DELETE"  : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
      realTime  : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]}
    },
    fields : {},
    filters : {},
    handlers : {},
    realTime : { 'connect': [], 'message': [], 'disconnect': [] },
    cors: {
      methods              : "GET, HEAD, PUT, PATCH, POST, DELETE",
      optionsSuccessStatus : 204,
      origin               : "*",
      preflightContinue    : false
    }
  },
  auth : {
    "GET"     : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
    "HEAD"    : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
    "OPTIONS" : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
    "POST"    : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
    "PUT"     : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
    "PATCH"   : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
    "DELETE"  : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
    realTime  : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]}
  },
  fields : {},
  filters : {},
  handlers : {},
  realTime : { 'connect': [], 'message': [], 'disconnect': [] },
  cors: {
    methods              : "GET, HEAD, PUT, PATCH, POST, DELETE",
    optionsSuccessStatus : 204,
    origin               : "*",
    preflightContinue    : false
  }
};

const appleApiModel = {
  isApiModel: true,
  hasRealtime: false,
  '/apple': {
    auth : {
      "GET"     : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
      "HEAD"    : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
      "OPTIONS" : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
      "POST"    : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
      "PUT"     : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
      "PATCH"   : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
      "DELETE"  : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
      realTime  : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]}
    },
    fields : {},
    filters : {},
    handlers : {},
    realTime : { 'connect': [], 'message': [], 'disconnect': [] },
    cors: {
      methods              : "GET, HEAD, PUT, PATCH, POST, DELETE",
      optionsSuccessStatus : 204,
      origin               : "*",
      preflightContinue    : false
    }
  },
  auth : {
    "GET"     : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
    "HEAD"    : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
    "OPTIONS" : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
    "POST"    : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
    "PUT"     : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
    "PATCH"   : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
    "DELETE"  : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
    realTime  : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]}
  },
  fields : {},
  filters : {},
  handlers : {},
  realTime : { 'connect': [], 'message': [], 'disconnect': [] },
  cors: {
    methods              : "GET, HEAD, PUT, PATCH, POST, DELETE",
    optionsSuccessStatus : 204,
    origin               : "*",
    preflightContinue    : false
  }
};

const usersApiModel = {
  isApiModel: true,
  hasRealtime: false,
  auth : {
    "GET"     : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
    "HEAD"    : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
    "OPTIONS" : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
    "POST"    : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
    "PUT"     : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
    "PATCH"   : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
    "DELETE"  : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
    realTime  : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]}
  },
  '/cars': {
    auth : {
      "GET"     : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
      "HEAD"    : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
      "OPTIONS" : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
      "POST"    : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
      "PUT"     : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
      "PATCH"   : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
      "DELETE"  : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
      realTime  : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]}
    },
    fields : {},
    filters : {},
    handlers : {},
    realTime : { 'connect': [], 'message': [], 'disconnect': [] },
    cors: {
      methods              : "GET, HEAD, PUT, PATCH, POST, DELETE",
      optionsSuccessStatus : 204,
      origin               : "*",
      preflightContinue    : false
    },
    '/users': {
      auth : {
        "GET"     : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
        "HEAD"    : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
        "OPTIONS" : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
        "POST"    : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
        "PUT"     : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
        "PATCH"   : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
        "DELETE"  : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
        realTime  : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]}
      },
      fields : {},
      filters : {},
      handlers : {},
      realTime : { 'connect': [], 'message': [], 'disconnect': [] },
      cors: {
        methods              : "GET, HEAD, PUT, PATCH, POST, DELETE",
        optionsSuccessStatus : 204,
        origin               : "*",
        preflightContinue    : false
      }
    }
  },
  fields : {},
  filters : {},
  handlers : {},
  realTime : { 'connect': [], 'message': [], 'disconnect': [] },
  cors: {
    methods              : "GET, HEAD, PUT, PATCH, POST, DELETE",
    optionsSuccessStatus : 204,
    origin               : "*",
    preflightContinue    : false
  }
};

describe('ApiModel test suite', () => {
  it('Test the creation of a api model without model', () => {
    const apiModel = new ApiModel();
    expect(apiModel.models).to.be.an('array');
    expect(apiModel.models).to.be.empty;
  });

  it('Test the creation of a api model with one model', () => {
    const apiModel = new ApiModel({});
    expect(apiModel.models).to.be.an('array');
    expect(apiModel.models[0]).to.be.deep.equal({});
  });

  it('Test the creation of a api model with multiple models', () => {
    const apiModel = new ApiModel({'/cars' : {}}, {'/apple' : {}});
    expect(apiModel.models).to.be.an('array');

    expect(apiModel.models[0]).to.be.deep.equal({'/cars' : {}});
    expect(apiModel.models[1]).to.be.deep.equal({'/apple' : {}});
  });

  it('Test adding Model method', () => {
    const apiModel = new ApiModel({'/cars' : {}});
    apiModel.addApiModel({'/apple' : {}})

    expect(apiModel.models).to.be.an('array');
    expect(apiModel.models[0]).to.be.deep.equal({'/cars' : {}});
    expect(apiModel.models[1]).to.be.deep.equal({'/apple' : {}});
  });

  it('Test getting the merged api model from an empty api model', () => {
    const apiModel = new ApiModel();
    const merged = apiModel.get();

    expect(apiModel.models).to.be.an('array');
    expect(apiModel.models).to.be.empty;
    expect(merged).to.be.deep.equal({
      isApiModel: true,
      hasRealtime: false,
      auth : {
        "GET"     : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
        "HEAD"    : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
        "OPTIONS" : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
        "POST"    : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
        "PUT"     : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
        "PATCH"   : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
        "DELETE"  : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
        realTime  : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]}
      },
      fields : {},
      filters : {},
      handlers : {},
      realTime : { 'connect': [], 'message': [], 'disconnect': [] },
      cors: {
        methods              : "GET, HEAD, PUT, PATCH, POST, DELETE",
        optionsSuccessStatus : 204,
        origin               : "*",
        preflightContinue    : false
      }
    })
  });

  it('Test getting the merged api model', () => {
    const apiModel = new ApiModel({'/cars' : {}});
    const merged = apiModel.get();

    expect(apiModel.models).to.be.an('array');
    expect(apiModel.models[0]).to.be.deep.equal({'/cars' : {}});

    expect(merged).to.be.deep.equal(carsApiModel);

    apiModel.addApiModel({'/apple' : {}});
    const merged2 = apiModel.get();

    expect(apiModel.models).to.be.an('array');
    expect(merged2).to.be.deep.equal({...carsApiModel, ...appleApiModel});
  });

  it('Test adding a new route to an existing path in the api model', () => {
    const apiModel = new ApiModel({'/cars': {}});

    expect(apiModel.models).to.be.an('array');
    expect(apiModel.models[0]).to.be.deep.equal({'/cars' : {}});

    apiModel.addRoute('cars/users', {});
    const merged = apiModel.get();

    expect(merged).to.be.deep.equal(usersApiModel);
  });

  it('Test adding a new route in the api model', () => {
    const apiModel = new ApiModel({'/cars' : {}});

    expect(apiModel.models).to.be.an('array');
    expect(apiModel.models[0]).to.be.deep.equal({'/cars' : {}});

    apiModel.addRoute('apple', {});
    const merged = apiModel.get();

    expect(merged).to.be.deep.equal({...carsApiModel, ...appleApiModel});
  });

  it('Test removing a route in the api model', () => {
    const apiModel = new ApiModel({});
    apiModel.addApiModel({'/cars' : {}});

    expect(apiModel.models).to.be.an('array');

    const merged = apiModel.get();
    expect(merged).to.be.deep.equal(carsApiModel);

    apiModel.removeRoute('/cars');

    const merged2 = apiModel.get();
    expect(merged2).to.be.deep.equal({
      isApiModel: true,
      hasRealtime: false,
      auth : {
        "GET"     : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
        "HEAD"    : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
        "OPTIONS" : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
        "POST"    : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
        "PUT"     : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
        "PATCH"   : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
        "DELETE"  : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
        realTime  : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]}
      },
      fields : {},
      filters : {},
      handlers : {},
      realTime : { 'connect': [], 'message': [], 'disconnect': [] },
      cors: {
        methods              : "GET, HEAD, PUT, PATCH, POST, DELETE",
        optionsSuccessStatus : 204,
        origin               : "*",
        preflightContinue    : false
      }
    });
  });

  it('Test adding a new handler at route in the api model', () => {
    const apiModel = new ApiModel({'/cars' : {}});

    function getBrand() {}

    apiModel.addHandler('/cars/brand', 'GET', getBrand);

    const merged = apiModel.get();
    expect(merged['/cars']['/brand']['handlers']['GET']).to.be.deep.equal([getBrand]);
  });

  it('Test adding multiple handler at route in the api model', () => {
    const apiModel = new ApiModel({'/cars' : {}});

    function getBrand1() {}
    function getBrand2() {}

    apiModel.addHandler('/cars/brand', 'GET', [getBrand1, getBrand2]);

    const merged = apiModel.get();
    expect(merged['/cars']['/brand']['handlers']['GET']).to.be.deep.equal([getBrand1, getBrand2]);
  });

  it('Test adding a new filter at route in the api model', () => {
    const apiModel = new ApiModel({'/cars' : {}});

    function filterBrand() {}

    apiModel.addFilter('/cars/brand', 'POST', filterBrand);

    const merged = apiModel.get();
    expect(merged['/cars']['/brand']['filters']['POST']).to.be.deep.equal([filterBrand]);
  });

  it('Test adding multiple filter at route in the api model', () => {
    const apiModel = new ApiModel({'/cars' : {}});

    function filterBrand1() {}
    function filterBrand2() {}

    apiModel.addFilter('/cars/brand', 'POST', [filterBrand1, filterBrand2]);

    const merged = apiModel.get();
    expect(merged['/cars']['/brand']['filters']['POST']).to.be.deep.equal([filterBrand1, filterBrand2]);
  });

  it('Test setting auth at route in the api model', () => {
    const apiModel = new ApiModel({'/cars' : {}});

    apiModel.setAuth('/cars/user', {requiresAuth: true, requiresRoles: ['admin']});

    const merged = apiModel.get();
    expect(merged['/cars']['/user']['auth']).to.be.deep.equal({
        "GET"     : {requiresAuth: true, requiresRoles: ['admin'], policies:[createAuthHandler]},
        "HEAD"    : {requiresAuth: true, requiresRoles: ['admin'], policies:[createAuthHandler]},
        "OPTIONS" : {requiresAuth: true, requiresRoles: ['admin'], policies:[createAuthHandler]},
        "POST"    : {requiresAuth: true, requiresRoles: ['admin'], policies:[createAuthHandler]},
        "PUT"     : {requiresAuth: true, requiresRoles: ['admin'], policies:[createAuthHandler]},
        "PATCH"   : {requiresAuth: true, requiresRoles: ['admin'], policies:[createAuthHandler]},
        "DELETE"  : {requiresAuth: true, requiresRoles: ['admin'], policies:[createAuthHandler]},
        realTime  : {requiresAuth: true, requiresRoles: ['admin'], policies:[createAuthHandler]}
    });
  });

  it('Test setting false auth at route in the api model', () => {
    const apiModel = new ApiModel({'/cars' : {}});

    apiModel.setAuth('/cars/user', false);

    const merged = apiModel.get();
    expect(merged['/cars']['/user']['auth']).to.be.deep.equal({
        "GET"     : false,
        "HEAD"    : false,
        "OPTIONS" : false,
        "POST"    : false,
        "PUT"     : false,
        "PATCH"   : false,
        "DELETE"  : false,
        realTime  : false
    });
  });

  it('Test setting only requiresRoles of auth at route in the api model', () => {
    const apiModel = new ApiModel({'/cars' : {}});

    apiModel.setRequiresRoles('/cars/user', 'admin');

    const merged = apiModel.get();
    expect(merged['/cars']['/user']['auth']).to.be.deep.equal({
        "GET"     : {requiresAuth: true, requiresRoles: ['admin'], policies:[createAuthHandler]},
        "HEAD"    : {requiresAuth: true, requiresRoles: ['admin'], policies:[createAuthHandler]},
        "OPTIONS" : {requiresAuth: true, requiresRoles: ['admin'], policies:[createAuthHandler]},
        "POST"    : {requiresAuth: true, requiresRoles: ['admin'], policies:[createAuthHandler]},
        "PUT"     : {requiresAuth: true, requiresRoles: ['admin'], policies:[createAuthHandler]},
        "PATCH"   : {requiresAuth: true, requiresRoles: ['admin'], policies:[createAuthHandler]},
        "DELETE"  : {requiresAuth: true, requiresRoles: ['admin'], policies:[createAuthHandler]},
        realTime  : {requiresAuth: true, requiresRoles: ['admin'], policies:[createAuthHandler]}
    });
  });

  it('Test setting multiples roles only in auth at route in the api model', () => {
    const apiModel = new ApiModel({'/cars' : {}});

    apiModel.setRequiresRoles('/cars/user', ['admin', 'user']);

    const merged = apiModel.get();
    expect(merged['/cars']['/user']['auth']).to.be.deep.equal({
        "GET"     : {requiresAuth: true, requiresRoles: ['admin', 'user'], policies:[createAuthHandler]},
        "HEAD"    : {requiresAuth: true, requiresRoles: ['admin', 'user'], policies:[createAuthHandler]},
        "OPTIONS" : {requiresAuth: true, requiresRoles: ['admin', 'user'], policies:[createAuthHandler]},
        "POST"    : {requiresAuth: true, requiresRoles: ['admin', 'user'], policies:[createAuthHandler]},
        "PUT"     : {requiresAuth: true, requiresRoles: ['admin', 'user'], policies:[createAuthHandler]},
        "PATCH"   : {requiresAuth: true, requiresRoles: ['admin', 'user'], policies:[createAuthHandler]},
        "DELETE"  : {requiresAuth: true, requiresRoles: ['admin', 'user'], policies:[createAuthHandler]},
        realTime  : {requiresAuth: true, requiresRoles: ['admin', 'user'], policies:[createAuthHandler]}
    });
  });

  it('Test setting only requiresAuth to true of auth at route in the api model', () => {
    const apiModel = new ApiModel({'/cars' : {}});

    apiModel.setRequiresAuth('/cars/user', true);

    const merged = apiModel.get();
    expect(merged['/cars']['/user']['auth']).to.be.deep.equal({
        "GET"     : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler]},
        "HEAD"    : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler]},
        "OPTIONS" : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler]},
        "POST"    : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler]},
        "PUT"     : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler]},
        "PATCH"   : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler]},
        "DELETE"  : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler]},
        realTime  : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler]}
    });
  });

  it('Test setting only requiresAuth to false of auth at route in the api model', () => {
    const apiModel = new ApiModel({'/cars' : {}});

    apiModel.setRequiresAuth('/cars/user', false);

    const merged = apiModel.get();
    expect(merged['/cars']['/user']['auth']).to.be.deep.equal({
        "GET"     : {requiresAuth: false, requiresRoles: false, policies:[createAuthHandler]},
        "HEAD"    : {requiresAuth: false, requiresRoles: false, policies:[createAuthHandler]},
        "OPTIONS" : {requiresAuth: false, requiresRoles: false, policies:[createAuthHandler]},
        "POST"    : {requiresAuth: false, requiresRoles: false, policies:[createAuthHandler]},
        "PUT"     : {requiresAuth: false, requiresRoles: false, policies:[createAuthHandler]},
        "PATCH"   : {requiresAuth: false, requiresRoles: false, policies:[createAuthHandler]},
        "DELETE"  : {requiresAuth: false, requiresRoles: false, policies:[createAuthHandler]},
        realTime  : {requiresAuth: false, requiresRoles: false, policies:[createAuthHandler]}
    });
  });

  it('Test adding one policy to auth at route in the api model', () => {
    const apiModel = new ApiModel({'/cars' : {}});

    function policy() {}

    apiModel.addPolicies('/cars/user', policy);

    const merged = apiModel.get();
    expect(merged['/cars']['/user']['auth']).to.be.deep.equal({
        "GET"     : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler, policy]},
        "HEAD"    : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler, policy]},
        "OPTIONS" : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler, policy]},
        "POST"    : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler, policy]},
        "PUT"     : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler, policy]},
        "PATCH"   : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler, policy]},
        "DELETE"  : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler, policy]},
        realTime  : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler, policy]}
    });
  });

  it('Test adding one policy to auth at route in the api model', () => {
    const apiModel = new ApiModel({'/cars' : {}});

    function policy1() {}
    function policy2() {}

    apiModel.addPolicies('/cars/user', [policy1, policy2]);

    const merged = apiModel.get();
    expect(merged['/cars']['/user']['auth']).to.be.deep.equal({
        "GET"     : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler, policy1, policy2]},
        "HEAD"    : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler, policy1, policy2]},
        "OPTIONS" : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler, policy1, policy2]},
        "POST"    : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler, policy1, policy2]},
        "PUT"     : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler, policy1, policy2]},
        "PATCH"   : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler, policy1, policy2]},
        "DELETE"  : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler, policy1, policy2]},
        realTime  : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler, policy1, policy2]}
    });
  });

  it('Test adding a new connect realTime handler at route in the api model', () => {
    const apiModel = new ApiModel({'/cars' : {}});

    function doSomeConnection() {}

    apiModel.addRealTimeHandler('/cars/user', {connect: doSomeConnection});

    const merged = apiModel.get();
    expect(merged['/cars']['/user']['realTime']).to.be.deep.equal({
      connect: [doSomeConnection],
      message: [],
      disconnect: []
    })
  });

  it('Test adding multiple connect realTime handler at route in the api model', () => {
    const apiModel = new ApiModel({'/cars' : {}});

    function doSomeConnection1() {}
    function doSomeConnection2() {}

    apiModel.addRealTimeHandler('/cars/user', {connect: [doSomeConnection1, doSomeConnection2]});

    const merged = apiModel.get();
    expect(merged['/cars']['/user']['realTime']).to.be.deep.equal({
      connect: [doSomeConnection1, doSomeConnection2],
      message: [],
      disconnect: []
    })
  });

  it('Test adding multiple connect, message and disconnect realTime handler at route in the api model', () => {
    const apiModel = new ApiModel({'/cars' : {}});

    function doSomeConnection1() {}
    function doSomeConnection2() {}

    function doSomeMessage1() {}
    function doSomeMessage2() {}

    function doSomeDisconnection() {}

    apiModel.addRealTimeHandler('/cars/user', {connect:    [doSomeConnection1, doSomeConnection2],
                                               message:    [doSomeMessage1, doSomeMessage2],
                                               disconnect: [doSomeDisconnection]});

    const merged = apiModel.get();
    expect(merged['/cars']['/user']['realTime']).to.be.deep.equal({
      connect:    [doSomeConnection1, doSomeConnection2],
      message:    [doSomeMessage1, doSomeMessage2],
      disconnect: [doSomeDisconnection]
    });
  });

  it('Test adding multiple connect, message and disconnect realTime handler at route in the api model', () => {
    const apiModel = new ApiModel({'/cars' : {}});

    function doSomeConnection1() {}
    function doSomeConnection2() {}

    function doSomeMessage1() {}
    function doSomeMessage2() {}

    function doSomeDisconnection() {}

    apiModel.addConnectHandler('/cars/user', [doSomeConnection1, doSomeConnection2]);
    apiModel.addMessageHandler('/cars/user', [doSomeMessage1, doSomeMessage2]);
    apiModel.addDisconnectHandler('/cars/user', doSomeDisconnection);

    const merged = apiModel.get();
    expect(merged['/cars']['/user']['realTime']).to.be.deep.equal({
      connect:    [doSomeConnection1, doSomeConnection2],
      message:    [doSomeMessage1, doSomeMessage2],
      disconnect: [doSomeDisconnection]
    });
  });

  it('Test creating a server from a api model', () => {
    const apiModel = new ApiModel({'/cars' : {}});

    expect(apiModel.models).to.be.an('array');
    expect(apiModel.models[0]).to.be.deep.equal({'/cars' : {}});

    const options = {};

    const server = apiModel.toServer(options);
    expect(server.server).to.not.be.undefined;
  });
});
