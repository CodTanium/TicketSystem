const sqlite3 = require("sqlite3").verbose();

// DB_PATH lets tests use an in-memory database (":memory:") and a host use a persistent disk.
const DB_PATH = process.env.DB_PATH || "./tickets.db";

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error("Database error:", err.message);
    } else if (process.env.NODE_ENV !== "test") {
        console.log(`Connected to SQLite database (${DB_PATH})`);
    }
});

// serialize() makes sure the table exists before the first query runs.
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT NOT NULL UNIQUE,
            used INTEGER NOT NULL DEFAULT 0
        )
    `);
});

module.exports = db;
