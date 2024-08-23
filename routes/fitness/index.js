const router = require("express").Router();
const fitnessFunctions = require("../../models/fitness");
const canAccess = require("../../models/middleware/canAccess");

const canView = canAccess(3);

router.use("/logs", require("./exerciseLog"));

router.get("/exercises/types", canView, async (req, res) => {
  try {
    const result = await fitnessFunctions.getExerciseTypes();
    res.status(200).json({ result });
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.delete("/exercises/types/:id", canView, async (req, res) => {
  try {
    const id = req.params.id;
    const result = await fitnessFunctions.deleteExerciseType(id);
    res.status(200).json({ result });
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.post("/exercises/types", canView, async (req, res) => {
  const { name } = req.body;

  try {
    const method = await fitnessFunctions.addExerciseType(name);
    res.status(200).json({
      message: "Added exercise type successfully",
    });
  } catch (error) {
    res.status(400).json({ error });
  }
});

module.exports = router;
