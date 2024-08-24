const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const config = require("./");
const { poolPromise } = require("./database");

function User() {
  this.google = {
    id: String,
    email: String,
    name: String,
  };
}

module.exports = function (passport) {
  passport.serializeUser(function (user, done) {
    done(null, user.google.id);
  });
  passport.deserializeUser(async function (id, done) {
    try {
      const pool = await poolPromise;
      const [result] = await pool.query(
        `Select * from apiUsers where id = ${id}`
      );

      if (result[0]) done(null, result[0]);
      else throw `Nothing returned for ${id}`;
    } catch (err) {
      console.log("DB/Passport sign in error (#6236): ", err);
    }
  });
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.googleAuth.client_id,
        clientSecret: config.googleAuth.client_secret,
        callbackURL: config.passportCallbackURL,
      },
      function (accessToken, refreshToken, profile, done) {
        const userProfile = profile;
        process.nextTick(async function () {
          try {
            const pool = await poolPromise;
            const [result] = await pool.query(
              `Select * from apiUsers where id = ${userProfile.id}`
            );

            if (result[0]) {
              console.log("Logging in as", result[0].email);
              const { id, name, email } = result[0];
              const user = new User();
              user.google.id = id;
              user.google.name = name;
              user.google.email = email;
              return done(null, user);
            } else {
              const user = new User();
              user.google.id = userProfile.id;
              user.google.name = userProfile.displayName;
              user.google.email = userProfile.emails[0].value;

              const pool2 = await poolPromise;
              const [result] = await pool2.query(
                `insert into apiUsers (id, name, email) values (${user.google.id}, '${user.google.name}', '${user.google.email}')`
              );
              return done(null, user);
            }
          } catch (err) {
            console.log("DB/Passport sign in error (#1242): ", err);
          }
        });

        return;
      }
    )
  );
};
