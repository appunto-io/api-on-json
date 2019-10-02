const { getAllowedMethods } = require('../src/apiModel/methods.js');

const chai   = require('chai');
const expect = chai.expect;

describe('getAllowedMethods', () => {
  it('getAllowedMethods', () => {
    const fn = getAllowedMethods;

    expect(fn({})).to.deep.equal([]);
    expect(fn({
      'GET' : false,
      'POST'    : {requiresAuth : true, requiresRoles : false},
      'DELETE'     : {requiresAuth : true, requiresRoles : false},
    })).to.deep.equal(['POST', 'DELETE']);
    expect(fn({
      'GET'     : {requiresAuth : true, requiresRoles : false},
    })).to.deep.equal(['GET']);
  });
});
