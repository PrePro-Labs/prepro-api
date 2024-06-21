const config = {
  passportCallbackURL: "http://localhost:3000/auth/google/callback",
  routesIndexRedirectURL: "http://localhost:3000/",
  mySQLConfig: {
    connectionLimit: 5,
    host: process.env.MYSQL_CONNECTION_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT,
  },
  googleAuth: {
    client_id: process.env.GOOGLE_AUTH_CLIENT_ID,
    project_id: process.env.GOOGLE_AUTH_PROJECT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_secret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
    redirect_uris: ["http://localhost:3000/auth/google/callback"],
  },
};

module.exports = config;
