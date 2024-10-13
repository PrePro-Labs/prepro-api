const { poolPromise } = require("../../../config/database");

const weightFunctions = {
  async getWeightLogs(userId) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const [result] = await pool.query(
          `
              select * from userLogsExternal
              where userId = ?
              `,
          [userId]
        );
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  },
};

module.exports = weightFunctions;
