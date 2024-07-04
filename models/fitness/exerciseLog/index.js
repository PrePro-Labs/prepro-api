const { poolPromise } = require("../../../config/database");

const exerciseLogFunctions = {
  async editWorkout(workoutId, userId, date, type, timeCompleted, comments) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        if (!workoutId) {
          const result = await pool.query(
            `
            insert into workoutLog (userId, date, typeId, timeCompleted, comments) 
            values('${userId}', '${date}', '${type}', '${timeCompleted}', '${comments}');
            `
          );
          resolve("insert");
        } else {
          const result = await pool.query(
            `
            update workoutLog set
            ...
            where id = ${workoutId};
            `
          );
          resolve("update");
        }
      } catch (e) {
        console.log(e);
        reject(e);
      }
    });
  },
};

module.exports = exerciseLogFunctions;
