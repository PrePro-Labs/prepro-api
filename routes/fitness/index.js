const router = require("express").Router();
const fitnessFunctions = require("../../models/fitness");
const logFunctions = require("../../models/fitness/logs");
const templateFunctions = require("../../models/fitness/templates");
const canAccess = require("../../models/middleware/canAccess");

const canView = canAccess(3);

router.use("/logs", require("./logs"));
router.use("/templates", require("./templates"));

router.get("/exercises/types", canView, async (req, res) => {
  try {
    const result = await fitnessFunctions.getExerciseTypes();
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.delete("/exercises/types/:id", canView, async (req, res) => {
  try {
    const id = req.params.id;
    const result = await fitnessFunctions.deleteExerciseType(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.post("/exercises/types", canView, async (req, res) => {
  const { name, target } = req.body;

  try {
    await fitnessFunctions.addExerciseType(name, target);
    res.status(200).json("success");
  } catch (error) {
    res.status(400).json(error);
  }
});

router.post("/exercise/order", canView, async (req, res) => {
  const { direction, exercise } = req.body;

  try {
    if (exercise.workoutId) {
      await logFunctions.changeExercisePosition(direction, exercise);
    }
    if (exercise.templateId) {
      await templateFunctions.changeExercisePosition(direction, exercise);
    }

    res.status(200).json("success");
  } catch (error) {
    res.status(400).json(error);
  }
});

module.exports = router;
