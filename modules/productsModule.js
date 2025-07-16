const mongoose = require("mongoose");

const productsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product must have a name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product must have a description"],
    },
    price: {
      type: Number,
      required: [true, "Product must have a price"],
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    finalPrice: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: [true, "Product must have a category"],
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

productsSchema.pre("save", function (next) {
  this.finalPrice = this.price - (this.discount * this.price) / 100;
  next();
});

module.exports = mongoose.model("Products", productsSchema);
