const router = require("express").Router();
const logFunctions = require("../../../models/fitness/logs");
const canAccess = require("../../../models/middleware/canAccess");

const canView = canAccess(3);

router.get("/", canView, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await logFunctions.getWorkoutLogs(userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json(error);
  }
});

// updating workout summary
router.post("/summary", canView, async (req, res) => {
  const userId = req.user.id;
  const {
    id: workoutId,
    date,
    timeStarted,
    timeCompleted,
    comments,
  } = req.body;

  try {
    const method = await logFunctions.editWorkoutSummary(
      workoutId,
      userId,
      date,
      timeStarted,
      timeCompleted,
      comments
    );
    res.status(200).json({
      message: `${
        method === "insert" ? "inserted" : "updated"
      } workout successfully`,
    });
  } catch (error) {
    res.status(400).json(error);
  }
});

// updating workout exercises
router.post("/exercise", canView, async (req, res) => {
  const {
    parentId: workoutId,
    exerciseId,
    restTime,
    comments,
    id,
    sets,
  } = req.body;

  try {
    const method = await logFunctions.editWorkoutExercise(
      workoutId,
      exerciseId,
      restTime,
      comments,
      id,
      sets
    );
    res.status(200).json({
      message: `${
        method === "insert" ? "inserted" : "updated"
      } workout successfully`,
    });
  } catch (error) {
    res.status(400).json(error);
  }
});

// deleting workout summary
router.delete("/summary/:id", canView, async (req, res) => {
  try {
    const id = req.params.id;
    const result = await logFunctions.deleteWorkoutSummary(id);
    res.status(200).json({ message: "success" });
  } catch (error) {
    res.status(400).json(error);
  }
});

// deleting workout exercise
router.delete("/exercise/:id", canView, async (req, res) => {
  try {
    const id = req.params.id;
    const result = await logFunctions.deleteWorkoutExercise(id);
    res.status(200).json({ message: "success" });
  } catch (error) {
    res.status(400).json(error);
  }
});

// copy workout from template
router.post("/copy", canView, async (req, res) => {
  const { workoutId, templateId } = req.body;

  try {
    await logFunctions.copyWorkoutFromTemplate(workoutId, templateId);
    res.status(200).json({
      message: "Copied workout successfully",
    });
  } catch (error) {
    res.status(400).json(error);
  }
});

module.exports = router;
