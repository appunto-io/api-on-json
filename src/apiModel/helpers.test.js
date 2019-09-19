const { onUndefined } = require('./helpers');

describe('onUndefined', () => {
  test('onUndefined', () => {
    let a;

    expect(onUndefined(a, 'defaultValue')).toEqual('defaultValue');
    expect(onUndefined(null, 'defaultValue')).toBeNull();
    expect(onUndefined(false, 'defaultValue')).toEqual(false);
    expect(onUndefined('value', 'defaultValue')).toEqual('value');
  });
});
