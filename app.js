const express = require("express");
const app = express();
const userRoute = require("./routes/userRoute");
const productsRoute = require("./routes/productsRoute");
const cartRouter = require("./routes/cartRoute");
const checkoutRoute = require("./routes/checkoutRoute");

app.use(express.json({ limit: "10kb" }));
app.use("/api/auth/", userRoute);
app.use("/api/products/", productsRoute);
app.use("/api/cart/", cartRouter);
app.use("/api/checkout/", checkoutRoute);

module.exports = app;
