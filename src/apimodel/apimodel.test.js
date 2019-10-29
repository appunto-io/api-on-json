const chai   = require('chai');
const expect = chai.expect;

const { createAuthHandler } = require('../server/helpers/helpers.js');
const { ApiModel }          = require('./apimodel.js');
const { Server }            = require('../server/server.js');

const carsApiModel = {
  isApiModel: true,
  hasRealtime: true,
  '/cars': {
    auth : {
      "GET"     : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
      "HEAD"    : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
      "OPTIONS" : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
      "POST"    : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
      "PUT"     : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
      "PATCH"   : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
      "DELETE"  : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
      realTime  : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]}
    },
    fields : {},
    filters : {},
    handlers : {},
    realTime  : false,
    cors: {
      methods              : "GET,HEAD,PUT,PATCH,POST,DELETE",
      optionsSuccessStatus : 204,
      origin               : "*",
      preflightContinue    : false
    }
  },
  auth : {
    "GET"     : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
    "HEAD"    : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
    "OPTIONS" : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
    "POST"    : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
    "PUT"     : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
    "PATCH"   : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
    "DELETE"  : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
    realTime  : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]}
  },
  fields : {},
  filters : {},
  handlers : {},
  realTime  : false,
  cors: {
    methods              : "GET,HEAD,PUT,PATCH,POST,DELETE",
    optionsSuccessStatus : 204,
    origin               : "*",
    preflightContinue    : false
  }
};

const appleApiModel = {
  isApiModel: true,
  hasRealtime: true,
  '/apple': {
    auth : {
      "GET"     : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
      "HEAD"    : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
      "OPTIONS" : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
      "POST"    : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
      "PUT"     : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
      "PATCH"   : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
      "DELETE"  : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
      realTime  : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]}
    },
    fields : {},
    filters : {},
    handlers : {},
    realTime  : false,
    cors: {
      methods              : "GET,HEAD,PUT,PATCH,POST,DELETE",
      optionsSuccessStatus : 204,
      origin               : "*",
      preflightContinue    : false
    }
  },
  auth : {
    "GET"     : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
    "HEAD"    : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
    "OPTIONS" : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
    "POST"    : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
    "PUT"     : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
    "PATCH"   : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
    "DELETE"  : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
    realTime  : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]}
  },
  fields : {},
  filters : {},
  handlers : {},
  realTime  : false,
  cors: {
    methods              : "GET,HEAD,PUT,PATCH,POST,DELETE",
    optionsSuccessStatus : 204,
    origin               : "*",
    preflightContinue    : false
  }
};

const usersApiModel = {
  isApiModel: true,
  hasRealtime: true,
  auth : {
    "GET"     : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
    "HEAD"    : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
    "OPTIONS" : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
    "POST"    : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
    "PUT"     : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
    "PATCH"   : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
    "DELETE"  : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
    realTime  : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]}
  },
  '/cars': {
    auth : {
      "GET"     : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
      "HEAD"    : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
      "OPTIONS" : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
      "POST"    : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
      "PUT"     : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
      "PATCH"   : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
      "DELETE"  : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
      realTime  : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]}
    },
    fields : {},
    filters : {},
    handlers : {},
    realTime  : false,
    cors: {
      methods              : "GET,HEAD,PUT,PATCH,POST,DELETE",
      optionsSuccessStatus : 204,
      origin               : "*",
      preflightContinue    : false
    },
    '/users': {
      auth : {
        "GET"     : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        "HEAD"    : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        "OPTIONS" : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        "POST"    : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        "PUT"     : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        "PATCH"   : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        "DELETE"  : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        realTime  : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]}
      },
      fields : {},
      filters : {},
      handlers : {},
      realTime  : false,
      cors: {
        methods              : "GET,HEAD,PUT,PATCH,POST,DELETE",
        optionsSuccessStatus : 204,
        origin               : "*",
        preflightContinue    : false
      }
    }
  },
  fields : {},
  filters : {},
  handlers : {},
  realTime  : false,
  cors: {
    methods              : "GET,HEAD,PUT,PATCH,POST,DELETE",
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
    expect(apiModel.models[0]).to.be.deep.equal({
      isApiModel: true,
      hasRealtime: true,
      auth : {
        "GET"     : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        "HEAD"    : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        "OPTIONS" : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        "POST"    : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        "PUT"     : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        "PATCH"   : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        "DELETE"  : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        realTime  : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]}
      },
      fields : {},
      filters : {},
      handlers : {},
      realTime  : false,
      cors: {
        methods              : "GET,HEAD,PUT,PATCH,POST,DELETE",
        optionsSuccessStatus : 204,
        origin               : "*",
        preflightContinue    : false
      }
    });
  });

  it('Test the creation of a api model with multiple models', () => {
    const apiModel = new ApiModel({'/cars' : {}}, {'/apple' : {}});
    expect(apiModel.models).to.be.an('array');

    expect(apiModel.models[0]).to.be.deep.equal(carsApiModel);
    expect(apiModel.models[1]).to.be.deep.equal(appleApiModel);
  });

  it('Test adding Model method', () => {
    const apiModel = new ApiModel({'/cars' : {}});
    apiModel.addApiModel({'/apple' : {}})

    expect(apiModel.models).to.be.an('array');
    expect(apiModel.models[0]).to.be.deep.equal(carsApiModel);
    expect(apiModel.models[1]).to.be.deep.equal({'/apple' : {}});
  });

  it('Test getting the merged api model from an empty api model', () => {
    const apiModel = new ApiModel();
    const merged = apiModel.get();

    expect(apiModel.models).to.be.an('array');
    expect(apiModel.models).to.be.empty;
    expect(merged).to.be.deep.equal({
      isApiModel: true,
      hasRealtime: true,
      auth : {
        "GET"     : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        "HEAD"    : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        "OPTIONS" : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        "POST"    : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        "PUT"     : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        "PATCH"   : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        "DELETE"  : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        realTime  : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]}
      },
      fields : {},
      filters : {},
      handlers : {},
      realTime  : false,
      cors: {
        methods              : "GET,HEAD,PUT,PATCH,POST,DELETE",
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
    expect(apiModel.models[0]).to.be.deep.equal({
      isApiModel: true,
      hasRealtime: true,
      '/cars': {
        auth : {
          "GET"     : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
          "HEAD"    : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
          "OPTIONS" : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
          "POST"    : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
          "PUT"     : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
          "PATCH"   : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
          "DELETE"  : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
          realTime  : false
        },
        fields : {},
        filters : {},
        handlers : {},
        realTime  : false,
        cors: {
          methods              : "GET,HEAD,PUT,PATCH,POST,DELETE",
          optionsSuccessStatus : 204,
          origin               : "*",
          preflightContinue    : false
        }
      },
      auth : {
        "GET"     : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        "HEAD"    : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        "OPTIONS" : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        "POST"    : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        "PUT"     : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        "PATCH"   : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        "DELETE"  : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        realTime  : false
      },
      fields : {},
      filters : {},
      handlers : {},
      realTime  : false,
      cors: {
        methods              : "GET,HEAD,PUT,PATCH,POST,DELETE",
        optionsSuccessStatus : 204,
        origin               : "*",
        preflightContinue    : false
      }
    });

    expect(merged).to.be.deep.equal(carsApiModel);

    apiModel.addApiModel({'/apple' : {}});
    const merged2 = apiModel.get();

    expect(apiModel.models).to.be.an('array');
    expect(merged2).to.be.deep.equal({...carsApiModel, ...appleApiModel});
  });

  it('Test adding a new route to an existing path in the api model', () => {
    const apiModel = new ApiModel({'/cars': {}});

    expect(apiModel.models).to.be.an('array');
    expect(apiModel.models[0]).to.be.deep.equal(carsApiModel);

    apiModel.addRoute('cars/users', {});
    const merged = apiModel.get();

    expect(merged).to.be.deep.equal(usersApiModel);
  });

  it('Test adding a new route in the api model', () => {
    const apiModel = new ApiModel({'/cars' : {}});

    expect(apiModel.models).to.be.an('array');
    expect(apiModel.models[0]).to.be.deep.equal(carsApiModel);

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
      hasRealtime: true,
      auth : {
        "GET"     : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        "HEAD"    : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        "OPTIONS" : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        "POST"    : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        "PUT"     : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        "PATCH"   : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        "DELETE"  : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]},
        realTime  : {requiresAuth:true,requiresRoles:false, policies:[createAuthHandler]}
      },
      fields : {},
      filters : {},
      handlers : {},
      realTime  : false,
      cors: {
        methods              : "GET,HEAD,PUT,PATCH,POST,DELETE",
        optionsSuccessStatus : 204,
        origin               : "*",
        preflightContinue    : false
      }
    });
  });

  it('Test creating a server from a api model', () => {
    const apiModel = new ApiModel({'/cars' : {}});

    expect(apiModel.models).to.be.an('array');
    expect(apiModel.models[0]).to.be.deep.equal(carsApiModel);

    const options = {};

    const server = apiModel.toServer(options);
  });
});
