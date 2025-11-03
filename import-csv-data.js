/**
 * Import dataset_sample.csv vào PostgreSQL
 * Usage: node import-csv-data.js
 */

const fs = require("fs");
const { Pool } = require("pg");

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "caro_game",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres123",
});

async function importCSV() {
  console.log("📊 Import dataset_sample.csv");
  console.log("=" .repeat(50));
  console.log("");

  try {
    // Read CSV file
    const csvContent = fs.readFileSync("dataset_sample.csv", "utf8");
    const lines = csvContent.split("\n");

    let currentTable = null;
    const users = [];
    const stats = [];
    const games = [];

    // Parse CSV
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip empty lines and comments starting with #
      if (!trimmed || trimmed.startsWith("#")) {
        // Check for table headers
        if (trimmed.includes("TABLE: users")) {
          currentTable = "users";
        } else if (trimmed.includes("TABLE: game_stats")) {
          currentTable = "game_stats";
        } else if (trimmed.includes("TABLE: game_history")) {
          currentTable = "game_history";
        }
        continue;
      }

      // Skip format lines
      if (trimmed.startsWith("Format:")) continue;

      // Parse data lines
      if (currentTable === "users") {
        const [id, username, email, password_hash, created_at, last_login] = 
          trimmed.split(",");
        users.push({ id, username, email, password_hash, created_at, last_login });
      } else if (currentTable === "game_stats") {
        const [id, user_id, wins, losses, draws, games_played, total_time_played, 
               highest_streak, current_streak, rating] = trimmed.split(",");
        stats.push({ 
          id, user_id, wins, losses, draws, games_played, 
          total_time_played, highest_streak, current_streak, rating 
        });
      } else if (currentTable === "game_history") {
        // Parse game history - more complex due to board_state JSON
        const parts = trimmed.split(",");
        if (parts.length >= 10) {
          const [id, game_mode, player1_id, player2_id, player3_id, winner_id, 
                 result, moves_count, duration] = parts.slice(0, 9);
          
          // board_state and played_at are in remaining parts
          const remaining = parts.slice(9).join(",");
          const lastCommaIndex = remaining.lastIndexOf(",");
          const board_state = remaining.substring(0, lastCommaIndex).replace(/^"|"$/g, '');
          const played_at = remaining.substring(lastCommaIndex + 1);
          
          games.push({
            id, game_mode, 
            player1_id: player1_id === "NULL" ? null : player1_id,
            player2_id: player2_id === "NULL" ? null : player2_id,
            player3_id: player3_id === "NULL" ? null : player3_id,
            winner_id: winner_id === "NULL" ? null : winner_id,
            result, moves_count, duration, board_state, played_at
          });
        }
      }
    }

    console.log("📋 Parsed data:");
    console.log(`   Users: ${users.length}`);
    console.log(`   Stats: ${stats.length}`);
    console.log(`   Games: ${games.length}`);
    console.log("");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await pool.query("TRUNCATE TABLE game_history CASCADE");
    await pool.query("TRUNCATE TABLE game_stats CASCADE");
    await pool.query("TRUNCATE TABLE users CASCADE");
    await pool.query("ALTER SEQUENCE users_id_seq RESTART WITH 1");
    await pool.query("ALTER SEQUENCE game_stats_id_seq RESTART WITH 1");
    await pool.query("ALTER SEQUENCE game_history_id_seq RESTART WITH 1");
    console.log("✅ Cleared");
    console.log("");

    // Insert users
    console.log("👥 Inserting users...");
    for (const user of users) {
      await pool.query(
        `INSERT INTO users (id, username, email, password_hash, created_at, last_login) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [user.id, user.username, user.email, user.password_hash, 
         user.created_at, user.last_login]
      );
      console.log(`   ✓ ${user.username}`);
    }

    // Insert game stats
    console.log("📊 Inserting game stats...");
    for (const stat of stats) {
      await pool.query(
        `INSERT INTO game_stats (id, user_id, wins, losses, draws, games_played, 
         total_time_played, highest_streak, current_streak, rating) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [stat.id, stat.user_id, stat.wins, stat.losses, stat.draws, 
         stat.games_played, stat.total_time_played, stat.highest_streak, 
         stat.current_streak, stat.rating]
      );
      console.log(`   ✓ User ${stat.user_id}: ${stat.wins}W-${stat.losses}L`);
    }

    // Insert game history
    console.log("🎮 Inserting game history...");
    for (const game of games) {
      await pool.query(
        `INSERT INTO game_history (id, game_mode, player1_id, player2_id, player3_id, 
         winner_id, result, moves_count, duration, board_state, played_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [game.id, game.game_mode, game.player1_id, game.player2_id, game.player3_id,
         game.winner_id, game.result, game.moves_count, game.duration, 
         game.board_state, game.played_at]
      );
      console.log(`   ✓ Game ${game.id}: ${game.game_mode}`);
    }

    console.log("");
    console.log("=" .repeat(50));
    console.log("✅ Import completed successfully!");
    console.log("");

    // Show summary
    const summary = await pool.query(`
      SELECT u.username, gs.wins, gs.losses, gs.games_played, gs.rating
      FROM users u
      JOIN game_stats gs ON u.id = gs.user_id
      ORDER BY gs.rating DESC
    `);

    console.log("📈 Summary:");
    console.table(summary.rows);

    console.log("");
    console.log("🎮 Test accounts (password: 'password123'):");
    users.forEach(u => {
      console.log(`   - ${u.email}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run
importCSV();

