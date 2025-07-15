const express = require("express");
const app = express();
const userRoute = require("./routes/userRoute");

app.use(express.json({ limit: "10kb" }));
app.use("/api/auth/", userRoute);

module.exports = app;
