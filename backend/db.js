try { require("dotenv").config(); } catch (e) {}
const mysql = require("mysql2/promise");

function getDbConfig() {
  const rawUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
  if (rawUrl) {
    const cleanUrl = rawUrl.replace(/[?&]ssl-mode=[^&]+/i, "");
    const isCloud = process.env.DB_SSL === "true" || cleanUrl.includes("aivencloud") || cleanUrl.includes("tidbcloud") || cleanUrl.includes("clever-cloud") || cleanUrl.includes("railway");
    return {
      uri: cleanUrl,
      ssl: isCloud ? { rejectUnauthorized: false } : undefined,
      connectionLimit: 10,
      waitForConnections: true,
      connectTimeout: 20000,
    };
  }
  return {
    host: process.env.MYSQLHOST || process.env.DB_HOST || "localhost",
    port: Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306),
    user: process.env.MYSQLUSER || process.env.DB_USER || "root",
    password: process.env.MYSQLPASSWORD !== undefined ? process.env.MYSQLPASSWORD : (process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : ""),
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || "homemate2",
    connectionLimit: 10,
    waitForConnections: true,
    connectTimeout: 20000,
    ssl: (process.env.DB_SSL === "true" || process.env.DB_HOST?.includes("aivencloud") || process.env.DB_HOST?.includes("tidbcloud"))
      ? { rejectUnauthorized: false }
      : undefined,
  };
}

function createPool() {
  const config = getDbConfig();
  return mysql.createPool(config);
}

module.exports = { getDbConfig, createPool };
