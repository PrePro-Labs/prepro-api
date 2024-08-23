const router = require("express").Router();
const devFunctions = require("../../models/DEV");

router.get("/query", async (req, res) => {
  try {
    const sql = `describe workoutLog`;
    const result = await devFunctions.executeDevQuery(sql);
    res.status(200).json({ message: "query complete!", result });
  } catch (error) {
    res.status(400).json(error);
  }
});

module.exports = router;
