const {
  compileRequestRequirements,
  compileAuthRequirements,
  compileEndpointModel,
  compileApiModel,
  compileHandlersList,
  compileRealTime,

  keysMap,
  methods
} = require('../src/apiModel/compiler.js');

const chai   = require('chai');
const expect = chai.expect;

describe('compileRequestRequirements', () => {
  it('compileRequestRequirements', () => {
    const fn = compileRequestRequirements;

    expect(fn(false)).to.be.false;
    expect(fn('string')).to.be.false;
    expect(fn(true)).to.deep.equal({requiresAuth:false,requiresRoles:false});
    expect(fn({
      requiresAuth : true
    })).to.deep.equal({requiresAuth:true,requiresRoles:false});
    expect(fn({
      requiresRoles : false
    })).to.deep.equal({requiresAuth:true,requiresRoles:false});
    expect(fn({
      requiresRoles : ['role1', 'role2']
    })).to.deep.equal({requiresAuth:true,requiresRoles:['role1', 'role2']});
    expect(fn({
      requiresAuth : true,
      requiresRoles : ['role1', 'role2']
    })).to.deep.equal({requiresAuth:true,requiresRoles:['role1', 'role2']});
  });
});

describe('compileAuthRequirements', () => {
  it('compileAuthRequirements', () => {
    const fn = compileAuthRequirements;
    const def = {
      "GET"     : {requiresAuth:true,requiresRoles:['default-role']},
      "HEAD"    : {requiresAuth:true,requiresRoles:['default-role']},
      "OPTIONS" : {requiresAuth:true,requiresRoles:['default-role']},
      "POST"    : {requiresAuth:true,requiresRoles:['default-role']},
      "PUT"     : {requiresAuth:true,requiresRoles:['default-role']},
      "PATCH"   : {requiresAuth:true,requiresRoles:['default-role']},
      "DELETE"  : {requiresAuth:true,requiresRoles:['default-role']},
      realTime  : {requiresAuth:true,requiresRoles:false}
    };

    expect(fn({}, def)).to.deep.equal(def);

    expect(fn({
      requiresAuth:false
    }, def)).to.deep.equal(Object.assign({}, def, {
      "GET"     : {requiresAuth:false,requiresRoles:false},
      "HEAD"    : {requiresAuth:false,requiresRoles:false},
      "OPTIONS" : {requiresAuth:false,requiresRoles:false},
      "POST"    : {requiresAuth:false,requiresRoles:false},
      "PUT"     : {requiresAuth:false,requiresRoles:false},
      "PATCH"   : {requiresAuth:false,requiresRoles:false},
      "DELETE"  : {requiresAuth:false,requiresRoles:false}
    }));

    expect(fn({
      requiresRoles:['role1']
    }, def)).to.deep.equal(Object.assign({}, def, {
      "GET"     : {requiresAuth:true,requiresRoles:['role1']},
      "HEAD"    : {requiresAuth:true,requiresRoles:['role1']},
      "OPTIONS" : {requiresAuth:true,requiresRoles:['role1']},
      "POST"    : {requiresAuth:true,requiresRoles:['role1']},
      "PUT"     : {requiresAuth:true,requiresRoles:['role1']},
      "PATCH"   : {requiresAuth:true,requiresRoles:['role1']},
      "DELETE"  : {requiresAuth:true,requiresRoles:['role1']}
    }));

    expect(fn({
      requiresRoles:['role1'],
      write : false
    }, def)).to.deep.equal(Object.assign({}, def, {
      "GET"     : {requiresAuth:true,requiresRoles:['role1']},
      "HEAD"    : {requiresAuth:true,requiresRoles:['role1']},
      "OPTIONS" : {requiresAuth:true,requiresRoles:['role1']},
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
      "GET"     : {requiresAuth:true,requiresRoles:['role1']},
      "HEAD"    : {requiresAuth:true,requiresRoles:['role1']},
      "OPTIONS" : {requiresAuth:true,requiresRoles:['role1']},
      "POST"    : false,
      "PUT"     : {requiresAuth:true,requiresRoles:['dev']},
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
      "GET"     : {requiresAuth:false,requiresRoles:false},
      "HEAD"    : {requiresAuth:false,requiresRoles:false},
      "OPTIONS" : {requiresAuth:false,requiresRoles:false},
    }));

    expect(fn({
      write:false,
      'PUT' : {requiresRoles:["role1", "role2"]}
    }, def)).to.deep.equal(Object.assign({}, def, {
      "POST"    : false,
      "PUT"     : {requiresAuth:true, requiresRoles:["role1", "role2"]},
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
      'GET'     : ['value'],
      'HEAD'    : ['value'],
      'OPTIONS' : ['value']
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
      'GET'     : ['readValue'],
      'HEAD'    : ['readValue'],
      'OPTIONS' : ['readValue'],
      "POST"    : ['writeValue'],
      "PUT"     : ['writeValue'],
      "PATCH"   : ['writeValue'],
      "DELETE"  : ['writeValue'],
    });

    expect(fn({
      'read'  : 'readValue',
      'write' : ['writeValue', 'writeValue2'],
      'GET' : 'getValue'
    })).to.deep.equal({
      'GET'     : ['getValue'],
      'HEAD'    : ['readValue'],
      'OPTIONS' : ['readValue'],
      "POST"    : ['writeValue', 'writeValue2'],
      "PUT"     : ['writeValue', 'writeValue2'],
      "PATCH"   : ['writeValue', 'writeValue2'],
      "DELETE"  : ['writeValue', 'writeValue2'],
    });

  });
});


describe('compileEndpointModel', () => {
  it('auth and fields', () => {
    const fn = compileEndpointModel;

    expect(fn({})).to.deep.equal({
      auth : {
        "GET"     : {requiresAuth:true,requiresRoles:false},
        "HEAD"    : {requiresAuth:true,requiresRoles:false},
        "OPTIONS" : {requiresAuth:true,requiresRoles:false},
        "POST"    : {requiresAuth:true,requiresRoles:false},
        "PUT"     : {requiresAuth:true,requiresRoles:false},
        "PATCH"   : {requiresAuth:true,requiresRoles:false},
        "DELETE"  : {requiresAuth:true,requiresRoles:false},
        realTime  : {requiresAuth:true,requiresRoles:false}
      },
      fields : {},
      filters : {},
      handlers : {},
      realTime  : false
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
        "GET"     : {requiresAuth:false,requiresRoles:false},
        "HEAD"    : {requiresAuth:false,requiresRoles:false},
        "OPTIONS" : {requiresAuth:false,requiresRoles:false},
        "POST"    : {requiresAuth:false,requiresRoles:false},
        "PUT"     : {requiresAuth:false,requiresRoles:false},
        "PATCH"   : {requiresAuth:false,requiresRoles:false},
        "DELETE"  : {requiresAuth:false,requiresRoles:false},
        realTime  : {requiresAuth:true,requiresRoles:false}
      },
      filters : {},
      handlers : {},
      realTime  : false,
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
            realTime  : {requiresAuth:true,requiresRoles:false}
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
        "GET"     : {requiresAuth:true,requiresRoles:false},
        "HEAD"    : {requiresAuth:true,requiresRoles:false},
        "OPTIONS" : {requiresAuth:true,requiresRoles:false},
        "POST"    : {requiresAuth:true,requiresRoles:false},
        "PUT"     : {requiresAuth:true,requiresRoles:false},
        "PATCH"   : {requiresAuth:true,requiresRoles:false},
        "DELETE"  : {requiresAuth:true,requiresRoles:false},
        realTime  : {requiresAuth:true,requiresRoles:false}
      },
      fields : {},
      filters : {
        "POST" : ['::getFilter1', '::getFilter2']
      },
      handlers : {
        "GET" : ['::getHandler']
      },
      realTime  : false
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
        "GET"     : {requiresAuth:true,requiresRoles:false},
        "HEAD"    : {requiresAuth:true,requiresRoles:false},
        "OPTIONS" : {requiresAuth:true,requiresRoles:false},
        "POST"    : {requiresAuth:true,requiresRoles:false},
        "PUT"     : {requiresAuth:true,requiresRoles:false},
        "PATCH"   : {requiresAuth:true,requiresRoles:false},
        "DELETE"  : {requiresAuth:true,requiresRoles:false},
        realTime  : {requiresAuth:true,requiresRoles:false}
      },
      fields : {},
      filters : {},
      handlers : {},
      realTime : false,
      '/collection' : {
        auth : {
          "GET"     : {requiresAuth:true,requiresRoles:false},
          "HEAD"    : {requiresAuth:true,requiresRoles:false},
          "OPTIONS" : {requiresAuth:true,requiresRoles:false},
          "POST"    : {requiresAuth:true,requiresRoles:false},
          "PUT"     : {requiresAuth:true,requiresRoles:false},
          "PATCH"   : {requiresAuth:true,requiresRoles:false},
          "DELETE"  : {requiresAuth:true,requiresRoles:false},
          realTime  : {requiresAuth:true,requiresRoles:false}
        },
        fields : {},
        filters : {},
        handlers : {
          'GET' : ['::getHandler']
        },
        realTime : false
      }
    });

    expect(fn({
      auth : {
        'POST' : {requiresAuth:true,requiresRoles:['testRole']},
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
        "GET"     : {requiresAuth:true,requiresRoles:false},
        "HEAD"    : {requiresAuth:true,requiresRoles:false},
        "OPTIONS" : {requiresAuth:true,requiresRoles:false},
        'POST'    : {requiresAuth:true,requiresRoles:['testRole']},
        "PUT"     : {requiresAuth:true,requiresRoles:false},
        "PATCH"   : {requiresAuth:true,requiresRoles:false},
        "DELETE"  : {requiresAuth:true,requiresRoles:false},
        realTime  : {requiresAuth:true,requiresRoles:false}
      },
      fields : {},
      filters : {},
      handlers : {},
      realTime  : false,
      '/collection' : {
        auth : {
          "GET"     : {requiresAuth:true,requiresRoles:false},
          "HEAD"    : {requiresAuth:true,requiresRoles:false},
          "OPTIONS" : {requiresAuth:true,requiresRoles:false},
          'POST'    : {requiresAuth:true,requiresRoles:['testRole']},
          "PUT"     : {requiresAuth:true,requiresRoles:false},
          "PATCH"   : {requiresAuth:true,requiresRoles:false},
          "DELETE"  : {requiresAuth:true,requiresRoles:false},
          realTime  : {requiresAuth:true,requiresRoles:false}
        },
        fields : {},
        filters : {},
        handlers : {},
        realTime  : false,
        '/child' : {
          auth : {
            "GET"     : {requiresAuth:true,requiresRoles:false},
            "HEAD"    : {requiresAuth:true,requiresRoles:false},
            "OPTIONS" : {requiresAuth:true,requiresRoles:false},
            'POST'    : {requiresAuth:true,requiresRoles:['testRole']},
            "PUT"     : {requiresAuth:true,requiresRoles:false},
            "PATCH"   : {requiresAuth:true,requiresRoles:false},
            "DELETE"  : {requiresAuth:true,requiresRoles:false},
            realTime  : {requiresAuth:true,requiresRoles:false}
          },
          fields : {},
          filters : {},
          handlers : {
            'GET' : ['::getChildHandler']
          },
          realTime  : false
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
