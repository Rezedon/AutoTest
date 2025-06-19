const Ajv = require("ajv");
const ajvFormats = require("ajv-formats");
const ajv = new Ajv();
ajvFormats(ajv);

function validateJson(schema, data) {
  const validate = ajv.compile(schema);
  return validate(data);
}
module.exports = validateJson;
