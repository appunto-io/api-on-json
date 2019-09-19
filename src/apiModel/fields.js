const { testRoles } = require('./roles');

const getDeniedFields = (collectionModel, method) => (auth, roles) => {
  const modelFields = (collectionModel || {}).fields || {};
  const denied      = [];

  Object.entries(modelFields).forEach(([field, requirements]) => {
    const req = (requirements.auth || {})[method];

    // eslint-disable-next-line no-extra-parens
    if (req === false || (req.requiresAuth && (!auth || !testRoles(req.requiresRoles, roles)))) {
      denied.push(field);
    }
  });

  return denied;
};

module.exports = {
  getDeniedFields
}
