const { poolPromise } = require("../../config/database");

const adminFunctions = {
  async insertBuildChange(version, appId, textId, text, type) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const [result] = await pool.query(`
            insert into builds (version, appId, textId, text, type)
            values ('${version}', ${appId}, ${textId}, '${text}', '${type}')
            `);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  },

  async insertAffectedUser(version, userId) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const [result] = await pool.query(`
          insert into buildUsers (version, userId, seen)
          values ('${version}', '${userId}', 0)
          `);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  },
};

module.exports = adminFunctions;
