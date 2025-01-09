const router = require("express").Router();
const checkInFunctions = require("../../models/checkIns");
const canAccess = require("../../models/middleware/canAccess");
const { deleteFile } = require("../../config/awsConfig");
const multer = require("multer");
const { sendEmail } = require("../../config/functions");
const uploadToLocal = multer({ dest: "temp/" });
const path = require("path");
const fs = require("fs");

const canView = canAccess(5);

// get check ins
router.get("/", canView, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await checkInFunctions.getCheckIns(userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json(error);
  }
});

// update check ins
router.post("/", canView, async (req, res) => {
  try {
    const userId = req.user.id;
    const values = req.body;
    const method = await checkInFunctions.editCheckIn(userId, values);

    // if first submit, generate sleep summary
    if (method === "insert") {
      await checkInFunctions.generateSleepSummary(userId, values.date);
    }

    res.status(200).json({
      message: `${
        method === "insert" ? "inserted" : "updated"
      } check in successfully`,
    });
  } catch (error) {
    res.status(400).json(error);
  }
});

// send pdf to coach
router.post(
  "/send",
  canView,
  uploadToLocal.single("file"),
  async (req, res) => {
    try {
      const { filename, checkInId } = req.body;
      const userId = req.user.id;

      await sendEmail(
        "wbeuliss@gmail.com",
        "jgaynr@icloud.com",
        "",
        filename,
        "",
        path.join(__dirname, "../../", req.file.path)
      );

      fs.unlinkSync(path.join(__dirname, "../../", req.file.path));
      await checkInFunctions.addCheckInComment(
        checkInId,
        userId,
        "Sent PDF to coach"
      );

      res.status(200).json("success");
    } catch (error) {
      res.status(400).json(error);
    }
  }
);

router.delete("/attachment/:id", canView, async (req, res) => {
  try {
    const { id } = req.params;

    const files = await checkInFunctions.getCheckInAttachment(id);

    if (!files.length) throw new Error("No files matched to local DB");

    // delete from AWS
    await deleteFile("checkin-photos", files[0].s3Filename);

    // delete from local db
    await checkInFunctions.deleteCheckInAttachment(id);
    res.status(200).json("success");
  } catch (error) {
    res.status(400).json(error);
  }
});

// delete check ins
router.delete("/checkin/:id", canView, async (req, res) => {
  try {
    const id = req.params.id;
    await checkInFunctions.deleteCheckIn(id);
    res.status(200).json("success");
  } catch (error) {
    res.status(400).json(error);
  }
});

// get commentary
router.get("/commentary/:id", canView, async (req, res) => {
  try {
    const id = req.params.id;
    const result = await checkInFunctions.getCheckInCommentary(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json(error);
  }
});

// add comment
router.post("/commentary", canView, async (req, res) => {
  try {
    const userId = req.user.id;
    const { checkInId, comment } = req.body;
    await checkInFunctions.addCheckInComment(checkInId, userId, comment);
    res.status(200).json("success");
  } catch (error) {
    res.status(400).json(error);
  }
});

// generate sleep summary
router.post("/sleep/summary", canView, async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.body;

    await checkInFunctions.generateSleepSummary(userId, date);
    res.status(200).json("success");
  } catch (error) {
    res.status(400).json(error);
  }
});

module.exports = router;
