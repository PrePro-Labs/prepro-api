const { poolPromise } = require("../../../config/database");

const logFunctions = {
  async editWorkout(workoutId, userId, date, type, timeCompleted, comments) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        if (!workoutId) {
          const result = await pool.query(
            `
            insert into workoutLogs (userId, date, type, timeCompleted, comments)
            values(?, ?, ?, ?, ?);
            `,
            [userId, date, type, timeCompleted, comments]
          );
          resolve("insert");
        } else {
          const result = await pool.query(
            `
            update workoutLogs set
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
            select * from workoutLogs
            where userId = ?
            `,
          [userId]
        );

        // get exercises
        const [exercises] = await pool.query(
          `
            select ex.* from workoutLogsExercises ex
            left join workoutLogs log 
              on ex.workoutId = log.id
            where log.userId = ?
            `,
          [userId]
        );

        // get sets
        const [sets] = await pool.query(
          `
          select sets.* from workoutLogsExercisesSets sets
          left join workoutLogsExercises ex 
            on sets.workoutExerciseId = ex.id
          left join workoutLogs log
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
  async deleteWorkoutExercise(id) {
    // should be able to shorten this after adding in cascade trigger
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const result1 = await pool.query(
          `
            delete from workoutLogsExercises where id = ?
            `,
          [id]
        );

        const result2 = await pool.query(
          `
            delete from workoutLogsSets where workoutExerciseId = ?
            `,
          [id]
        );
        resolve("success");
      } catch (e) {
        reject(e);
      }
    });
  },
  async editWorkoutExercise(
    workoutId,
    exerciseId,
    restTime,
    comments,
    workoutExerciseId,
    sets
  ) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        if (!workoutExerciseId) {
          // insert
          const result = await pool.query(
            `
            INSERT INTO workoutLogsExercises
            (workoutId, exerciseId)
            VALUES (?, ?)
            `,
            [workoutId, exerciseId]
          );

          // Get the id of the newly inserted row
          const workoutExerciseId = result[0].insertId;

          const setPromises = sets.map((s, i) => {
            return pool.query(
              `
              INSERT INTO workoutLogsExercisesSets
              (workoutExerciseId, orderId, weight, reps)
              VALUES (?, ?, ?, ?)
              `,
              [workoutExerciseId, i, s.weight, s.reps]
            );
          });

          await Promise.all(setPromises);
          resolve("insert");
        } else {
          // edit
          // const result = await pool.query(
          //   `
          //   update workoutLog set
          //   type = ?,
          //   timeCompleted = ?,
          //   comments = ?
          //   where id = ?;
          //   `,
          //   [type, timeCompleted, comments, workoutId]
          // );
          resolve("update");
        }
      } catch (e) {
        reject(e);
      }
    });
  },
};

module.exports = logFunctions;
