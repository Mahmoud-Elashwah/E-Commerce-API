const Cart = require("./../models/cartModel");
const Product = require("./../models/productsModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.addCart = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  const parsedQuantity = parseInt(quantity) || 1;
  if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
    return next(new AppError("Quantity must be a valid positive number", 400));
  }
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError("Quantity must be a valid positive number", 400));
  }

  let cart = await Cart.findOne({ user: userId });
  let existingProduct;
  if (!cart) {
    cart = await Cart.create({
      user: userId,
      products: [{ product: productId, quantity: parsedQuantity }],
    });
    return res.status(201).json({
      status: "success",
      message: "Product added to new cart",
      data: { cart },
    });
  } else {
    existingProduct = cart.products.find((item) => {
      return item.product.toString() === productId.toString();
    });
  }

  if (existingProduct) {
    existingProduct.quantity += parsedQuantity;
  } else {
    cart.products.push({ product: productId, quantity: parsedQuantity });
  }
  await cart.save();

  res.status(201).json({
    status: "success",
    message: "Product added to cart",
    data: {
      cart,
    },
  });
});

exports.deleteFormCart = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }
  const product = cart.products.findIndex(
    (el) => el.product.toString() === req.params.productId
  );
  if (product === -1) {
    return next(new AppError("No product to delete", 404));
  }
  cart.products.splice(product, 1);
  await cart.save();

  res.status(204).json();
});

exports.getCart = catchAsync(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "products.product"
  );
  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  let totalPrice = 0;
  for (let i = 0; i < cart.products.length; i++) {
    totalPrice +=
      cart.products[i].product.finalPrice * cart.products[i].quantity;
  }
  res.status(200).json({
    status: "success",
    data: {
      cart,
      totalPrice,
      itemsCount: cart.products.length,
    },
  });
});
