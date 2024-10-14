const config = require("../config");
const adminFunctions = require("../models/admin");

module.exports = function (app, passport) {
  app.use("/api/dashboard", require("./dashboard"));
  app.use("/api/admin", require("./admin"));
  app.use("/api/support", require("./support"));
  app.use("/api/logs", require("./logs"));
  app.use("/api/fitness", require("./fitness"));
  app.use("/api/checkins", require("./checkIns"));
  app.use("/api/activity", require("./activity"));
  app.use("/api/physique", require("./physique"));
  app.use("/api/nutrition", require("./nutrition"));

  app.get("/failure", function (req, res) {
    res.render("failure.html");
  });

  app.get("/api/auth/user", async function (req, res, next) {
    if (req.user) {
      res.json(req.user);
    } else res.json(null);
  });

  app.get(
    "/auth/google",
    passport.authenticate("google", {
      display: "popup",
      scope: ["profile", "email"],
      successRedirect: "/success",
      failureRedirect: "/failure",
      failureFlash: true,
    })
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      successRedirect: config.routesIndexRedirectURL,
      failureRedirect: "/failure",
      failureFlash: true,
    })
  );

  app.get("/logout", function (req, res, next) {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  });

  app.get("/api/users", async (req, res) => {
    try {
      const result = await adminFunctions.getUsers();
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json(error);
    }
  });
};
