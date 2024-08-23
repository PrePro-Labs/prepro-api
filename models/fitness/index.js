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
    // should be able to delete these with cascade trigger
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
          SELECT id FROM workoutLogsExercises
          WHERE exerciseId = ?
          `,
          [id]
        );

        if (affectedLogs.length > 0) {
          const workoutExerciseIds = affectedLogs.map((log) => log.id);

          // Delete workout log sets for affected exercises
          await pool.query(
            `
            DELETE FROM workoutLogsExercisesSets
            WHERE workoutExerciseId IN (?)
            `,
            [workoutExerciseIds]
          );

          // Delete workout exercises
          await pool.query(
            `
            DELETE FROM workoutLogsExercises
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
  async addExerciseType(name) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const [result] = await pool.query(
          `
                insert into exerciseTypes (name) values (?)
                `,
          [name]
        );
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  },
};

module.exports = fitnessFunctions;
