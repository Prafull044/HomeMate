const { createPool } = require("./db");

async function migrate() {
  const pool = createPool();

  try {
    const [cols] = await pool.query("DESCRIBE Users");
    const colNames = cols.map(c => c.Field);
    
    if (!colNames.includes("role")) {
      console.log("Adding role column to Users table...");
      await pool.query("ALTER TABLE Users ADD COLUMN role ENUM('new', 'existing', 'owner') NULL");
    }
    if (!colNames.includes("password_hash")) {
      console.log("Adding password_hash column to Users table...");
      await pool.query("ALTER TABLE Users ADD COLUMN password_hash VARCHAR(128) NULL");
      if (colNames.includes("password")) {
        await pool.query("UPDATE Users SET password_hash = password WHERE password_hash IS NULL");
      }
    }
    console.log("Database Migration Completed Successfully!");
  } catch (err) {
    console.error("Migration Error:", err);
  } finally {
    await pool.end();
  }
}

migrate();
