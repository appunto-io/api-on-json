const { mergeModels } = require('./merge.js');

const chai   = require('chai');
const expect = chai.expect;

describe('mergeModels', () => {
  it('mergeModels', () => {
    const fn = mergeModels;

    expect(fn({
    }, {
      'key' : 'value'
    })).to.deep.equal({
      'key' : 'value'
    });

    expect(fn({
      'key' : 'oldValue'
    }, {
    })).to.deep.equal({
      'key' : 'oldValue'
    });

    expect(fn({
      'key' : ['oldValue']
    }, {
      'key' : 'newValue'
    })).to.deep.equal({
      'key' : ['oldValue', 'newValue']
    });

    expect(fn({
      'key' : 'oldValue'
    }, {
      'key' : ['newValue']
    })).to.deep.equal({
      'key' : ['oldValue', 'newValue']
    });

    expect(fn({
      'key' : ['oldValue']
    }, {
      'key' : ['newValue']
    })).to.deep.equal({
      'key' : ['oldValue', 'newValue']
    });

    expect(fn({
      'key' : 'oldValue'
    }, {
      'key' : 'newValue'
    })).to.deep.equal({
      'key' : 'newValue'
    });

    expect(fn({
      'key' : 1234
    }, {
      'key' : 456
    })).to.deep.equal({
      'key' : 456
    });

    expect(fn({
      'key' : 1234,
      'nested' : {
        'key2' : 234
      }
    }, {
      'key' : '456',
      'nested' : {
        'key2' : 456
      }
    })).to.deep.equal({
      'key' : '456',
      'nested' : {
        'key2' : 456
      }
    });

    expect(fn({
      'key' : 1234,
      'nested' : {
        'key2' : 234
      }
    }, {
      'key' : '456',
      'nested' : {
        'key3' : 456
      }
    })).to.deep.equal({
      'key' : '456',
      'nested' : {
        'key2' : 234,
        'key3' : 456
      }
    });

    expect(fn({
      'key' : 1234,
      'nested' : {
        'key2' : 234
      }
    }, {
      'key' : '456',
    })).to.deep.equal({
      'key' : '456',
      'nested' : {
        'key2' : 234
      }
    });

    expect(fn({
      'key' : 1234,
    }, {
      'key' : '456',
      'nested' : {
        'key2' : 234
      }
    })).to.deep.equal({
      'key' : '456',
      'nested' : {
        'key2' : 234
      }
    });

    expect(fn({
      'key' : 1234,
    }, {
      'key' : '456',
      'nested' : {
        'nested' : {
          'nested' : {
            'key2' : 'value'
          }
        }
      }
    })).to.deep.equal({
      'key' : '456',
      'nested' : {
        'nested' : {
          'nested' : {
            'key2' : 'value'
          }
        }
      }
    });
  });
});
