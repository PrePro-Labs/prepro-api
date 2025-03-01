const mysql = require("mysql2/promise");
const config = require("./index");

const poolPromise = (async function () {
  try {
    const pool = await mysql.createPool(config.mySQLConfig);

    console.log("Connected to MySQL Database");

    return pool;
  } catch (err) {
    console.log("MySQL Database Connection Failed! Bad Config: ", err);
    throw err;
  }
})();

module.exports = { poolPromise };
