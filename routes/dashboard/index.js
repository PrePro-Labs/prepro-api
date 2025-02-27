const router = require("express").Router();
const { poolPromise } = require("../../config/database");
const dashboardFunctions = require("../../models/dashboard");

// no canView middleware since these are accessed regardless of apps
router.get("/apps", async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await dashboardFunctions.getApps(userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json(error);
  }
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
      left join buildUserStatus usr
        on bld.id = usr.buildId
      left join buildChanges cha
        on bld.id = cha.buildId
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
  res.status(200).json(result);
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
    res.status(200).json("successfully updated change log status");
  } catch (error) {
    res.status(200).json(error);
  }
});

router.get("/favorites", async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await dashboardFunctions.getFavorites(userId);

    const apps = result.map((r) => r.appId);
    res.status(200).json(apps);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.post("/favorite", async (req, res) => {
  try {
    const userId = req.user.id;
    const { appId } = req.body;
    await dashboardFunctions.updateFavorite(userId, appId);

    res.status(200).json();
  } catch (error) {
    res.status(400).json(error);
  }
});

module.exports = router;
