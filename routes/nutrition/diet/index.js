const router = require("express").Router();
const dietFunctions = require("../../../models/nutrition/diet");
const canAccess = require("../../../models/middleware/canAccess");

const canView = canAccess([9, 10]);

router.get("/", canView, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await dietFunctions.getDietLogs(userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.post("/", canView, async (req, res) => {
  try {
    const userId = req.user.id;
    await dietFunctions.editDietLog({ ...req.body, userId });
    res.status(200).json("success");
  } catch (error) {
    res.status(400).json(error);
  }
});

router.delete("/log/:id", canView, async (req, res) => {
  try {
    const { id } = req.params;
    await dietFunctions.deleteDietLog(id);
    res.status(200).json("success");
  } catch (error) {
    res.status(400).json(error);
  }
});

module.exports = router;
