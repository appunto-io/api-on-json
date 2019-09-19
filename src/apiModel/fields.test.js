const { getDeniedFields } = require('./fields');


describe('getDeniedFields', () => {
  test('getDeniedFields', () => {
    const fn = getDeniedFields;

    expect(fn({
    })(true, [])).toEqual([]);
    expect(fn({
      fields : {}
    })(true, [])).toEqual([]);
    expect(fn({
      fields : {
        'field' : {
          auth : {
            'get' : {requiresAuth : false, requiresRoles : false}
          }
        }
      }
    }, 'get')(false, [])).toEqual([]);
    expect(fn({
      fields : {
        'field' : {
          auth : {
            'get' : {requiresAuth : true, requiresRoles : false}
          }
        }
      }
    }, 'get')(false, [])).toEqual(['field']);
    expect(fn({
      fields : {
        'field' : {
          auth : {
            'get' : {requiresAuth : true, requiresRoles : ["admin"]}
          }
        }
      }
    }, 'get')(false, [])).toEqual(['field']);
    expect(fn({
      fields : {
        'field' : {
          auth : {
            'get' : {requiresAuth : true, requiresRoles : ['admin']}
          }
        }
      }
    }, 'get')(true, ['admin'])).toEqual([]);
  });
});
