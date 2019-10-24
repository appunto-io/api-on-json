const { onUndefined } = require('./helpers.js');

const chai   = require('chai');
const expect = chai.expect;

describe('onUndefined', () => {
  it('onUndefined', () => {
    let a;

    expect(onUndefined(a, 'defaultValue')).to.deep.equal('defaultValue');
    expect(onUndefined(null, 'defaultValue')).to.be.null;
    expect(onUndefined(false, 'defaultValue')).to.deep.equal(false);
    expect(onUndefined('value', 'defaultValue')).to.deep.equal('value');
  });
});
