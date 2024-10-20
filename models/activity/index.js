const { poolPromise } = require("../../config/database");

const activityFunctions = {
  async getActivity(userId) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        // get workouts
        const [workouts] = await pool.query(
          `
          SELECT 
            log.id, 
            log.date, 
            CONCAT('Workout: ', COALESCE(tmp.name, 'N/A')) AS title, 
            'workout' AS type
          FROM workoutLogs log
          LEFT JOIN workoutTemplates tmp ON tmp.id = log.workoutTemplateId
          WHERE log.userId = ?
          `,
          [userId]
        );

        // get checkins
        const [checkIns] = await pool.query(
          `
          select 
            chk.id, 
            chk.date,
            'Check-In' AS title,
            'checkin' AS type
          from checkIns chk
          where chk.userId = ?
          `,
          [userId]
        );

        resolve([...workouts, ...checkIns]);
      } catch (e) {
        reject(e);
      }
    });
  },
};

module.exports = activityFunctions;
