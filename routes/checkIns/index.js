const router = require("express").Router();
const checkInFunctions = require("../../models/checkIns");
const canAccess = require("../../models/middleware/canAccess");

const canView = canAccess(5);

// get check ins
router.get("/", canView, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await checkInFunctions.getCheckIns(userId);
    res.status(200).json({ result });
  } catch (error) {
    res.status(400).json({ error });
  }
});

// update check ins
router.post("/", canView, async (req, res) => {
  const userId = req.user.id;
  // const {
  //   id: workoutId,
  //   date,
  //   timeStarted,
  //   timeCompleted,
  //   comments,
  // } = req.body;
  console.log(req.body);

  try {
    // const method = await logFunctions.editWorkoutSummary(
    //   workoutId,
    //   userId,
    //   date,
    //   timeStarted,
    //   timeCompleted,
    //   comments
    // );
    // res.status(200).json({
    //   message: `${
    //     method === "insert" ? "inserted" : "updated"
    //   } workout successfully`,
    // });
    res.status(200).json({ message: "success" });
  } catch (error) {
    res.status(400).json({ error });
  }
});

// get templates
router.get("/templates", canView, async (req, res) => {
  try {
    const result = await checkInFunctions.getCheckInsTemplates();
    res.status(200).json({ result });
  } catch (error) {
    res.status(400).json({ error });
  }
});

module.exports = router;
