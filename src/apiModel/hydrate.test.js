const { hydrate } = require('./hydrate');

describe('hydrate', () => {
  test('hydrate', () => {

    expect(hydrate({}, {})).toEqual({});
    expect(hydrate({key:false}, {})).toEqual({key:false});
    expect(hydrate({key:true}, {})).toEqual({key:true});
    expect(hydrate({key:123}, {})).toEqual({key:123});
    expect(hydrate({key:'string'}, {})).toEqual({key:'string'});
    expect(hydrate({key:{nested:1234}}, {})).toEqual({key:{nested:1234}});
    expect(hydrate({key:{nested:"::test"}}, {})).toEqual({key:{nested:"::test"}});
    expect(hydrate({key:{nested:"::test"}}, {"test":"testreplacement"})).toEqual({key:{nested:"testreplacement"}});
    expect(hydrate({key:{nested:"--test"}}, {"test":"testreplacement"}, '--')).toEqual({key:{nested:"testreplacement"}});
    expect(hydrate({key:{nested:"::test"}}, {"test":"testreplacement"}, '--')).toEqual({key:{nested:"::test"}});
    expect(hydrate({key:{nested:"::othertest"}}, {"test":"testreplacement"})).toEqual({key:{nested:"::othertest"}});
    expect(hydrate({key:["::test"]}, {"test":"testreplacement"})).toEqual({key:["testreplacement"]});
  });
});
