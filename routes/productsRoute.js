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

router
  .route("/:id")
  .get(authController.protect, productsController.getProduct)
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    productsController.updateProduct
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    productsController.deleteProduct
  );

module.exports = router;
