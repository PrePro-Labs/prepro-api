const { poolPromise } = require("../../config/database");

const supplementFunctions = {
  async getSupplementItems() {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        const [result] = await pool.query(
          `
            select * from supplementItems
            `
        );
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  },
};

module.exports = supplementFunctions;
