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
                and active = 1
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
    id,
    templateId,
    exerciseId,
    sets,
    restTime,
    comments
  ) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        if (!id) {
          // insert
          const [maxOrderId] = await pool.query(
            `
            SELECT MAX(orderId) as maxOrderId
            FROM workoutTemplatesExercises
            WHERE templateId = ?
            `,
            [templateId]
          );

          const maxId = maxOrderId[0].maxOrderId || 0;
          const orderId = maxId + 1;

          const result = await pool.query(
            `
            INSERT INTO workoutTemplatesExercises
            (templateId, exerciseId, restTime, comments, orderId)
            VALUES (?, ?, ?, ?, ?)
            `,
            [templateId, exerciseId, restTime, comments, orderId]
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
              [newId, i, s.reps || null]
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
            [exerciseId, restTime, comments, id]
          );

          // delete current sets
          await pool.query(
            `
            delete from workoutTemplatesExercisesSets
            where templateExerciseId = ?
            `,
            [id]
          );

          const setPromises = sets.map((s, i) => {
            return pool.query(
              `
                insert into workoutTemplatesExercisesSets
                (templateExerciseId, orderId, reps) values (?, ?, ?)
                `,
              [id, i, s.reps || null]
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
  async changeExercisePosition(direction, exercise) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;

        const [allExercises] = await pool.query(
          `
          select * from workoutTemplatesExercises
          where templateId = ?
          `,
          [exercise.templateId]
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
          update workoutTemplatesExercises set orderId = ?
          where id = ?;
          `,
          [nextExercise.orderId, exercise.id]
        );

        // set next to curr
        await pool.query(
          `
            update workoutTemplatesExercises set orderId = ?
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

module.exports = templateFunctions;
