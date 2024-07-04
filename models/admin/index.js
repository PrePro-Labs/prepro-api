const { poolPromise } = require("../../config/database");

const adminFunctions = {
  async insertNewBuild(versionType, userId) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const [result] = await pool.query(`
          select version, id from builds
          order by date desc
          limit 1
          `);

        if (!result.length) throw new Error("No previous builds!");
        const latestVersion = result[0].version.split(".");
        if (versionType === "patch") {
          latestVersion[2] = parseInt(latestVersion[2]) + 1;
        } else if (versionType === "minor") {
          latestVersion[1] = parseInt(latestVersion[1]) + 1;
          latestVersion[2] = 0;
        } else if (versionType === "major") {
          latestVersion[0] = parseInt(latestVersion[0]) + 1;
          latestVersion[1] = 0;
          latestVersion[2] = 0;
        }
        const newVersion = latestVersion.join(".");
        const newId = parseInt(result[0].id) + 1;
        const [result2] = await pool.query(`
          insert into builds (version, ranBy, date)
          values ('${newVersion}', '${userId}', now())
          `);
        resolve(newId);
      } catch (e) {
        reject(e);
      }
    });
  },

  async insertBuildChange(versionId, appId, textId, text, type) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const [result] = await pool.query(`
            insert into buildChanges (versionId, appId, textId, text, type)
            values ('${versionId}', ${appId}, ${textId}, '${text}', '${type}')
            `);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  },

  async insertAffectedUser(versionId, userId) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const [result] = await pool.query(`
          insert into buildUsers (versionId, userId, seen)
          values ('${versionId}', '${userId}', 0)
          `);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  },
};

module.exports = adminFunctions;
