const testRoles = (required, owned) => {
  required = required || [];
  owned    = owned    || [];

  return required.length === 0 || !!required.filter(role => owned.indexOf(role) !== -1).length;
};

module.exports = {
  testRoles
}
