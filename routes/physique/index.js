const router = require("express").Router();
const physiqueFunctions = require("../../models/physique");
const canAccess = require("../../models/middleware/canAccess");
const { upload, deleteFile } = require("../../config/awsConfig");
const uploadFile = upload("checkin-photos");

const canView = canAccess(5);

// get poses
router.get("/poses", canView, async (req, res) => {
  try {
    const result = await physiqueFunctions.getPoses();
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error });
  }
});

// // change pose
// router.post("/pose", canView, async (req, res) => {
//   try {
//     const { photoId, poseId } = req.body;
//     await physiqueFunctions.changePose(photoId, poseId);
//     res.status(200).json({
//       message: "success",
//     });
//   } catch (error) {
//     res.status(400).json({ error });
//   }
// });

// get photos
router.get("/photos", canView, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await physiqueFunctions.getPhotos(userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error });
  }
});

// add photos
router.post(
  "/photos",
  uploadFile.array("images", 20),
  canView,
  async (req, res) => {
    try {
      const { checkInId } = req.body;
      const fileNames = req.files.map((file) => file.key); // returns array of URLS for each of the files
      await physiqueFunctions.addPhotos(checkInId, fileNames);

      res.status(200).json({ message: "success" });
    } catch (error) {
      console.log(error);
      res.status(400).json({ error });
    }
  }
);

// delete photo
router.delete("/photo/:id", canView, async (req, res) => {
  try {
    const { id } = req.params;

    const files = await physiqueFunctions.getPhotoDetails(id);

    if (!files.length) throw new Error("No files matched to local DB");

    // delete from AWS
    await deleteFile("checkin-photos", files[0].s3Filename);

    // delete from local db
    await physiqueFunctions.deletePhysiquePhoto(id);
    res.status(200).json({ message: "success" });
  } catch (error) {
    res.status(400).json({ error });
  }
});

module.exports = router;
