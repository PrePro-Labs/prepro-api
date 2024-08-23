const { poolPromise } = require("../../../config/database");

const templateFunctions = {
  async getWorkoutTemplates(userId) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        // get templates
        const [savedTemplates] = await pool.query(
          `
                select * from workoutTemplates
                where userId = ?
                `,
          [userId]
        );

        // get exercises
        const [exercises] = await pool.query(
          `
                select ex.* from workoutTemplatesExercises ex
                left join workoutTemplates tp 
                  on ex.templateId = tp.id
                where tp.userId = ?
                `,
          [userId]
        );

        // get sets
        const [sets] = await pool.query(
          `
              select sets.* from workoutTemplatesExercisesSets sets
              left join workoutTemplatesExercises ex 
                on sets.templateExerciseId = ex.id
              left join workoutTemplates tp
                on ex.templateId = tp.id
              where tp.userId = ?
              `,
          [userId]
        );

        const templates = savedTemplates.reduce((acc, val) => {
          const retArr = [...acc];

          const exerciseData = [];

          exercises
            .filter((e) => e.templateId === val.id)
            .forEach((e) => {
              const matchingSets = sets.filter(
                (s) => s.templateExerciseId === e.id
              );
              exerciseData.push({ ...e, sets: matchingSets });
            });

          retArr.push({ ...val, exercises: exerciseData });

          return retArr;
        }, []);
        resolve(templates);
      } catch (e) {
        reject(e);
      }
    });
  },

  async editWorkoutTemplate(templateId) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        if (!templateId) {
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

module.exports = templateFunctions;
