const {
  compileRequestRequirements,
  compileAuthRequirements,
  compileEndpointModel,
  compileApiModel,
  compileHandlersList,

  keysMap,
  methods
} = require('./compiler');

describe('compileRequestRequirements', () => {
  test('compileRequestRequirements', () => {
    const fn = compileRequestRequirements;

    expect(fn(false)).toEqual(false);
    expect(fn('string')).toEqual(false);
    expect(fn(true)).toEqual({requiresAuth:false,requiresRoles:false});
    expect(fn({
      requiresAuth : true
    })).toEqual({requiresAuth:true,requiresRoles:false});
    expect(fn({
      requiresRoles : false
    })).toEqual({requiresAuth:true,requiresRoles:false});
    expect(fn({
      requiresRoles : ['role1', 'role2']
    })).toEqual({requiresAuth:true,requiresRoles:['role1', 'role2']});
    expect(fn({
      requiresAuth : true,
      requiresRoles : ['role1', 'role2']
    })).toEqual({requiresAuth:true,requiresRoles:['role1', 'role2']});
  });
});

describe('compileAuthRequirements', () => {
  test('compileAuthRequirements', () => {
    const fn = compileAuthRequirements;
    const def = {
      "GET"     : {requiresAuth:true,requiresRoles:['default-role']},
      "HEAD"    : {requiresAuth:true,requiresRoles:['default-role']},
      "OPTIONS" : {requiresAuth:true,requiresRoles:['default-role']},
      "POST"    : {requiresAuth:true,requiresRoles:['default-role']},
      "PUT"     : {requiresAuth:true,requiresRoles:['default-role']},
      "PATCH"   : {requiresAuth:true,requiresRoles:['default-role']},
      "DELETE"  : {requiresAuth:true,requiresRoles:['default-role']}
    };

    expect(fn({}, def)).toEqual(def);

    expect(fn({
      requiresAuth:false
    }, def)).toEqual(Object.assign({}, def, {
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
    }, def)).toEqual(Object.assign({}, def, {
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
    }, def)).toEqual(Object.assign({}, def, {
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
    }, def)).toEqual(Object.assign({}, def, {
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
    }, def)).toEqual(Object.assign({}, def, {
      "POST"    : false,
      "PUT"     : false,
      "PATCH"   : false,
      "DELETE"  : false
    }));

    expect(fn({
      read:false
    }, def)).toEqual(Object.assign({}, def, {
      "GET"     : false,
      "HEAD"    : false,
      "OPTIONS" : false
    }));

    expect(fn({
      write:false,
      read:false
    })).toEqual(Object.assign({}, def, {
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
    }, def)).toEqual(Object.assign({}, def, {
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
    }, def)).toEqual(Object.assign({}, def, {
      "POST"    : false,
      "PUT"     : {requiresAuth:true, requiresRoles:["role1", "role2"]},
      "PATCH"   : false,
      "DELETE"  : false,
    }));
  });
});



describe('compileHandlersList', () => {
  test('compileHandlersList', () => {
    const fn = compileHandlersList;

    expect(fn({
      'read' : 'value'
    })).toEqual({
      'GET'     : ['value'],
      'HEAD'    : ['value'],
      'OPTIONS' : ['value']
    });

    expect(fn({
      'write' : 'value'
    })).toEqual({
      "POST"    : ['value'],
      "PUT"     : ['value'],
      "PATCH"   : ['value'],
      "DELETE"  : ['value'],
    });

    expect(fn({
      'read'  : 'readValue',
      'write' : 'writeValue'
    })).toEqual({
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
    })).toEqual({
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
  test('auth and fields', () => {
    const fn = compileEndpointModel;

    expect(fn({})).toEqual({
      auth : {
        "GET"     : {requiresAuth:true,requiresRoles:false},
        "HEAD"    : {requiresAuth:true,requiresRoles:false},
        "OPTIONS" : {requiresAuth:true,requiresRoles:false},
        "POST"    : {requiresAuth:true,requiresRoles:false},
        "PUT"     : {requiresAuth:true,requiresRoles:false},
        "PATCH"   : {requiresAuth:true,requiresRoles:false},
        "DELETE"  : {requiresAuth:true,requiresRoles:false}
      },
      fields : {},
      filters : {},
      handlers : {}
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
    })).toEqual({
      auth : {
        "GET"     : {requiresAuth:false,requiresRoles:false},
        "HEAD"    : {requiresAuth:false,requiresRoles:false},
        "OPTIONS" : {requiresAuth:false,requiresRoles:false},
        "POST"    : {requiresAuth:false,requiresRoles:false},
        "PUT"     : {requiresAuth:false,requiresRoles:false},
        "PATCH"   : {requiresAuth:false,requiresRoles:false},
        "DELETE"  : {requiresAuth:false,requiresRoles:false}
      },
      filters : {},
      handlers : {},
      fields : {
        'createdAt' : {
          auth : {
            "GET"     : false,
            "HEAD"    : false,
            "OPTIONS" : false,
            "POST"    : false,
            "PUT"     : false,
            "PATCH"   : false,
            "DELETE"  : false
          }
        }
      }
    });
  });



  test('filters and handlers', () => {
    const fn = compileEndpointModel;

    expect(fn({
      handlers : {
        "GET" : '::getHandler'
      },
      filters : {
        "POST" : ['::getFilter1', '::getFilter2']
      }
    })).toEqual({
      auth : {
        "GET"     : {requiresAuth:true,requiresRoles:false},
        "HEAD"    : {requiresAuth:true,requiresRoles:false},
        "OPTIONS" : {requiresAuth:true,requiresRoles:false},
        "POST"    : {requiresAuth:true,requiresRoles:false},
        "PUT"     : {requiresAuth:true,requiresRoles:false},
        "PATCH"   : {requiresAuth:true,requiresRoles:false},
        "DELETE"  : {requiresAuth:true,requiresRoles:false}
      },
      fields : {},
      filters : {
        "POST" : ['::getFilter1', '::getFilter2']
      },
      handlers : {
        "GET" : ['::getHandler']
      }
    });
  });

  test('filters and handlers', () => {
    const fn = compileEndpointModel;

    expect(fn({
      '/collection' : {
        handlers : {
          'GET' : '::getHandler'
        }
      }
    })).toEqual({
      auth : {
        "GET"     : {requiresAuth:true,requiresRoles:false},
        "HEAD"    : {requiresAuth:true,requiresRoles:false},
        "OPTIONS" : {requiresAuth:true,requiresRoles:false},
        "POST"    : {requiresAuth:true,requiresRoles:false},
        "PUT"     : {requiresAuth:true,requiresRoles:false},
        "PATCH"   : {requiresAuth:true,requiresRoles:false},
        "DELETE"  : {requiresAuth:true,requiresRoles:false}
      },
      fields : {},
      filters : {},
      handlers : {},
      '/collection' : {
        auth : {
          "GET"     : {requiresAuth:true,requiresRoles:false},
          "HEAD"    : {requiresAuth:true,requiresRoles:false},
          "OPTIONS" : {requiresAuth:true,requiresRoles:false},
          "POST"    : {requiresAuth:true,requiresRoles:false},
          "PUT"     : {requiresAuth:true,requiresRoles:false},
          "PATCH"   : {requiresAuth:true,requiresRoles:false},
          "DELETE"  : {requiresAuth:true,requiresRoles:false}
        },
        fields : {},
        filters : {},
        handlers : {
          'GET' : ['::getHandler']
        }
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
    })).toEqual({
      auth : {
        "GET"     : {requiresAuth:true,requiresRoles:false},
        "HEAD"    : {requiresAuth:true,requiresRoles:false},
        "OPTIONS" : {requiresAuth:true,requiresRoles:false},
        'POST'    : {requiresAuth:true,requiresRoles:['testRole']},
        "PUT"     : {requiresAuth:true,requiresRoles:false},
        "PATCH"   : {requiresAuth:true,requiresRoles:false},
        "DELETE"  : {requiresAuth:true,requiresRoles:false}
      },
      fields : {},
      filters : {},
      handlers : {},
      '/collection' : {
        auth : {
          "GET"     : {requiresAuth:true,requiresRoles:false},
          "HEAD"    : {requiresAuth:true,requiresRoles:false},
          "OPTIONS" : {requiresAuth:true,requiresRoles:false},
          'POST'    : {requiresAuth:true,requiresRoles:['testRole']},
          "PUT"     : {requiresAuth:true,requiresRoles:false},
          "PATCH"   : {requiresAuth:true,requiresRoles:false},
          "DELETE"  : {requiresAuth:true,requiresRoles:false}
        },
        fields : {},
        filters : {},
        handlers : {},
        '/child' : {
          auth : {
            "GET"     : {requiresAuth:true,requiresRoles:false},
            "HEAD"    : {requiresAuth:true,requiresRoles:false},
            "OPTIONS" : {requiresAuth:true,requiresRoles:false},
            'POST'    : {requiresAuth:true,requiresRoles:['testRole']},
            "PUT"     : {requiresAuth:true,requiresRoles:false},
            "PATCH"   : {requiresAuth:true,requiresRoles:false},
            "DELETE"  : {requiresAuth:true,requiresRoles:false}
          },
          fields : {},
          filters : {},
          handlers : {
            'GET' : ['::getChildHandler']
          },
        }
      }
    });

  });
});
