const router = require("express").Router();
const sleepFunctions = require("../../models/sleep");
const canAccess = require("../../models/middleware/canAccess");

const canView = canAccess(5);

router.get("/logs", canView, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await sleepFunctions.getOuraLogs(userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.post("/oura/log", canView, async (req, res) => {
  try {
    const { userId, date } = req.body;
    await sleepFunctions.pullOuraSleepLog(userId, date);
    res.status(200).json({ message: "success" });
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get("/integrations", canView, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await sleepFunctions.getSleepIntegrations(userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get("/settings", canView, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await sleepFunctions.getSleepSettings(userId);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});

router.post("/settings", canView, async (req, res) => {
  try {
    const userId = req.user.id;
    await sleepFunctions.updateSleepSettings(userId, req.body);
    res.status(200).json({ message: "success" });
  } catch (error) {
    res.status(400).json(error);
  }
});

module.exports = router;
