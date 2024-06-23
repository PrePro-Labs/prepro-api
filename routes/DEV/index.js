const router = require("express").Router();
const { poolPromise } = require("../../config/database");

router.get("/create", async (req, res) => {
  const pool = await poolPromise;
  const [result] = await pool.query(`CREATE TABLE dailyLogs (id INT AUTO_INCREMENT, date DATE NOT NULL, userId VarChar(255) NOT NULL, amWeight FLOAT NOT NULL, sleepQuality INT NOT NULL,sleepHours FLOAT NOT NULL,stress INT NOT NULL,mood INT NOT NULL,soreness INT NOT NULL,energy INT NOT NULL,pmWeight FLOAT,workoutComments VarChar(255) NOT NULL,dayComments VarChar(255) NOT NULL,PRIMARY KEY (id),UNIQUE KEY unique_date_user (date, userId))`);
  res.status(200).json({ message: "query complete!", result });
});

module.exports = router;
 
