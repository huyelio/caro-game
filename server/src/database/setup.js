/**
 * DATABASE SETUP SCRIPT
 * Run this to create tables and initial data
 */

const fs = require("fs");
const path = require("path");
const pool = require("../config/database");

async function setupDatabase() {
  console.log("🔧 Setting up database...");

  try {
    // Read SQL schema file
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Execute schema
    await pool.query(schema);

    console.log("✅ Database tables created successfully!");
    console.log("✅ Sample data inserted!");
    console.log("\n📊 Database is ready to use!");

    // Show tables
    const result = await pool.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `);

    console.log("\n📋 Tables created:");
    result.rows.forEach((row) => {
      console.log(`   - ${row.tablename}`);
    });
  } catch (error) {
    console.error("❌ Error setting up database:", error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run setup
if (require.main === module) {
  setupDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = setupDatabase;
