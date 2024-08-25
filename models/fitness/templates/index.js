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

  async editTemplateExercise(
    templateExerciseId,
    templateId,
    exerciseId,
    sets,
    restTime,
    comments
  ) {
    return new Promise(async function (resolve, reject) {
      try {
        console.log("params", {
          templateExerciseId,
          templateId,
          exerciseId,
          sets,
          restTime,
          comments,
        });
        const pool = await poolPromise;
        if (!templateExerciseId) {
          // insert
          const result = await pool.query(
            `
            INSERT INTO workoutTemplatesExercises
            (templateId, exerciseId, restTime, comments)
            VALUES (?, ?, ?, ?)
            `,
            [templateId, exerciseId, restTime, comments]
          );

          // Get the id of the newly inserted row
          const newId = result[0].insertId;

          const setPromises = sets.map((s, i) => {
            return pool.query(
              `
              INSERT INTO workoutTemplatesExercisesSets
              (templateExerciseId, orderId, reps)
              VALUES (?, ?, ?)
              `,
              [newId, i, s.reps]
            );
          });

          await Promise.all(setPromises);
          resolve("insert");
        } else {
          // edit
          await pool.query(
            `
            UPDATE workoutTemplatesExercises
            set exerciseId = ?, restTime = ?, comments = ?
            where id = ? 
            `,
            [exerciseId, restTime, comments, templateExerciseId]
          );

          // delete current sets
          await pool.query(
            `
            delete from workoutTemplatesExercisesSets
            where templateExerciseId = ?
            `,
            [templateExerciseId]
          );

          const setPromises = sets.map((s, i) => {
            return pool.query(
              `
                insert into workoutTemplatesExercisesSets
                (templateExerciseId, orderId, reps) values (?, ?, ?)
                `,
              [templateExerciseId, i, s.reps]
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
  async deleteTemplateExercise(id) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        await pool.query(
          `
            delete from workoutTemplatesExercises where id = ?
            `,
          [id]
        );
        resolve("success");
      } catch (e) {
        reject(e);
      }
    });
  },
};

module.exports = templateFunctions;
