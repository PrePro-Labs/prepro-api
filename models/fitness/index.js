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
};

module.exports = fitnessFunctions;
