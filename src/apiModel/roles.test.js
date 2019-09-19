const { testRoles } = require('./roles');

describe('testRoles', () => {
  test('testRoles', () => {
    expect(testRoles([], [])).toEqual(true);
    expect(testRoles(false, [])).toEqual(true);
    expect(testRoles(false, false)).toEqual(true);
    expect(testRoles([], false)).toEqual(true);
    expect(testRoles([], ["role1"])).toEqual(true);
    expect(testRoles(["role1"], ["role1"])).toEqual(true);
    expect(testRoles(["role1"], ["role2"])).toEqual(false);
    expect(testRoles(["role1", "role2"], ["role2"])).toEqual(true);
  });
});
