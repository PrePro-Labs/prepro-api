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


router.post("/submit-log", async (req, res) => {
  const { date, amWeight, sleepQuality, sleepHours, stress, mood, soreness, energy, workoutComments, dayComments, pmWeight } = req.body;
  let { logType } = req.body; 
  const userId = req.user.id;

  logType = logType.toLowerCase();

  if (!date || !userId || !logType || !['morning', 'night'].includes(logType)) {
    return res.status(400).json({ message: "Missing or invalid required fields. 'logType' must be either 'morning' or 'night'." });
  }
  try {
    const pool = await poolPromise;
    const sql = `
      INSERT INTO dailyLogs (date, userId, amWeight, sleepQuality, sleepHours, stress, mood, soreness, energy, workoutComments, dayComments, pmWeight, logType)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await pool.query(sql, [date, userId, amWeight, sleepQuality, sleepHours, stress, mood, soreness, energy, workoutComments, dayComments, pmWeight, logType]);

    res.status(201).json({ message: "Log submitted successfully" });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.error("Duplicate log entry:", error.message);
      res.status(409).json({ message: "A log for this date and type already exists for the user" });
    } else {
      console.error("Error submitting log:", error.message);
      res.status(500).json({ message: "Failed to submit log" });
    }
  }
});


module.exports = router;
