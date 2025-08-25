const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Order should have a schema"],
    },
    porducts: [
      {
        product: { type: mongoose.Schema.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymobOrderId: {
      type: String,
    },
    paymentInfo: {
      transactionId: String,
      success: Boolean,
      message: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
