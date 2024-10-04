const router = require("express").Router();
const supplementFunctions = require("../../models/supplements");
const canAccess = require("../../models/middleware/canAccess");

const canView = canAccess(7);

router.use("/logs", require("./logs"));
// router.use('/admin', require('./admin'));

router.get("/items", canView, async (req, res) => {
  try {
    const result = await supplementFunctions.getSupplementItems();
    res.status(200).json({ result });
  } catch (error) {
    res.status(400).json({ error });
  }
});

module.exports = router;
