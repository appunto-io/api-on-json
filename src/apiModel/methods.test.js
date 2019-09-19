const { getAllowedMethods } = require('./methods');

describe('getAllowedMethods', () => {
  test('getAllowedMethods', () => {
    const fn = getAllowedMethods;

    expect(fn({})).toEqual([]);
    expect(fn({
      'GET' : false,
      'POST'    : {requiresAuth : true, requiresRoles : false},
      'DELETE'     : {requiresAuth : true, requiresRoles : false},
    })).toEqual(['POST', 'DELETE']);
    expect(fn({
      'GET'     : {requiresAuth : true, requiresRoles : false},
    })).toEqual(['GET']);
  });
});
