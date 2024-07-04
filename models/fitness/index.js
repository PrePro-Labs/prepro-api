const { poolPromise } = require("../../config/database");

const fitnessFunctions = {
  async getWorkoutTypes() {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const [result] = await pool.query(`
                select * from workoutTypes
                `);
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  },
};

module.exports = fitnessFunctions;
