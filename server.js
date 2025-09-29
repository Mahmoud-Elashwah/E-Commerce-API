const mongoose = require("mongoose");
const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("uncaughtException shutting down💥💥💥💥");
  process.exit(1);
});

const app = require("./app");
dotenv.config({ path: "./config.env" });

mongoose.connect(process.env.DBCONNECTION).then(() => {
  console.log("welcome to DB");
});

const port = 3000;
const server = app.listen(port, () => {
  console.log(`welcome to port:${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("Unhandled Rejection shutting down💥💥💥💥");
  server.close(() => {
    process.exit(1);
  });
});
