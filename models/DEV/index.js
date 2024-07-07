const { poolPromise } = require("../../config/database");

const devFunctions = {
  async executeDevQuery(sql) {
    return new Promise(async function (resolve, reject) {
      try {
        if (process.env.ENVIRONMENT !== "dev")
          throw new Error(
            "This action is only permitted in the development environment."
          );
        const pool = await poolPromise;
        const [result] = await pool.query(sql);
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
  },
};

module.exports = devFunctions;
