const router = require("express").Router();
// const fitnessFunctions = require("../../models/fitness");
const canAccess = require("../../models/middleware/canAccess");

// const canView = canAccess(3);

router.use("/logs", require("./exerciseLog"));

module.exports = router;
