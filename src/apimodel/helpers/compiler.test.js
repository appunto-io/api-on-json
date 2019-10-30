const {
  compileRequestRequirements,
  compileAuthRequirements,
  compileEndpointModel,
  compileCors,
  compileHandlersList,
  compileRealTime
} = require('./compiler.js');

const { createAuthHandler } = require('../../server/helpers/helpers.js')

const chai   = require('chai');
const expect = chai.expect;

describe('compileRequestRequirements', () => {
  it('compileRequestRequirements', () => {
    const fn = compileRequestRequirements;

    expect(fn(false)).to.be.false;
    expect(fn('string')).to.be.false;
    expect(fn(true)).to.deep.equal({requiresAuth:false, requiresRoles:false, policies : [createAuthHandler]});
    expect(fn({
      requiresAuth : true
    })).to.deep.equal({requiresAuth:true, requiresRoles:false, policies : [createAuthHandler]});
    expect(fn({
      requiresRoles : false
    })).to.deep.equal({requiresAuth:true, requiresRoles:false, policies : [createAuthHandler]});
    expect(fn({
      requiresRoles : ['role1', 'role2']
    })).to.deep.equal({requiresAuth:true, requiresRoles:['role1', 'role2'], policies : [createAuthHandler]});
    expect(fn({
      requiresAuth : true,
      requiresRoles : ['role1', 'role2']
    })).to.deep.equal({requiresAuth:true, requiresRoles:['role1',  'role2'], policies : [createAuthHandler]});
  });
});

describe('compileAuthRequirements', () => {
  it('compileAuthRequirements', () => {
    const fn = compileAuthRequirements;
    const def = {
      "GET"     : {requiresAuth:true, requiresRoles:['default-role']},
      "HEAD"    : {requiresAuth:true, requiresRoles:['default-role']},
      "OPTIONS" : {requiresAuth:true, requiresRoles:['default-role']},
      "POST"    : {requiresAuth:true, requiresRoles:['default-role']},
      "PUT"     : {requiresAuth:true, requiresRoles:['default-role']},
      "PATCH"   : {requiresAuth:true, requiresRoles:['default-role']},
      "DELETE"  : {requiresAuth:true, requiresRoles:['default-role']},
      realTime  : {requiresAuth:true, requiresRoles:false, policies : [createAuthHandler]}
    };

    expect(fn({}, def)).to.deep.equal(def);

    expect(fn({
      requiresAuth:false
    }, def)).to.deep.equal(Object.assign({}, def, {
      "GET"     : {requiresAuth:false, requiresRoles:false, policies : [createAuthHandler]},
      "HEAD"    : {requiresAuth:false, requiresRoles:false, policies : [createAuthHandler]},
      "OPTIONS" : {requiresAuth:false, requiresRoles:false, policies : [createAuthHandler]},
      "POST"    : {requiresAuth:false, requiresRoles:false, policies : [createAuthHandler]},
      "PUT"     : {requiresAuth:false, requiresRoles:false, policies : [createAuthHandler]},
      "PATCH"   : {requiresAuth:false, requiresRoles:false, policies : [createAuthHandler]},
      "DELETE"  : {requiresAuth:false, requiresRoles:false, policies : [createAuthHandler]}
    }));

    expect(fn({
      requiresRoles:['role1']
    }, def)).to.deep.equal(Object.assign({}, def, {
      "GET"     : {requiresAuth:true, requiresRoles:['role1'], policies : [createAuthHandler]},
      "HEAD"    : {requiresAuth:true, requiresRoles:['role1'], policies : [createAuthHandler]},
      "OPTIONS" : {requiresAuth:true, requiresRoles:['role1'], policies : [createAuthHandler]},
      "POST"    : {requiresAuth:true, requiresRoles:['role1'], policies : [createAuthHandler]},
      "PUT"     : {requiresAuth:true, requiresRoles:['role1'], policies : [createAuthHandler]},
      "PATCH"   : {requiresAuth:true, requiresRoles:['role1'], policies : [createAuthHandler]},
      "DELETE"  : {requiresAuth:true, requiresRoles:['role1'], policies : [createAuthHandler]}
    }));

    expect(fn({
      requiresRoles:['role1'],
      write : false
    }, def)).to.deep.equal(Object.assign({}, def, {
      "GET"     : {requiresAuth:true, requiresRoles:['role1'], policies : [createAuthHandler]},
      "HEAD"    : {requiresAuth:true, requiresRoles:['role1'], policies : [createAuthHandler]},
      "OPTIONS" : {requiresAuth:true, requiresRoles:['role1'], policies : [createAuthHandler]},
      "POST"    : false,
      "PUT"     : false,
      "PATCH"   : false,
      "DELETE"  : false
    }));

    expect(fn({
      requiresRoles:['role1'],
      write : false,
      'PUT' : {requiresRoles:["dev"]}
    }, def)).to.deep.equal(Object.assign({}, def, {
      "GET"     : {requiresAuth:true, requiresRoles:['role1'], policies : [createAuthHandler]},
      "HEAD"    : {requiresAuth:true, requiresRoles:['role1'], policies : [createAuthHandler]},
      "OPTIONS" : {requiresAuth:true, requiresRoles:['role1'], policies : [createAuthHandler]},
      "POST"    : false,
      "PUT"     : {requiresAuth:true, requiresRoles:['dev'], policies : [createAuthHandler]},
      "PATCH"   : false,
      "DELETE"  : false
    }));

    expect(fn({
      write:false
    }, def)).to.deep.equal(Object.assign({}, def, {
      "POST"    : false,
      "PUT"     : false,
      "PATCH"   : false,
      "DELETE"  : false
    }));

    expect(fn({
      read:false
    }, def)).to.deep.equal(Object.assign({}, def, {
      "GET"     : false,
      "HEAD"    : false,
      "OPTIONS" : false
    }));

    expect(fn({
      write:false,
      read:false
    })).to.deep.equal(Object.assign({}, def, {
      "GET"     : false,
      "HEAD"    : false,
      "OPTIONS" : false,
      "POST"    : false,
      "PUT"     : false,
      "PATCH"   : false,
      "DELETE"  : false
    }));

    expect(fn({
      write:false,
      read:true
    }, def)).to.deep.equal(Object.assign({}, def, {
      "POST"    : false,
      "PUT"     : false,
      "PATCH"   : false,
      "DELETE"  : false,
      "GET"     : {requiresAuth:false, requiresRoles:false, policies : [createAuthHandler]},
      "HEAD"    : {requiresAuth:false, requiresRoles:false, policies : [createAuthHandler]},
      "OPTIONS" : {requiresAuth:false, requiresRoles:false, policies : [createAuthHandler]},
    }));

    expect(fn({
      write:false,
      'PUT' : {requiresRoles:["role1", "role2"]}
    }, def)).to.deep.equal(Object.assign({}, def, {
      "POST"    : false,
      "PUT"     : {requiresAuth:true, requiresRoles:["role1", "role2"], policies : [createAuthHandler]},
      "PATCH"   : false,
      "DELETE"  : false,
    }));
  });
});



describe('compileHandlersList', () => {
  it('compileHandlersList', () => {
    const fn = compileHandlersList;

    expect(fn({
      'read' : 'value'
    })).to.deep.equal({
      'GET'      : ['value'],
      'HEAD'     : ['value'],
      'OPTIONS'  : ['value'],
      'realTime' : ['value']
    });

    expect(fn({
      'write' : 'value'
    })).to.deep.equal({
      "POST"    : ['value'],
      "PUT"     : ['value'],
      "PATCH"   : ['value'],
      "DELETE"  : ['value'],
    });

    expect(fn({
      'read'  : 'readValue',
      'write' : 'writeValue'
    })).to.deep.equal({
      'GET'      : ['readValue'],
      'HEAD'     : ['readValue'],
      'OPTIONS'  : ['readValue'],
      'realTime' : ['readValue'],
      "POST"     : ['writeValue'],
      "PUT"      : ['writeValue'],
      "PATCH"    : ['writeValue'],
      "DELETE"   : ['writeValue'],
    });

    expect(fn({
      'read'  : 'readValue',
      'write' : ['writeValue', 'writeValue2'],
      'GET' : 'getValue'
    })).to.deep.equal({
      'GET'      : ['getValue'],
      'HEAD'     : ['readValue'],
      'OPTIONS'  : ['readValue'],
      'realTime' : ['readValue'],
      "POST"     : ['writeValue', 'writeValue2'],
      "PUT"      : ['writeValue', 'writeValue2'],
      "PATCH"    : ['writeValue', 'writeValue2'],
      "DELETE"   : ['writeValue', 'writeValue2'],
    });

  });
});


describe('compileEndpointModel', () => {
  it('auth and fields', () => {
    const fn = compileEndpointModel;

    expect(fn({})).to.deep.equal({
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
      realTime  : false,
      cors: {
        methods              : "GET, HEAD, PUT, PATCH, POST, DELETE",
        optionsSuccessStatus : 204,
        origin               : "*",
        preflightContinue    : false
      }
    });

    expect(fn({
      auth : {requiresAuth:false},
      fields : {
        'createdAt' : {
          auth : {
            read : false,
            write : false
          }
        }
      }
    })).to.deep.equal({
      auth : {
        "GET"     : {requiresAuth:false, requiresRoles:false, policies:[createAuthHandler]},
        "HEAD"    : {requiresAuth:false, requiresRoles:false, policies:[createAuthHandler]},
        "OPTIONS" : {requiresAuth:false, requiresRoles:false, policies:[createAuthHandler]},
        "POST"    : {requiresAuth:false, requiresRoles:false, policies:[createAuthHandler]},
        "PUT"     : {requiresAuth:false, requiresRoles:false, policies:[createAuthHandler]},
        "PATCH"   : {requiresAuth:false, requiresRoles:false, policies:[createAuthHandler]},
        "DELETE"  : {requiresAuth:false, requiresRoles:false, policies:[createAuthHandler]},
        realTime  : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]}
      },
      filters : {},
      handlers : {},
      realTime  : false,
      cors: {
        methods              : "GET, HEAD, PUT, PATCH, POST, DELETE",
        optionsSuccessStatus : 204,
        origin               : "*",
        preflightContinue    : false
      },
      fields : {
        'createdAt' : {
          auth : {
            "GET"     : false,
            "HEAD"    : false,
            "OPTIONS" : false,
            "POST"    : false,
            "PUT"     : false,
            "PATCH"   : false,
            "DELETE"  : false,
            realTime  : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]}
          }
        }
      }
    });
  });



  it('filters and handlers', () => {
    const fn = compileEndpointModel;

    expect(fn({
      handlers : {
        "GET" : '::getHandler'
      },
      filters : {
        "POST" : ['::getFilter1', '::getFilter2']
      }
    })).to.deep.equal({
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
      filters : {
        "POST" : ['::getFilter1', '::getFilter2']
      },
      handlers : {
        "GET" : ['::getHandler']
      },
      realTime  : false,
      cors: {
        methods              : "GET, HEAD, PUT, PATCH, POST, DELETE",
        optionsSuccessStatus : 204,
        origin               : "*",
        preflightContinue    : false
      }
    });
  });

  it('filters and handlers', () => {
    const fn = compileEndpointModel;

    expect(fn({
      '/collection' : {
        handlers : {
          'GET' : '::getHandler'
        }
      }
    })).to.deep.equal({
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
      realTime : false,
      cors: {
        methods              : "GET, HEAD, PUT, PATCH, POST, DELETE",
        optionsSuccessStatus : 204,
        origin               : "*",
        preflightContinue    : false
      },
      '/collection' : {
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
        handlers : {
          'GET' : ['::getHandler']
        },
        realTime : false,
        cors: {
          methods              : "GET, HEAD, PUT, PATCH, POST, DELETE",
          optionsSuccessStatus : 204,
          origin               : "*",
          preflightContinue    : false
        }
      }
    });

    expect(fn({
      auth : {
        'POST' : {requiresAuth:true, requiresRoles:['testRole']},
      },
      '/collection' : {
        '/child' : {
          handlers : {
            'GET' : '::getChildHandler'
          }
        }
      }
    })).to.deep.equal({
      auth : {
        "GET"     : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
        "HEAD"    : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
        "OPTIONS" : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
        'POST'    : {requiresAuth:true, requiresRoles:['testRole'], policies:[createAuthHandler]},
        "PUT"     : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
        "PATCH"   : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
        "DELETE"  : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
        realTime  : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]}
      },
      fields : {},
      filters : {},
      handlers : {},
      realTime  : false,
      cors: {
        methods              : "GET, HEAD, PUT, PATCH, POST, DELETE",
        optionsSuccessStatus : 204,
        origin               : "*",
        preflightContinue    : false
      },
      '/collection' : {
        auth : {
          "GET"     : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
          "HEAD"    : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
          "OPTIONS" : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
          'POST'    : {requiresAuth:true, requiresRoles:['testRole'], policies:[createAuthHandler]},
          "PUT"     : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
          "PATCH"   : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
          "DELETE"  : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
          realTime  : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]}
        },
        fields : {},
        filters : {},
        handlers : {},
        realTime  : false,
        cors: {
          methods              : "GET, HEAD, PUT, PATCH, POST, DELETE",
          optionsSuccessStatus : 204,
          origin               : "*",
          preflightContinue    : false
        },
        '/child' : {
          auth : {
            "GET"     : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
            "HEAD"    : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
            "OPTIONS" : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
            'POST'    : {requiresAuth:true, requiresRoles:['testRole'], policies:[createAuthHandler]},
            "PUT"     : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
            "PATCH"   : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
            "DELETE"  : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]},
            realTime  : {requiresAuth:true, requiresRoles:false, policies:[createAuthHandler]}
          },
          fields : {},
          filters : {},
          handlers : {
            'GET' : ['::getChildHandler']
          },
          realTime  : false,
          cors: {
            methods              : "GET, HEAD, PUT, PATCH, POST, DELETE",
            optionsSuccessStatus : 204,
            origin               : "*",
            preflightContinue    : false
          }
        }
      }
    });
  });

  it('Test compilation with cors', () => {
    const fn = compileEndpointModel;

    expect(fn({
      cors: {
        origin: 'example.com'
      }
    })).to.deep.equal({
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
      realTime  : false,
      cors: {
        methods              : "GET, HEAD, PUT, PATCH, POST, DELETE",
        optionsSuccessStatus : 204,
        origin               : "example.com",
        preflightContinue    : false
      }
    });
  });

  it('Test compilation with cors with nested', () => {
    const fn = compileEndpointModel;

    expect(fn({
      cors: {
        origin: '*'
      },
      '/:id' : {
        cors: {
          origin: 'example.com'
        }
      }
    })).to.deep.equal({
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
      realTime  : false,
      cors: {
        methods              : "GET, HEAD, PUT, PATCH, POST, DELETE",
        optionsSuccessStatus : 204,
        origin               : "*",
        preflightContinue    : false
      },
      '/:id' : {
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
        realTime  : false,
        cors : {
          methods              : "GET, HEAD, PUT, PATCH, POST, DELETE",
          optionsSuccessStatus : 204,
          origin               : "example.com",
          preflightContinue    : false
        }
      }
    });
  });
});

describe('compileRealTime', () => {
  it('compileRealTime', () => {
    const fn = compileRealTime;

    expect(fn({
    })).to.deep.equal({
      'connect'    : [],
      'message'    : [],
      'disconnect' : []
    });

    expect(fn({
      'connect' : '::connect'
    })).to.deep.equal({
      'connect'    : '::connect',
      'message'    : [],
      'disconnect' : []
    });

    expect(fn({
      'disconnect' : '::disconnect'
    })).to.deep.equal({
      'connect'    : [],
      'message'    : [],
      'disconnect' : '::disconnect'
    });

    expect(fn({
      'message' : '::message'
    })).to.deep.equal({
      'connect'    : [],
      'message'    : '::message',
      'disconnect' : []
    });

    expect(fn({
      'connect' : '::connect',
      'message' : '::message'
    })).to.deep.equal({
      'connect'    : '::connect',
      'message'    : '::message',
      'disconnect' : []
    });

    expect(fn({
      'connect'    : '::connect',
      'message'    : '::message',
      'disconnect' : '::disconnect'
    })).to.deep.equal({
      'connect'    : '::connect',
      'message'    : '::message',
      'disconnect' : '::disconnect'
    });
  });
});

describe('compileCors', () => {
  const defaultCors = {
    origin               : "*",
    methods              : "GET, HEAD, PUT, PATCH, POST, DELETE",
    preflightContinue    : false,
    optionsSuccessStatus : 204
  };

  it('compileCors', () => {
    const fn = compileCors;

    expect(fn({
    }, defaultCors)).to.deep.equal({
      methods              : "GET, HEAD, PUT, PATCH, POST, DELETE",
      optionsSuccessStatus : 204,
      origin               : "*",
      preflightContinue    : false
    });

    expect(fn({
      methods : "POST, HEAD"
    }, defaultCors)).to.deep.equal({
      methods              : "POST, HEAD",
      optionsSuccessStatus : 204,
      origin               : "*",
      preflightContinue    : false
    });

    expect(fn({
      origin : "example.com"
    }, defaultCors)).to.deep.equal({
      methods              : "GET, HEAD, PUT, PATCH, POST, DELETE",
      optionsSuccessStatus : 204,
      origin               : "example.com",
      preflightContinue    : false
    });

    expect(fn({
      origin : ["example1.com", "example2.com", "example3.com"]
    }, defaultCors)).to.deep.equal({
      methods              : "GET, HEAD, PUT, PATCH, POST, DELETE",
      optionsSuccessStatus : 204,
      origin : ["example1.com", "example2.com", "example3.com"],
      preflightContinue    : false
    });

    expect(fn({
      optionsSuccessStatus : 206
    }, defaultCors)).to.deep.equal({
      methods              : "GET, HEAD, PUT, PATCH, POST, DELETE",
      optionsSuccessStatus : 206,
      origin               : "*",
      preflightContinue    : false
    });

    expect(fn({
      preflightContinue : true
    }, defaultCors)).to.deep.equal({
      methods              : "GET, HEAD, PUT, PATCH, POST, DELETE",
      optionsSuccessStatus : 204,
      origin               : "*",
      preflightContinue    : true
    });
  });
});
