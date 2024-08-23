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
  async deleteWorkoutExercise(id) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const result1 = await pool.query(
          `
            delete from workoutExercises where id = ?
            `,
          [id]
        );

        const result2 = await pool.query(
          `
            delete from workoutLogSets where workoutExerciseId = ?
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
            INSERT INTO workoutExercises
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
              INSERT INTO workoutLogSets
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

module.exports = exerciseLogFunctions;
