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

router.post("/", canView, async (req, res) => {
  const { templateId } = req.body;

  try {
    const method = await templateFunctions.editWorkoutTemplate(templateId);
    res.status(200).json({
      message: `${
        method === "insert" ? "inserted" : "updated"
      } template successfully`,
    });
  } catch (error) {
    res.status(400).json({ error });
  }
});

module.exports = router;
