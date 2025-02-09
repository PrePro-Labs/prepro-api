const { poolPromise } = require("../../config/database");
const { lambdaKey } = require("../../config/awsConfig");

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
        await axios.post(
          "https://4apzgqqogvz2v5cduanzxtoyea0rupfx.lambda-url.us-east-2.on.aws/",
          {
            userId,
            date: date,
            lambdaKey,
          }
        );
        resolve("success");
      } catch (e) {
        reject(e);
      }
    });
  },
};

module.exports = sleepFunctions;
