const router = require("express").Router();
const logFunctions = require("../../../models/fitness/logs");
const canAccess = require("../../../models/middleware/canAccess");

const canView = canAccess(3);

router.post("/workout", canView, async (req, res) => {
  const userId = req.user.id;
  const { workoutId, date, type, timeCompleted, comments } = req.body;

  try {
    const method = await logFunctions.editWorkout(
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
    res.status(400).json({ error });
  }
});

router.get("/workouts", canView, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await logFunctions.getWorkoutLogs(userId);
    res.status(200).json({ result });
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.delete("/workout/exercise/:id", canView, async (req, res) => {
  try {
    const id = req.params.id;
    const result = await logFunctions.deleteWorkoutExercise(id);
    res.status(200).json({ message: "success" });
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.post("/workout/exercises", canView, async (req, res) => {
  const { workoutId, exerciseId, restTime, comments, workoutExerciseId, sets } =
    req.body;

  try {
    const method = await logFunctions.editWorkoutExercise(
      workoutId,
      exerciseId,
      restTime,
      comments,
      workoutExerciseId,
      sets
    );
    res.status(200).json({
      message: `${
        method === "insert" ? "inserted" : "updated"
      } workout successfully`,
    });
  } catch (error) {
    res.status(400).json({ error });
  }
});

module.exports = router;
