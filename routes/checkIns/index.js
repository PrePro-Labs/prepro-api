const router = require("express").Router();
const checkInFunctions = require("../../models/checkIns");
const canAccess = require("../../models/middleware/canAccess");

const canView = canAccess(5);

router.get("/", canView, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await checkInFunctions.getCheckIns(userId);
    res.status(200).json({ result });
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.get("/templates", canView, async (req, res) => {
  try {
    const result = await checkInFunctions.getCheckInsTemplates();
    res.status(200).json({ result });
  } catch (error) {
    res.status(400).json({ error });
  }
});

module.exports = router;
