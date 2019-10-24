const { testRoles } = require('./roles.js');

const chai   = require('chai');
const expect = chai.expect;

describe('testRoles', () => {
  it('testRoles', () => {
    expect(testRoles([], [])).to.deep.equal(true);
    expect(testRoles(false, [])).to.deep.equal(true);
    expect(testRoles(false, false)).to.deep.equal(true);
    expect(testRoles([], false)).to.deep.equal(true);
    expect(testRoles([], ["role1"])).to.deep.equal(true);
    expect(testRoles(["role1"], ["role1"])).to.deep.equal(true);
    expect(testRoles(["role1"], ["role2"])).to.deep.equal(false);
    expect(testRoles(["role1", "role2"], ["role2"])).to.deep.equal(true);
  });
});
