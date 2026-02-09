const sql = require('mssql');
const config = require('./config.js');

let pool = null;

async function getPool() {
  if (pool) return pool;
  pool = await sql.connect(config.db);
  return pool;
}

async function query(sqlQuery, params = {}) {
  const p = await getPool();
  const req = p.request();
  Object.keys(params).forEach((key) => {
    req.input(key, params[key]);
  });
  const result = await req.query(sqlQuery);
  return result.recordset;
}

async function execute(procedureOrQuery, params = {}) {
  const p = await getPool();
  const req = p.request();
  Object.keys(params).forEach((key) => {
    req.input(key, params[key]);
  });
  await req.query(procedureOrQuery);
}

module.exports = { getPool, query, execute, sql };
