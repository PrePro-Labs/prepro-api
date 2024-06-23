const router = require("express").Router();
const { poolPromise } = require("../../config/database");

router.get("/", async (req, res) => {
  const userId = req.user.id;
  const pool = await poolPromise;
  const [result] = await pool.query(`
      select * from dailyLogs log
      where log.userId = ${userId}
      `);

  res.status(200).json({ result });
});

module.exports = router;
