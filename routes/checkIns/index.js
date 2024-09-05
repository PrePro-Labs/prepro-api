const router = require("express").Router();
const checkInFunctions = require("../../models/checkIns");
const canAccess = require("../../models/middleware/canAccess");
const { upload } = require("../../config/awsConfig");
const uploadFile = upload("prepro-test-bucket");

const canView = canAccess(5);

// add attachments
router.post(
  "/attachments",
  uploadFile.array("images", 20),
  canView,
  async (req, res) => {
    try {
      res.status(200).json({ message: "success" });
    } catch (error) {
      res.status(400).json({ error });
    }
  }
);

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
  try {
    const userId = req.user.id;
    const { id: checkInId, date, questions } = req.body;
    const method = await checkInFunctions.editCheckIn(
      date,
      userId,
      checkInId,
      questions
    );
    res.status(200).json({
      message: `${
        method === "insert" ? "inserted" : "updated"
      } check in successfully`,
    });
  } catch (error) {
    res.status(400).json({ error });
  }
});

// delete check ins
router.delete("/checkin/:id", canView, async (req, res) => {
  try {
    const id = req.params.id;
    const result = await checkInFunctions.deleteCheckIn(id);
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
