const { poolPromise } = require("../../config/database");
const { lambdaKey } = require("../../config/awsConfig");
const axios = require("axios");

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
  async pullOuraSleepLog(userId, date) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const [result] = await pool.query(
          `
          select * from sleepLogs where userId = ? and date = ?
          `,
          [userId, date]
        );

        if (!result.length) {
          await axios.post(
            "https://4apzgqqogvz2v5cduanzxtoyea0rupfx.lambda-url.us-east-2.on.aws/",
            {
              userId,
              date: date,
              lambdaKey,
            }
          );
        }

        resolve("success");
      } catch (e) {
        reject(e);
      }
    });
  },
  async getSleepIntegrations(userId) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const [result] = await pool.query(
          `
          select 
            usr.id,
              usr.type,
              usr.value,
              typ.name,
              typ.description
          from apiUsersIntegrations usr
          left join apiUsersIntegrationsTypes typ
            on usr.type = typ.id
          where usr.userId = ?
            and usr.type in (1);
          `,
          [userId]
        );
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  },
  async getSleepSettings(userId) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const [result] = await pool.query(
          `
          select
            sleepGoal,
            checkInFrequency,
            checkInDay
          from apiUsers
          where id = ?
          `,
          [userId]
        );
        resolve(result[0]);
      } catch (e) {
        reject(e);
      }
    });
  },
  async updateSleepSettings(userId, values) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;

        for (const key in values) {
          await pool.query(
            `
            update apiUsers
            set ${key} = ?
            where id = ?
            `,
            [values[key], userId]
          );
        }
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  },
};

module.exports = sleepFunctions;
