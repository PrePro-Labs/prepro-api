const router = require("express").Router();
const physiqueFunctions = require("../../models/physique");
const canAccess = require("../../models/middleware/canAccess");

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
module.exports = router;
