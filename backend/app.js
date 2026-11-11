const express = require("express");
const cors = require("cors");

const ticketRoutes = require("./routes/ticketRoutes");

// Allowed browser origins, comma-separated. The default keeps the live Render frontend
// working and adds the local Vite dev server.
const allowedOrigins = (process.env.CORS_ORIGIN ||
    "https://ticketsystem-1frontend.onrender.com,http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const app = express();

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/tickets", ticketRoutes);

// Unknown routes and unexpected errors answer with JSON, like the rest of the API.
app.use((req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
