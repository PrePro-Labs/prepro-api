const mysql = require("mysql2/promise");
const config = require("./index");

const poolPromise = (async function () {
  try {
    const pool = await mysql.createPool(config.mySQLConfig);

    console.log("Connected to MySQL Database");
    // pool.query(
    //   "CREATE TABLE apiUsers ( id VARCHAR(55) PRIMARY KEY, name VARCHAR(255), email VARCHAR(255) UNIQUE)"
    // );
    // console.log('Ran Query');

    return pool;
  } catch (err) {
    console.log("MySQL Database Connection Failed! Bad Config: ", err);
    throw err;
  }
})();

module.exports = { poolPromise };
