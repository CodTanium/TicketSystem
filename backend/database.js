const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./tickets.db", (err) => {
    if (err) {
        console.error("Database error:", err.message);
    } else {
        console.log("Connected to SQLite database");
    }
});

db.run(`
    CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE,
        used INTEGER NOT NULL DEFAULT 0
    )
`);

module.exports = db;