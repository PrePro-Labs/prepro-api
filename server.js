const express = require("express");
const passport = require("passport");
const session = require("express-session");
const path = require("path");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const RedisStore = require("connect-redis")(session);

dotenv.config({
  path: path.join(__dirname, "secrets.env"),
});

const app = express();

module.exports = app;

require("./config/passport.js")(passport);

app.use(
  session({
    store: new RedisStore({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      pass: process.env.REDIS_SECRET,
    }),
    secret: process.env.REDIS_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      // secure: process.env.ENVIRONMENT !== "dev",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    }, // removed secure
  })
);

app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

app.use(express.urlencoded({ extended: true })); // allows us to access fields in request body
app.use(express.json()); // for all other post routes

app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);

// api routes
require("./routes")(app, passport);

// catch-all for any other api routes
app.all("/api/*", (req, res) => {
  res.status(404).json({ message: "Route does not exist" });
});

// serve static files (i.e. images) from /public
app.use(express.static(path.join(__dirname, "src")));

// Authentication check middleware
app.use((req, res, next) => {
  const excludedRoutes = ["/auth/google", "/favicon.ico", "/sw.js"];
  const isExcluded = excludedRoutes.includes(req.originalUrl);

  if (isExcluded) {
    console.log("pushing through", req.originalUrl);
    return next();
  }

  if (!req.user) {
    console.log("No user, setting returnTo", req.originalUrl, "going to login");
    res.cookie("returnTo", req.originalUrl, { httpOnly: true });
    return res.render("login.html");
  }

  console.log("continue like normal");

  next();
});

// Serve static files for the react frontend
app.use(express.static(path.join(__dirname, "views/prepro-frontend/build")));

// if logged in, send to main page
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "views/prepro-frontend/build/index.html"));
});

app.listen(3000, () => console.log("Server listening on port: 3000"));
