const { poolPromise } = require("../../config/database");

const dashboardFunctions = {
  async updateChangeLogStatus(versionId, userId) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const [result] = await pool.query(`
            update buildUsers set seen = 1
            where versionId = '${versionId}' and userId = '${userId}'
            `);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  },
};

module.exports = dashboardFunctions;
