const router = require("express").Router();
const logFunctions = require("../../../models/supplements/logs");
const canAccess = require("../../../models/middleware/canAccess");

const canView = canAccess(7);

router.get("/", canView, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await logFunctions.getSupplementLogs(userId);
    res.status(200).json({ result });
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.post("/", canView, async (req, res) => {
  try {
    const userId = req.user.id;
    const { item, date } = req.body;

    await logFunctions.editSupplementLog(userId, item, date);
    res.status(200).json({ msg: "success" });
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.get("/missed", canView, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await logFunctions.getMissedSupplements(userId);
    res.status(200).json({ result });
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.post("/missed", canView, async (req, res) => {
  try {
    const userId = req.user.id;
    const { item, date, reason } = req.body;

    await logFunctions.addMissedSupplement(userId, item, date, reason);
    res.status(200).json({ msg: "success" });
  } catch (error) {
    res.status(400).json({ error });
  }
});

module.exports = router;
