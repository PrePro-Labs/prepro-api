const router = require("express").Router();
const { poolPromise } = require("../../config/database");
const dashboardFunctions = require("../../models/dashboard");

// no canView middleware since these are accessed regardless of apps
router.get("/apps", async (req, res) => {
  const userId = req.user.id;
  const pool = await poolPromise;
  const [result] = await pool.query(`
      select app.* from apps app
      left join apiUserAccess acc
          on app.id = acc.appId
      where acc.userId = ${userId}
      or app.allUsers = 1
      `);

  res.status(200).json({ result });
});

router.get("/changelog", async (req, res) => {
  const userId = req.user.id;
  const pool = await poolPromise;
  const [result] = await pool.query(`
      select 
        bld.version,
        bld.id,
        app.name,
        cha.textId,
        cha.text,
        cha.type
      from builds bld
      left join buildUsers usr
        on bld.id = usr.versionId
      left join buildChanges cha
        on bld.id = cha.versionId
      left join apps app
        on cha.appId = app.id
      left join apiUserAccess acc
        on app.id = acc.appId
      where 
        usr.userId = '${userId}' and 
        usr.userId = acc.userId and
        cha.appId = acc.appId and 
        usr.seen = 0
      `);
  res.status(200).json({ result });
});

router.post("/changelog", async (req, res) => {
  const userId = req.user.id;
  const { versions } = req.body;

  try {
    const poolPromises = [];
    versions.forEach((v) => {
      poolPromises.push(dashboardFunctions.updateChangeLogStatus(v, userId));
    });

    await Promise.all(poolPromises);
    res.status(200).json({ message: "successfully updated change log status" });
  } catch (error) {
    res.status(200).json({ error });
  }
});

module.exports = router;
