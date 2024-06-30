const router = require("express").Router();
const { poolPromise } = require("../../config/database");

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

module.exports = router;
