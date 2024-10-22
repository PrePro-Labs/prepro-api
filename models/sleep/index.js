const { poolPromise } = require("../../config/database");

const sleepFunctions = {
  async getOuraLogs(userId) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const [result] = await pool.query(
          `
          select * from sleepLogs where userId = ?
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

module.exports = sleepFunctions;
