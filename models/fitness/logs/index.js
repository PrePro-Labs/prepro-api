const { poolPromise } = require("../../../config/database");

const logFunctions = {
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
  async editWorkoutSummary(
    workoutId,
    userId,
    date,
    timeStarted,
    timeCompleted,
    comments
  ) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        if (!workoutId) {
          // insert
          await pool.query(
            `
            insert into workoutLogs (userId, date, timeStarted, timeCompleted, comments)
            values(?, ?, ?, ?, ?);
            `,
            [userId, date, timeStarted, timeCompleted, comments]
          );
          resolve("insert");
        } else {
          // edit
          await pool.query(
            `
            update workoutLogs set
            timeStarted = ?,
            timeCompleted = ?,
            comments = ?
            where id = ?;
            `,
            [timeStarted, timeCompleted, comments, workoutId]
          );
          resolve("update");
        }
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
    id,
    sets
  ) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        if (!id) {
          // insert
          const [maxOrderId] = await pool.query(
            `
            SELECT MAX(orderId) as maxOrderId
            FROM workoutLogsExercises
            WHERE workoutId = ?
            `,
            [workoutId]
          );

          const maxId = maxOrderId[0].maxOrderId || 0;
          const orderId = maxId + 1;

          const result = await pool.query(
            `
            INSERT INTO workoutLogsExercises
            (workoutId, exerciseId, restTime, comments, orderId)
            VALUES (?, ?, ?, ?, ?)
            `,
            [workoutId, exerciseId, restTime, comments, orderId]
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
              [workoutExerciseId, i, s.weight || null, s.reps || null]
            );
          });

          await Promise.all(setPromises);
          resolve("insert");
        } else {
          // edit
          await pool.query(
            `
            UPDATE workoutLogsExercises
            set exerciseId = ?, restTime = ?, comments = ?
            where id = ? 
            `,
            [exerciseId, restTime, comments, id]
          );

          // delete current sets
          await pool.query(
            `
            delete from workoutLogsExercisesSets
            where workoutExerciseId = ?
            `,
            [id]
          );

          const setPromises = sets.map((s, i) => {
            return pool.query(
              `
                insert into workoutLogsExercisesSets
                (workoutExerciseId, orderId, reps, weight) values (?, ?, ?, ?)
                `,
              [id, i, s.reps || null, s.weight || null]
            );
          });

          await Promise.all(setPromises);
          resolve("update");
        }
      } catch (e) {
        reject(e);
      }
    });
  },
  async deleteWorkoutSummary(id) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        await pool.query(
          `
            delete from workoutLogs where id = ?
            `,
          [id]
        );
        resolve("success");
      } catch (e) {
        reject(e);
      }
    });
  },
  async deleteWorkoutExercise(id) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        await pool.query(
          `
            delete from workoutLogsExercises where id = ?
            `,
          [id]
        );
        resolve("success");
      } catch (e) {
        reject(e);
      }
    });
  },
  async copyWorkoutFromTemplate(workoutId, templateId) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;

        // update workoutLogs to tie to template
        await pool.query(
          `
          update workoutLogs
          set workoutTemplateId = ?
          where id = ?
          `,
          [templateId, workoutId]
        );

        // Fetch template exercises
        const [templateExercises] = await pool.query(
          `
          SELECT * FROM workoutTemplatesExercises
          WHERE templateId = ?
          `,
          [templateId]
        );

        // For each template exercise, insert it into workoutLogsExercises
        const insertExercisesPromises = templateExercises.map(async (e) => {
          const [result] = await pool.query(
            `
            INSERT INTO workoutLogsExercises
            (workoutId, exerciseId, restTime, comments, orderId)
            VALUES (?, ?, ?, ?, ?)
            `,
            [workoutId, e.exerciseId, e.restTime, e.comments, e.orderId]
          );

          // Get the inserted workoutLogsExerciseId
          const workoutLogsExerciseId = result.insertId;

          // Fetch sets associated with the current template exercise
          const [templateSets] = await pool.query(
            `
            SELECT * FROM workoutTemplatesExercisesSets
            WHERE templateExerciseId = ?
            `,
            [e.id]
          );

          // Insert each set into workoutLogsExercisesSets
          const insertSetsPromises = templateSets.map((set) =>
            pool.query(
              `
              INSERT INTO workoutLogsExercisesSets
              (workoutExerciseId, orderId, reps)
              VALUES (?, ?, ?)
              `,
              [workoutLogsExerciseId, set.orderId, set.reps || null]
            )
          );

          // Wait for all sets to be inserted
          await Promise.all(insertSetsPromises);
        });

        // Wait for all exercises and their sets to be inserted
        await Promise.all(insertExercisesPromises);

        resolve("complete");
      } catch (e) {
        reject(e);
      }
    });
  },
  async changeExercisePosition(direction, exercise) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;

        const [allExercises] = await pool.query(
          `
          select * from workoutLogsExercises
          where workoutId = ?
          `,
          [exercise.workoutId]
        );

        function findIndex(array, target) {
          for (let i = 0; i < array.length; i++) {
            if (array[i].orderId === target) {
              return i;
            }
          }
          return -1;
        }

        const sorted = allExercises.sort((a, b) => a.orderId - b.orderId);
        const nextExercise =
          sorted[
            findIndex(sorted, exercise.orderId) + (direction === "up" ? -1 : 1)
          ];

        if (!nextExercise) reject("Exercise is already in first/last position");

        // set curr to next
        await pool.query(
          `
          update workoutLogsExercises set orderId = ?
          where id = ?;
          `,
          [nextExercise.orderId, exercise.id]
        );

        // set next to curr
        await pool.query(
          `
            update workoutLogsExercises set orderId = ?
            where id = ?;
            `,
          [exercise.orderId, nextExercise.id]
        );
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  },
};

module.exports = logFunctions;
