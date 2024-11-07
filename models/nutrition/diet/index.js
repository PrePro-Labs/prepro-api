const { poolPromise } = require("../../../config/database");

const dietFunctions = {
  async getDietLogs(userId) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const [result] = await pool.query(
          `
              select * from dietLogs
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
  async editDietLog(values) {
    return new Promise(async function (resolve, reject) {
      try {
        const { id, protein, carbs, fat, cardio, effectiveDate, userId } =
          values;

        const calories = protein * 4 + carbs * 4 + fat * 9;

        const pool = await poolPromise;
        if (id) {
          // update
          await pool.query(
            `
              update dietLogs
              set protein = ?, carbs = ?, fat = ?, calories = ?, cardio = ?
              where id = ?
              `,
            [protein, carbs, fat, calories, cardio, id]
          );
        } else {
          // insert
          await pool.query(
            `
              insert into dietLogs (userId, protein, carbs, fat, calories, cardio, effectiveDate) 
              values (?, ?, ?, ?, ?, ?, ?)
              `,
            [userId, protein, carbs, fat, calories, cardio, effectiveDate]
          );
        }
        resolve("success");
      } catch (e) {
        reject(e);
      }
    });
  },
  async deleteDietLog(id) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        await pool.query(
          `
              delete from dietLogs
              where id = ?
              `,
          [id]
        );
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  },
};

module.exports = dietFunctions;
