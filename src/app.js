const express = require("express");

const app = express();

const identifyRoutes = require("./routes/identifyRoutes");

app.use(express.json());

app.use("/", identifyRoutes);

app.get("/", (req, res) => {
    res.send("Server running successfully");
});




module.exports = app;