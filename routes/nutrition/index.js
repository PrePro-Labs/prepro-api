const router = require("express").Router();

router.use("/weight", require("./weight"));
// router.use("/diet", require("./diet"));

module.exports = router;
