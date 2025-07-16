const express = require("express");
const router = express.Router();
const authController = require("./../controllers/authController");
const productsController = require("./../controllers/productsControllers");

router
  .route("/")
  .get(productsController.getAllProducts)
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    productsController.addProducts
  );

module.exports = router;
