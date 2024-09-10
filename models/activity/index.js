const { poolPromise } = require("../../config/database");

const activityFunctions = {
  async getActivity(userId) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        // get workouts
        const [workouts] = await pool.query(
          `
          select log.id, log.date, CONCAT('Workout: ', tmp.name) as title, 'workout' AS type
          from workoutLogs log
          left join workoutTemplates tmp
	          on tmp.id = log.workoutTemplateId
          where log.userId = ?
          `,
          [userId]
        );

        // get checkins
        const [checkIns] = await pool.query(
          `
          select 
            chk.id, 
            chk.date,
            CASE 
              WHEN ans.answer IS NULL OR ans.answer = 0 OR ans.answer = '' THEN 'Check-in: --'
              ELSE CONCAT('Check-in: ', CONCAT(FORMAT(ans.answer, 1), 'lbs'))
            END AS title,
            'checkin' AS type
          from checkIns chk
          left join checkInsQuestionsAnswers ans
	          on ans.checkInId = chk.id
          where chk.userId = ?
	          and ans.questionId = 1
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
