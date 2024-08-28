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
        await pool.query(
          `
                delete from exerciseTypes
                where id = ?
                `,
          [id]
        );

        resolve("success");
      } catch (e) {
        reject(e);
      }
    });
  },
  async addExerciseType(name, target) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const [result] = await pool.query(
          `
                insert into exerciseTypes (name, target) values (?, ?)
                `,
          [name, target]
        );
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  },
};

module.exports = fitnessFunctions;
