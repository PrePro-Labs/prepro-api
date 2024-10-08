const router = require("express").Router();
const adminFunctions = require("../../models/admin");
const canAccess = require("../../models/middleware/canAccess");

const canView = canAccess(1);

router.get("/apps", canView, async (req, res) => {
  try {
    const result = await adminFunctions.getApps();
    res.status(200).json({ result });
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.get("/access", canView, async (req, res) => {
  try {
    const result = await adminFunctions.getAccess();
    res.status(200).json({ result });
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.post("/access/delete", canView, async (req, res) => {
  const { userId, appId } = req.body;
  try {
    const result = await adminFunctions.deleteAccess(userId, appId);
    res.status(200).json({ message: "deleted access" });
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.post("/access/add", canView, async (req, res) => {
  const { userId, appId } = req.body;
  try {
    const result = await adminFunctions.addAccess(userId, appId);
    res.status(200).json({ message: "deleted access" });
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.post("/build", canView, async (req, res) => {
  const { versionType, changes, users } = req.body;
  const userId = req.user.id;
  try {
    const versionId = await adminFunctions.insertNewBuild(versionType, userId);

    const changePromises = [];
    const userPromises = [];
    // insert changes
    changes.forEach((change) => {
      changePromises.push(
        adminFunctions.insertBuildChange(
          versionId,
          change.appId,
          change.textId,
          change.text,
          change.type
        )
      );
    });
    // insert affected users
    users.forEach((user) => {
      userPromises.push(adminFunctions.insertAffectedUser(versionId, user));
    });

    await Promise.all([...changePromises, ...userPromises]);

    res.status(200).json({ versionId });
  } catch (error) {
    res.status(400).json({ error });
  }
});

module.exports = router;
