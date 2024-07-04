const router = require("express").Router();
const exerciseLogFunctions = require("../../../models/fitness/exerciseLog");

router.post("/workout", async (req, res) => {
  const userId = req.user.id;
  const { workoutId, date, type, timeCompleted, comments } = req.body;

  try {
    const method = await exerciseLogFunctions.editWorkout(
      workoutId,
      userId,
      date,
      type,
      timeCompleted,
      comments
    );
    res.status(200).json({
      message: `${
        method === "insert" ? "inserted" : "updated"
      } workout successfully`,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
});

module.exports = router;
