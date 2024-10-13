const router = require("express").Router();
const templateFunctions = require("../../../models/fitness/templates");
const canAccess = require("../../../models/middleware/canAccess");

const canView = canAccess(3);

router.get("/", canView, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await templateFunctions.getWorkoutTemplates(userId);
    res.status(200).json({ result });
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.post("/exercise", canView, async (req, res) => {
  const {
    id, // unique id for the workout/template exercise row
    parentId: templateId,
    exerciseId,
    sets,
    restTime,
    comments,
  } = req.body;

  try {
    const method = await templateFunctions.editTemplateExercise(
      id,
      templateId,
      exerciseId,
      sets,
      restTime,
      comments
    );
    res.status(200).json({
      message: `${
        method === "insert" ? "inserted" : "updated"
      } template successfully`,
    });
  } catch (error) {
    res.status(400).json({ error });
  }
});

// deleting template exercise
router.delete("/exercise/:id", canView, async (req, res) => {
  try {
    const id = req.params.id;
    const result = await templateFunctions.deleteTemplateExercise(id);
    res.status(200).json({ message: "success" });
  } catch (error) {
    res.status(400).json({ error });
  }
});

module.exports = router;
