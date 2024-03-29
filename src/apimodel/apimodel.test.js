const chai   = require('chai');
const expect = chai.expect;

const { ApiModel } = require('./apimodel.js');

const carsApiModel = {
  isApiModel: true,
  hasRealtime: false,
  security: false,
  '/cars': {
    auth : {
      "GET"     : {requiresAuth:true, requiresRoles:false, policies:[]},
      "HEAD"    : {requiresAuth:true, requiresRoles:false, policies:[]},
      "OPTIONS" : {requiresAuth:true, requiresRoles:false, policies:[]},
      "POST"    : {requiresAuth:true, requiresRoles:false, policies:[]},
      "PUT"     : {requiresAuth:true, requiresRoles:false, policies:[]},
      "PATCH"   : {requiresAuth:true, requiresRoles:false, policies:[]},
      "DELETE"  : {requiresAuth:true, requiresRoles:false, policies:[]},
      realTime  : {requiresAuth:true, requiresRoles:false, policies:[]}
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
    "GET"     : {requiresAuth:true, requiresRoles:false, policies:[]},
    "HEAD"    : {requiresAuth:true, requiresRoles:false, policies:[]},
    "OPTIONS" : {requiresAuth:true, requiresRoles:false, policies:[]},
    "POST"    : {requiresAuth:true, requiresRoles:false, policies:[]},
    "PUT"     : {requiresAuth:true, requiresRoles:false, policies:[]},
    "PATCH"   : {requiresAuth:true, requiresRoles:false, policies:[]},
    "DELETE"  : {requiresAuth:true, requiresRoles:false, policies:[]},
    realTime  : {requiresAuth:true, requiresRoles:false, policies:[]}
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
  security: false,
  '/apple': {
    auth : {
      "GET"     : {requiresAuth:true, requiresRoles:false, policies:[]},
      "HEAD"    : {requiresAuth:true, requiresRoles:false, policies:[]},
      "OPTIONS" : {requiresAuth:true, requiresRoles:false, policies:[]},
      "POST"    : {requiresAuth:true, requiresRoles:false, policies:[]},
      "PUT"     : {requiresAuth:true, requiresRoles:false, policies:[]},
      "PATCH"   : {requiresAuth:true, requiresRoles:false, policies:[]},
      "DELETE"  : {requiresAuth:true, requiresRoles:false, policies:[]},
      realTime  : {requiresAuth:true, requiresRoles:false, policies:[]}
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
    "GET"     : {requiresAuth:true, requiresRoles:false, policies:[]},
    "HEAD"    : {requiresAuth:true, requiresRoles:false, policies:[]},
    "OPTIONS" : {requiresAuth:true, requiresRoles:false, policies:[]},
    "POST"    : {requiresAuth:true, requiresRoles:false, policies:[]},
    "PUT"     : {requiresAuth:true, requiresRoles:false, policies:[]},
    "PATCH"   : {requiresAuth:true, requiresRoles:false, policies:[]},
    "DELETE"  : {requiresAuth:true, requiresRoles:false, policies:[]},
    realTime  : {requiresAuth:true, requiresRoles:false, policies:[]}
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
  security: false,
  auth : {
    "GET"     : {requiresAuth:true, requiresRoles:false, policies:[]},
    "HEAD"    : {requiresAuth:true, requiresRoles:false, policies:[]},
    "OPTIONS" : {requiresAuth:true, requiresRoles:false, policies:[]},
    "POST"    : {requiresAuth:true, requiresRoles:false, policies:[]},
    "PUT"     : {requiresAuth:true, requiresRoles:false, policies:[]},
    "PATCH"   : {requiresAuth:true, requiresRoles:false, policies:[]},
    "DELETE"  : {requiresAuth:true, requiresRoles:false, policies:[]},
    realTime  : {requiresAuth:true, requiresRoles:false, policies:[]}
  },
  '/cars': {
    auth : {
      "GET"     : {requiresAuth:true, requiresRoles:false, policies:[]},
      "HEAD"    : {requiresAuth:true, requiresRoles:false, policies:[]},
      "OPTIONS" : {requiresAuth:true, requiresRoles:false, policies:[]},
      "POST"    : {requiresAuth:true, requiresRoles:false, policies:[]},
      "PUT"     : {requiresAuth:true, requiresRoles:false, policies:[]},
      "PATCH"   : {requiresAuth:true, requiresRoles:false, policies:[]},
      "DELETE"  : {requiresAuth:true, requiresRoles:false, policies:[]},
      realTime  : {requiresAuth:true, requiresRoles:false, policies:[]}
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
        "GET"     : {requiresAuth:true, requiresRoles:false, policies:[]},
        "HEAD"    : {requiresAuth:true, requiresRoles:false, policies:[]},
        "OPTIONS" : {requiresAuth:true, requiresRoles:false, policies:[]},
        "POST"    : {requiresAuth:true, requiresRoles:false, policies:[]},
        "PUT"     : {requiresAuth:true, requiresRoles:false, policies:[]},
        "PATCH"   : {requiresAuth:true, requiresRoles:false, policies:[]},
        "DELETE"  : {requiresAuth:true, requiresRoles:false, policies:[]},
        realTime  : {requiresAuth:true, requiresRoles:false, policies:[]}
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
  it('Test getting the merged api model from an empty api model', () => {
    const apiModel = new ApiModel();
    const merged = apiModel.get();

    expect(merged).to.be.deep.equal({
      isApiModel: true,
      hasRealtime: false,
      security: false,
      auth : {
        "GET"     : {requiresAuth:true, requiresRoles:false, policies:[]},
        "HEAD"    : {requiresAuth:true, requiresRoles:false, policies:[]},
        "OPTIONS" : {requiresAuth:true, requiresRoles:false, policies:[]},
        "POST"    : {requiresAuth:true, requiresRoles:false, policies:[]},
        "PUT"     : {requiresAuth:true, requiresRoles:false, policies:[]},
        "PATCH"   : {requiresAuth:true, requiresRoles:false, policies:[]},
        "DELETE"  : {requiresAuth:true, requiresRoles:false, policies:[]},
        realTime  : {requiresAuth:true, requiresRoles:false, policies:[]}
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

  it('addModel with empty models', () => {
    const apiModel = new ApiModel({'/cars' : {}});

    expect(apiModel.get()).to.be.deep.equal(carsApiModel);

    apiModel.addModel({'/apple' : {}});

    expect(apiModel.get()).to.be.deep.equal({...carsApiModel, ...appleApiModel});
  });

  it('addModel', () => {
    const nop = () => {};
    const apiModel = new ApiModel();
    const model1 = new ApiModel({'/cars' : {handlers : {GET : [nop]}}});

    apiModel.addModel(model1);
    apiModel.addModel({'/apple' : {handlers : {GET : [nop]}}});

    expect(apiModel.get()['/cars'].handlers['GET']).to.exist;
    expect(apiModel.get()['/apple'].handlers['GET']).to.exist;
  });


  it('addRoute', () => {
    const apiModel = new ApiModel({'/cars' : {}});

    apiModel.addRoute('apple', {});

    expect(apiModel.get()).to.be.deep.equal({...carsApiModel, ...appleApiModel});
  });

  it('addRoute - nested routes', () => {
    const apiModel = new ApiModel({'/cars': {}});

    apiModel.addRoute('/cars/users', {});

    expect(apiModel.get()).to.be.deep.equal(usersApiModel);
  });

  it('Test removing a route in the api model', () => {
    const apiModel = new ApiModel({});
    apiModel.addModel({'/cars' : {}});

    expect(apiModel.get()).to.be.deep.equal(carsApiModel);

    apiModel.removeRoute('/cars');

    expect(apiModel.get()).to.be.deep.equal({
      isApiModel: true,
      hasRealtime: false,
      security: false,
      auth : {
        "GET"     : {requiresAuth:true, requiresRoles:false, policies:[]},
        "HEAD"    : {requiresAuth:true, requiresRoles:false, policies:[]},
        "OPTIONS" : {requiresAuth:true, requiresRoles:false, policies:[]},
        "POST"    : {requiresAuth:true, requiresRoles:false, policies:[]},
        "PUT"     : {requiresAuth:true, requiresRoles:false, policies:[]},
        "PATCH"   : {requiresAuth:true, requiresRoles:false, policies:[]},
        "DELETE"  : {requiresAuth:true, requiresRoles:false, policies:[]},
        realTime  : {requiresAuth:true, requiresRoles:false, policies:[]}
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

    const compiled = apiModel.get();
    expect(compiled['/cars']['/brand']['handlers']['GET']).to.be.deep.equal([getBrand]);
  });

  it('Test adding multiple handler at route in the api model', () => {
    const apiModel = new ApiModel({'/cars' : {}});

    function getBrand1() {}
    function getBrand2() {}

    apiModel.addHandler('/cars/brand', 'GET', [getBrand1, getBrand2]);

    const compiled = apiModel.get();
    expect(compiled['/cars']['/brand']['handlers']['GET']).to.be.deep.equal([getBrand1, getBrand2]);
  });

  it('Test adding a new filter at route in the api model', () => {
    const apiModel = new ApiModel({'/cars' : {}});

    function filterBrand() {}

    apiModel.addFilter('/cars/brand', 'POST', filterBrand);

    const compiled = apiModel.get();
    expect(compiled['/cars']['/brand']['filters']['POST']).to.be.deep.equal([filterBrand]);
  });

  it('Test adding multiple filter at route in the api model', () => {
    const apiModel = new ApiModel({'/cars' : {}});

    function filterBrand1() {}
    function filterBrand2() {}

    apiModel.addFilter('/cars/brand', 'POST', [filterBrand1, filterBrand2]);

    const compiled = apiModel.get();
    expect(compiled['/cars']['/brand']['filters']['POST']).to.be.deep.equal([filterBrand1, filterBrand2]);
  });

  it('Test setting auth at route in the api model', () => {
    const apiModel = new ApiModel({'/cars' : {}});

    apiModel.setAuth('/cars/user', {requiresAuth: true, requiresRoles: ['admin']});

    const compiled = apiModel.get();
    expect(compiled['/cars']['/user']['auth']).to.be.deep.equal({
        "GET"     : {requiresAuth: true, requiresRoles: ['admin'], policies:[]},
        "HEAD"    : {requiresAuth: true, requiresRoles: ['admin'], policies:[]},
        "OPTIONS" : {requiresAuth: true, requiresRoles: ['admin'], policies:[]},
        "POST"    : {requiresAuth: true, requiresRoles: ['admin'], policies:[]},
        "PUT"     : {requiresAuth: true, requiresRoles: ['admin'], policies:[]},
        "PATCH"   : {requiresAuth: true, requiresRoles: ['admin'], policies:[]},
        "DELETE"  : {requiresAuth: true, requiresRoles: ['admin'], policies:[]},
        realTime  : {requiresAuth: true, requiresRoles: ['admin'], policies:[]}
    });
  });

  it('Test setting false auth at route in the api model', () => {
    const apiModel = new ApiModel({'/cars' : {}});

    apiModel.setAuth('/cars/user', false);

    const compiled = apiModel.get();
    expect(compiled['/cars']['/user']['auth']).to.be.deep.equal({
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

    const compiled = apiModel.get();
    expect(compiled['/cars']['/user']['auth']).to.be.deep.equal({
        "GET"     : {requiresAuth: true, requiresRoles: ['admin'], policies:[]},
        "HEAD"    : {requiresAuth: true, requiresRoles: ['admin'], policies:[]},
        "OPTIONS" : {requiresAuth: true, requiresRoles: ['admin'], policies:[]},
        "POST"    : {requiresAuth: true, requiresRoles: ['admin'], policies:[]},
        "PUT"     : {requiresAuth: true, requiresRoles: ['admin'], policies:[]},
        "PATCH"   : {requiresAuth: true, requiresRoles: ['admin'], policies:[]},
        "DELETE"  : {requiresAuth: true, requiresRoles: ['admin'], policies:[]},
        realTime  : {requiresAuth: true, requiresRoles: ['admin'], policies:[]}
    });
  });

  it('Test setting multiples roles only in auth at route in the api model', () => {
    const apiModel = new ApiModel({'/cars' : {}});

    apiModel.setRequiresRoles('/cars/user', ['admin', 'user']);

    const compiled = apiModel.get();
    expect(compiled['/cars']['/user']['auth']).to.be.deep.equal({
        "GET"     : {requiresAuth: true, requiresRoles: ['admin', 'user'], policies:[]},
        "HEAD"    : {requiresAuth: true, requiresRoles: ['admin', 'user'], policies:[]},
        "OPTIONS" : {requiresAuth: true, requiresRoles: ['admin', 'user'], policies:[]},
        "POST"    : {requiresAuth: true, requiresRoles: ['admin', 'user'], policies:[]},
        "PUT"     : {requiresAuth: true, requiresRoles: ['admin', 'user'], policies:[]},
        "PATCH"   : {requiresAuth: true, requiresRoles: ['admin', 'user'], policies:[]},
        "DELETE"  : {requiresAuth: true, requiresRoles: ['admin', 'user'], policies:[]},
        realTime  : {requiresAuth: true, requiresRoles: ['admin', 'user'], policies:[]}
    });
  });

  it('Test setting only requiresAuth to true of auth at route in the api model', () => {
    const apiModel = new ApiModel({'/cars' : {}});

    apiModel.setRequiresAuth('/cars/user', true);

    const compiled = apiModel.get();
    expect(compiled['/cars']['/user']['auth']).to.be.deep.equal({
        "GET"     : {requiresAuth: true, requiresRoles: false, policies:[]},
        "HEAD"    : {requiresAuth: true, requiresRoles: false, policies:[]},
        "OPTIONS" : {requiresAuth: true, requiresRoles: false, policies:[]},
        "POST"    : {requiresAuth: true, requiresRoles: false, policies:[]},
        "PUT"     : {requiresAuth: true, requiresRoles: false, policies:[]},
        "PATCH"   : {requiresAuth: true, requiresRoles: false, policies:[]},
        "DELETE"  : {requiresAuth: true, requiresRoles: false, policies:[]},
        realTime  : {requiresAuth: true, requiresRoles: false, policies:[]}
    });
  });

  it('Test setting only requiresAuth to false of auth at route in the api model', () => {
    const apiModel = new ApiModel({'/cars' : {}});

    apiModel.setRequiresAuth('/cars/user', false);

    const compiled = apiModel.get();
    expect(compiled['/cars']['/user']['auth']).to.be.deep.equal({
        "GET"     : {requiresAuth: false, requiresRoles: false, policies:[]},
        "HEAD"    : {requiresAuth: false, requiresRoles: false, policies:[]},
        "OPTIONS" : {requiresAuth: false, requiresRoles: false, policies:[]},
        "POST"    : {requiresAuth: false, requiresRoles: false, policies:[]},
        "PUT"     : {requiresAuth: false, requiresRoles: false, policies:[]},
        "PATCH"   : {requiresAuth: false, requiresRoles: false, policies:[]},
        "DELETE"  : {requiresAuth: false, requiresRoles: false, policies:[]},
        realTime  : {requiresAuth: false, requiresRoles: false, policies:[]}
    });
  });

  // it('Test adding one policy to auth at route in the api model', () => {
  //   const apiModel = new ApiModel({'/cars' : {}});
  //
  //   function policy() {}
  //
  //   apiModel.addPolicies('/cars/user', policy);
  //
  //   const compiled = apiModel.get();
  //   expect(compiled['/cars']['/user']['auth']).to.be.deep.equal({
  //       "GET"     : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler, policy]},
  //       "HEAD"    : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler, policy]},
  //       "OPTIONS" : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler, policy]},
  //       "POST"    : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler, policy]},
  //       "PUT"     : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler, policy]},
  //       "PATCH"   : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler, policy]},
  //       "DELETE"  : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler, policy]},
  //       realTime  : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler, policy]}
  //   });
  // });
  //
  // it('Test adding one policy to auth at route in the api model', () => {
  //   const apiModel = new ApiModel({'/cars' : {}});
  //
  //   function policy1() {}
  //   function policy2() {}
  //
  //   apiModel.addPolicies('/cars/user', [policy1, policy2]);
  //
  //   const compiled = apiModel.get();
  //   expect(compiled['/cars']['/user']['auth']).to.be.deep.equal({
  //       "GET"     : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler, policy1, policy2]},
  //       "HEAD"    : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler, policy1, policy2]},
  //       "OPTIONS" : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler, policy1, policy2]},
  //       "POST"    : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler, policy1, policy2]},
  //       "PUT"     : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler, policy1, policy2]},
  //       "PATCH"   : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler, policy1, policy2]},
  //       "DELETE"  : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler, policy1, policy2]},
  //       realTime  : {requiresAuth: true, requiresRoles: false, policies:[createAuthHandler, policy1, policy2]}
  //   });
  // });

  it('Test adding a new connect realTime handler at route in the api model', () => {
    const apiModel = new ApiModel({'/cars' : {}});

    function doSomeConnection() {}

    apiModel.addRealTimeHandler('/cars/user', {connect: doSomeConnection});

    const compiled = apiModel.get();
    expect(compiled['/cars']['/user']['realTime']).to.be.deep.equal({
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

    const compiled = apiModel.get();
    expect(compiled['/cars']['/user']['realTime']).to.be.deep.equal({
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

    const compiled = apiModel.get();
    expect(compiled['/cars']['/user']['realTime']).to.be.deep.equal({
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

    const compiled = apiModel.get();
    expect(compiled['/cars']['/user']['realTime']).to.be.deep.equal({
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
