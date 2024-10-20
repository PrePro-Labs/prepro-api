const router = require("express").Router();
const weightFunctions = require("../../../models/nutrition/weight");
const canAccess = require("../../../models/middleware/canAccess");

const canView = canAccess(5);

router.get("/logs", canView, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await weightFunctions.getWeightLogs(userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.post("/logs/log", canView, async (req, res) => {
  const { date, weight } = req.body;
  const userId = req.user.id;
  try {
    await weightFunctions.editWeightLog(
      userId,
      weight.length ? weight : null,
      date
    );
    res.status(200).json("success");
  } catch (error) {
    res.status(400).json(error);
  }
});

module.exports = router;
