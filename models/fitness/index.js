const { poolPromise } = require("../../config/database");

const fitnessFunctions = {
  async getExerciseTypes() {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const [result] = await pool.query(
          `
                select * from exerciseTypes
                `
        );
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  },
  async deleteExerciseType(id) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const result1 = await pool.query(
          `
                delete from exerciseTypes
                where id = ?
                `,
          [id]
        );
        const [affectedLogs] = await pool.query(
          `
          SELECT id FROM workoutExercises
          WHERE exerciseId = ?
          `,
          [id]
        );

        if (affectedLogs.length > 0) {
          const workoutExerciseIds = affectedLogs.map((log) => log.id);

          // Delete workout log sets for affected exercises
          await pool.query(
            `
            DELETE FROM workoutLogSets
            WHERE workoutExerciseId IN (?)
            `,
            [workoutExerciseIds]
          );

          // Delete workout exercises
          await pool.query(
            `
            DELETE FROM workoutExercises
            WHERE id IN (?)
            `,
            [workoutExerciseIds]
          );
        }
        resolve("success");
      } catch (e) {
        reject(e);
      }
    });
  },
};

module.exports = fitnessFunctions;
