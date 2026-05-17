const fs = require("fs");
const path = require("path");

const openapiPath = path.join(__dirname, "openapi.json");
const swaggerSpec = JSON.parse(fs.readFileSync(openapiPath, "utf8"));

module.exports = swaggerSpec;
