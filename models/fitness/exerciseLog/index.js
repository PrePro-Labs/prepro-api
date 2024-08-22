const { poolPromise } = require("../../../config/database");

const exerciseLogFunctions = {
  async editWorkout(workoutId, userId, date, type, timeCompleted, comments) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        if (!workoutId) {
          const result = await pool.query(
            `
            insert into workoutLog (userId, date, type, timeCompleted, comments)
            values(?, ?, ?, ?, ?);
            `,
            [userId, date, type, timeCompleted, comments]
          );
          resolve("insert");
        } else {
          const result = await pool.query(
            `
            update workoutLog set
            type = ?,
            timeCompleted = ?,
            comments = ?
            where id = ?;
            `,
            [type, timeCompleted, comments, workoutId]
          );
          resolve("update");
        }
      } catch (e) {
        reject(e);
      }
    });
  },
  async getWorkoutLogs(userId) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        // get summaries
        const [summaries] = await pool.query(
          `
            select * from workoutLog
            where userId = ?
            `,
          [userId]
        );

        // get exercises
        const [exercises] = await pool.query(
          `
            select ex.* from workoutExercises ex
            left join workoutLog log 
              on ex.workoutId = log.id
            where log.userId = ?
            `,
          [userId]
        );

        // get sets
        const [sets] = await pool.query(
          `
          select sets.* from workoutLogSets sets
          left join workoutExercises ex 
            on sets.workoutExerciseId = ex.id
          left join workoutLog log
            on ex.workoutId = log.id
          where log.userId = ?
          `,
          [userId]
        );

        const logs = summaries.reduce((acc, val) => {
          const retArr = [...acc];

          const exerciseData = [];

          exercises
            .filter((e) => e.workoutId === val.id)
            .forEach((e) => {
              const matchingSets = sets.filter(
                (s) => s.workoutExerciseId === e.id
              );
              exerciseData.push({ ...e, sets: matchingSets });
            });

          retArr.push({ ...val, exercises: exerciseData });

          return retArr;
        }, []);
        resolve(logs);
      } catch (e) {
        reject(e);
      }
    });
  },
};

module.exports = exerciseLogFunctions;
