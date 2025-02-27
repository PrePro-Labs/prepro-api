const { poolPromise } = require("../../config/database");

const dashboardFunctions = {
  async getApps(userId) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const [result] = await pool.query(
          `
          select app.* from apps app
            left join apiUserAccess acc
          on app.id = acc.appId
          where acc.userId = ?
            or app.allUsers = 1
          `,
          [userId]
        );
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  },

  async updateChangeLogStatus(versionId, userId) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        await pool.query(
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

  async getFavorites(userId) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const [result] = await pool.query(
          `
          select appId from appFavorites
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

  async updateFavorite(userId, appId) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;

        const [existing] = await pool.query(
          `
          select * from appFavorites
          where userId = ? and appId = ?
          `,
          [userId, appId]
        );

        if (existing.length) {
          // remove
          await pool.query(
            `
            delete from appFavorites
            where userId = ? and appId = ?
            `,
            [userId, appId]
          );
        } else {
          // insert
          await pool.query(
            `
    insert into appFavorites (userId, appId) 
    values (?, ?)
    `,
            [userId, appId]
          );
        }

        resolve();
      } catch (e) {
        reject(e);
      }
    });
  },
};

module.exports = dashboardFunctions;
