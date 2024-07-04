const router = require("express").Router();
const { poolPromise } = require("../../config/database");
const adminFunctions = require("../../models/admin");

router.get("/apps", async (req, res) => {
  const pool = await poolPromise;
  const [result] = await pool.query(`
      select * from apps;
      `);

  res.status(200).json({ result });
});

router.get("/access", async (req, res) => {
  const pool = await poolPromise;
  const [result] = await pool.query(`
      select * from apiUserAccess;
      `);

  res.status(200).json({ result });
});

router.get("/users", async (req, res) => {
  const pool = await poolPromise;
  const [result] = await pool.query(`
      select * from apiUsers;
      `);

  res.status(200).json({ result });
});

router.post("/access/delete", async (req, res) => {
  const { userId, appId } = req.body;
  const pool = await poolPromise;

  try {
    const [result] = await pool.query(`
        delete from apiUserAccess
        where userId = '${userId}' and appId = ${appId}
        `);
    res.status(200).json({ message: "deleted access" });
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.post("/access/add", async (req, res) => {
  const { userId, appId } = req.body;
  const pool = await poolPromise;

  try {
    const [result] = await pool.query(`
          insert into apiUserAccess (userId, appId)
          values ('${userId}', ${appId})
          `);
    res.status(200).json({ message: "deleted access" });
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.post("/build", async (req, res) => {
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
    console.log(error);
    res.status(400).json({ error });
  }
});

module.exports = router;
