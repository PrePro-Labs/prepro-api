const { poolPromise } = require("../../../config/database");

const weightFunctions = {
  async getWeightLogs(userId) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const [result] = await pool.query(
          `
              select * from weightLogs
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
  async editWeightLog(userId, weight, date) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;

        const [existing] = await pool.query(
          `select 1 from weightLogs where userId = ? and date = ?`,
          [userId, date]
        );

        if (existing.length) {
          await pool.query(
            `
              update weightLogs set weight = ? where userId = ? and date = ?
              `,
            [weight, userId, date]
          );
        } else {
          await pool.query(
            `
              insert into weightLogs (userId, date, weight) values (?, ?, ?)
              `,
            [userId, date, weight]
          );
        }
        resolve("success");
      } catch (e) {
        reject(e);
      }
    });
  },
};

module.exports = weightFunctions;
