module.exports = {
  server: {
    port: process.env.PORT || 3000,
  },
  db: {
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_DATABASE || 'TiendaSM',
    user: process.env.DB_USER || 'user',
    password: process.env.DB_PASSWORD || 'password',
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  },
};
