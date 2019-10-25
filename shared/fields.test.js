const { getDeniedFields } = require('./fields.js');

const chai   = require('chai');
const expect = chai.expect;


describe('getDeniedFields', () => {
  it('getDeniedFields', () => {
    const fn = getDeniedFields;

    expect(fn({
    })(true, [])).to.deep.equal([]);
    expect(fn({
      fields : {}
    })(true, [])).to.deep.equal([]);
    expect(fn({
      fields : {
        'field' : {
          auth : {
            'get' : {requiresAuth : false, requiresRoles : false}
          }
        }
      }
    }, 'get')(false, [])).to.deep.equal([]);
    expect(fn({
      fields : {
        'field' : {
          auth : {
            'get' : {requiresAuth : true, requiresRoles : false}
          }
        }
      }
    }, 'get')(false, [])).to.deep.equal(['field']);
    expect(fn({
      fields : {
        'field' : {
          auth : {
            'get' : {requiresAuth : true, requiresRoles : ["admin"]}
          }
        }
      }
    }, 'get')(false, [])).to.deep.equal(['field']);
    expect(fn({
      fields : {
        'field' : {
          auth : {
            'get' : {requiresAuth : true, requiresRoles : ['admin']}
          }
        }
      }
    }, 'get')(true, ['admin'])).to.deep.equal([]);
  });
});
