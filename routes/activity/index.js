const router = require("express").Router();
const activityFunctions = require("../../models/activity");
const canAccess = require("../../models/middleware/canAccess");

const canView = canAccess(6);

router.get("/", canView, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await activityFunctions.getActivity(userId);
    res.status(200).json({ result });
  } catch (error) {
    res.status(400).json({ error });
  }
});

module.exports = router;
