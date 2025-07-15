const app = require("./app");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

mongoose
  .connect(process.env.DBCONNECTION)
  .then(() => {
    console.log("welcome to DB");
  })
  .catch((err) => {
    console.error(err);
  });

const port = 3000;
app.listen(port, () => {
  console.log(`welcome to port:${port}`);
});
