const router = require("express").Router();
const { poolPromise } = require("../../config/database");

router.get("/create", async (req, res) => {
  const pool = await poolPromise;
  const [result] = await pool.query(``);
  res.status(200).json({ message: "query complete!", result });
});

module.exports = router;
