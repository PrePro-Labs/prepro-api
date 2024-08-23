const router = require("express").Router();
const templateFunctions = require("../../../models/fitness/templates");
const canAccess = require("../../../models/middleware/canAccess");

const canView = canAccess(3);

module.exports = router;
