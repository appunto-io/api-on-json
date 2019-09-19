const { mergeModels } = require('./merge');

describe('mergeModels', () => {
  test('mergeModels', () => {
    const fn = mergeModels;

    expect(fn({
    }, {
      'key' : 'value'
    })).toEqual({
      'key' : 'value'
    });

    expect(fn({
      'key' : 'oldValue'
    }, {
    })).toEqual({
      'key' : 'oldValue'
    });

    expect(fn({
      'key' : ['oldValue']
    }, {
      'key' : 'newValue'
    })).toEqual({
      'key' : ['oldValue', 'newValue']
    });

    expect(fn({
      'key' : 'oldValue'
    }, {
      'key' : ['newValue']
    })).toEqual({
      'key' : ['oldValue', 'newValue']
    });

    expect(fn({
      'key' : ['oldValue']
    }, {
      'key' : ['newValue']
    })).toEqual({
      'key' : ['oldValue', 'newValue']
    });

    expect(fn({
      'key' : 'oldValue'
    }, {
      'key' : 'newValue'
    })).toEqual({
      'key' : 'newValue'
    });

    expect(fn({
      'key' : 1234
    }, {
      'key' : 456
    })).toEqual({
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
    })).toEqual({
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
    })).toEqual({
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
    })).toEqual({
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
    })).toEqual({
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
    })).toEqual({
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
