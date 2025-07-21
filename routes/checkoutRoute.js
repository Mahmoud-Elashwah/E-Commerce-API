const express = require("express");
const router = express.Router();
const checkoutController = require("../controllers/checkoutController");
const authController = require("../controllers/authController");

router.post("/", authController.protect, checkoutController.checkout);
router.post("/webhook", checkoutController.handleWebhook);

module.exports = router;
