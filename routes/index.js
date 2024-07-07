const config = require("../config");

module.exports = function (app, passport) {
  app.use("/api/DEV/", require("./DEV"));
  app.use("/api/dashboard", require("./dashboard"));
  app.use("/api/admin", require("./admin"));
  app.use("/api/support", require("./support"));
  app.use("/api/logs", require("./logs"));
  app.use("/api/fitness", require("./fitness"));

  app.get("/failure", function (req, res) {
    res.render("failure.html");
  });

  app.get("/api/auth/user", async function (req, res, next) {
    if (req.user) {
      res.json({ user: req.user });
    } else res.json({ user: null });
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
};
