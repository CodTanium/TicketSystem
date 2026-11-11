const app = require("./app");

// Hosts such as Render pass the port in PORT; 3000 is the local default.
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
