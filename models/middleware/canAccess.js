const { poolPromise } = require("../../config/database");

async function appChecker(userId, appId) {
  try {
    const pool = await poolPromise;
    const [result] = await pool.query(
      `
            select * from apps app
            left join apiUserAccess acc
                on app.id = acc.appId
            where app.allUsers = true or ( acc.appId = ? and acc.userId = ? );
            `,
      [appId, userId]
    );
    if (result.length) return result;
    else return false;
  } catch (e) {
    console.log(e);
  }
}

function canAccess(appIds, accessType = "view") {
  return async function handler(req, res, next) {
    try {
      const appsToCheck = typeof appIds === "number" ? [appIds] : appIds;
      const checkApps = Promise.all(
        appsToCheck.map((appId) => appChecker(req.user.id, appId))
      );
      const results = await checkApps;
      if (results.some((result) => result.length))
        next(); // if the user has access to any of the specified apps, they get access
      else
        res.status(400).json({
          error:
            accessType === "admin"
              ? "You are not authorized admin for this app."
              : `You are not authorized to ${accessType} this app.`,
        });
    } catch (e) {
      res.status(400).json({ error: `Error checking user privileges: ${e}` });
    }
  };
}

module.exports = canAccess;
