const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    unique: true,
    required: [true, "Cart should have user"],
  },
  products: [
    {
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "Products",
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
        min: 1,
      },
    },
  ],
});

module.exports = mongoose.model("Cart", cartSchema);
