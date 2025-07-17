const express = require("express");
const router = express.Router();
const authController = require("./../controllers/authController");
const cartController = require("./../controllers/cartController");

router
  .route("/")
  .post(authController.protect, cartController.addCart)
  .get(authController.protect, cartController.getCart);

router.delete(
  "/:productId",
  authController.protect,
  cartController.deleteFormCart
);

module.exports = router;
