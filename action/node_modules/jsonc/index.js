var jsonc = require('./lib/jsonc').jsonc;
module.exports = jsonc;
// adding circular ref to allow easy importing in both ES5/6 and TS projects
module.exports.jsonc = jsonc;
module.exports.safe = jsonc.safe;