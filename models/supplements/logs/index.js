const { poolPromise } = require("../../../config/database");

const logFunctions = {
  async getSupplementLogs(userId) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const [result] = await pool.query(
          `
            select * from supplementLogs
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
  async editSupplementLog(userId, item, date) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;

        if (item.completed) {
          // delete
          await pool.query(
            `
            delete from supplementLogs
            where userId = ? and supplementId = ? and date = ?
            `,
            [userId, item.id, date]
          );
        } else {
          await pool.query(
            `
            insert into supplementLogs (userId, supplementId, date)
            values (?, ?, ?)
            `,
            [userId, item.id, date]
          );
        }
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  },
  async getMissedSupplements(userId) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const [result] = await pool.query(
          `
            select * from supplementLogsMissed
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
  async addMissedSupplement(userId, item, date, reason) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        await pool.query(
          `
            insert into supplementLogsMissed
            (userId, supplementId, date, reason)
            values (?, ?, ?, ?)
            `,
          [userId, item.id, date, reason]
        );
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  },
};

module.exports = logFunctions;
