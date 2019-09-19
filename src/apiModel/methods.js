
/*
Return the list of HTTP methods that are not blocked by
an AuthObject === false.
 */
const getAllowedMethods = (auth) =>
  Object.entries(auth).filter(([method, access]) => !!access).map(([method])=>method);

module.exports = { getAllowedMethods }
