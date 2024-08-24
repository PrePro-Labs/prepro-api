const { poolPromise } = require("../../config/database");

const dashboardFunctions = {
  async updateChangeLogStatus(versionId, userId) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const [result] = await pool.query(
          `
            update buildUserStatus set seen = 1
            where versionId = ? and userId = ?
            `,
          [versionId, userId]
        );
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  },
};

module.exports = dashboardFunctions;
