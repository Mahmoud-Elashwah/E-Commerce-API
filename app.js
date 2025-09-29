const express = require("express");
const app = express();
const globalErrorHandler = require("./controllers/globalErrorHandler");
const AppError = require("./utils/AppError");
const userRoute = require("./routes/userRoute");
const productsRoute = require("./routes/productsRoute");
const cartRouter = require("./routes/cartRoute");
const checkoutRoute = require("./routes/checkoutRoute");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

app.use(helmet());
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api", limiter);

app.use(mongoSanitize());
app.use(xss());
app.use(cors());

app.use(express.json({ limit: "10kb" }));
app.use("/api/auth/", userRoute);
app.use("/api/products/", productsRoute);
app.use("/api/cart/", cartRouter);
app.use("/api/checkout/", checkoutRoute);

app.all("*", (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`));
});
app.use(globalErrorHandler);

module.exports = app;
