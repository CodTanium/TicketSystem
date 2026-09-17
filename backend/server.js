const express = require("express");
const cors = require("cors");

const ticketRoutes = require("./routes/ticketRoutes");

const app = express();

const PORT = 3000;


// CORS
app.use(cors({
    origin:
        "https://ticketsystem-1frontend.onrender.com"
}));



// JSON
app.use(express.json());


// Routes
app.use("/api/tickets", ticketRoutes);


app.listen(PORT,"0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
});