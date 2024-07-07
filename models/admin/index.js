const { poolPromise } = require("../../config/database");

const adminFunctions = {
  async getApps() {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const [result] = await pool.query(`
          select * from apps;
          `);
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  },

  async getAccess() {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const [result] = await pool.query(`
          select * from apiUserAccess;
          `);
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  },

  async getUsers() {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const [result] = await pool.query(`
          select * from apiUsers;
          `);
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  },

  async deleteAccess(userId, appId) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const [result] = await pool.query(
          `
          delete from apiUserAccess
          where userId = ? and appId = ?;
          `,
          [userId, appId]
        );
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  },

  async addAccess(userId, appId) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const [result] = await pool.query(
          `
          insert into apiUserAccess (userId, appId)
          values (?, ?)
          `,
          [userId, appId]
        );
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  },

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
        const [result2] = await pool.query(
          `
          insert into builds (version, ranBy, date)
          values (?, ?, now())
          `,
          [newVersion, userId]
        );
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
        const [result] = await pool.query(
          `
            insert into buildChanges (versionId, appId, textId, text, type)
            values (?, ?, ?, ?, ?)
            `,
          [versionId, appId, textId, text, type]
        );
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
        const [result] = await pool.query(
          `
          insert into buildUsers (versionId, userId, seen)
          values (?, ?, 0)
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

module.exports = adminFunctions;
