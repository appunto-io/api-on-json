const { hydrate } = require('../src/apiModel/hydrate.js');

const chai   = require('chai');
const expect = chai.expect;

describe('hydrate', () => {
  it('hydrate', () => {

    expect(hydrate({}, {})).to.deep.equal({});
    expect(hydrate({key:false}, {})).to.deep.equal({key:false});
    expect(hydrate({key:true}, {})).to.deep.equal({key:true});
    expect(hydrate({key:123}, {})).to.deep.equal({key:123});
    expect(hydrate({key:'string'}, {})).to.deep.equal({key:'string'});
    expect(hydrate({key:{nested:1234}}, {})).to.deep.equal({key:{nested:1234}});
    expect(hydrate({key:{nested:"::test"}}, {})).to.deep.equal({key:{nested:"::test"}});
    expect(hydrate({key:{nested:"::test"}}, {"test":"testreplacement"})).to.deep.equal({key:{nested:"testreplacement"}});
    expect(hydrate({key:{nested:"--test"}}, {"test":"testreplacement"}, '--')).to.deep.equal({key:{nested:"testreplacement"}});
    expect(hydrate({key:{nested:"::test"}}, {"test":"testreplacement"}, '--')).to.deep.equal({key:{nested:"::test"}});
    expect(hydrate({key:{nested:"::othertest"}}, {"test":"testreplacement"})).to.deep.equal({key:{nested:"::othertest"}});
    expect(hydrate({key:["::test"]}, {"test":"testreplacement"})).to.deep.equal({key:["testreplacement"]});
  });
});
