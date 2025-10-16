const Cart = require("./../models/cartModel");
const paymob = require("./../utils/paymob");
const User = require("./../models/userModel");
const Order = require("./../models/orderModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.checkout = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const cart = await Cart.findOne({ user: userId }).populate(
    "products.product"
  );
  if (!cart || cart.products.length === 0) {
    return next(new AppError("Cart is empty", 400));
  }

  const items = cart.products.map((p) => ({
    name: p.product.name,
    amount_cents: Math.round(p.product.finalPrice * 100) || 0,

    description: p.product.description,
    quantity: p.quantity,
  }));

  const totalAmount = cart.products.reduce(
    (acc, p) => acc + p.product.finalPrice * p.quantity,
    0
  );

  const user = await User.findById(userId);
  const billingData = {
    email: user.email,
    name: user.name,
  };

  const token = await paymob.getPaymobToken();
  const payombOrder = await paymob.createPaymobOrder(token, items, totalAmount);
  const paymentKey = await paymob.getPaymentKey(
    token,
    payombOrder.id,
    totalAmount,
    billingData
  );

  const newOrder = await Order.create({
    user: userId,
    products: cart.products.map((p) => ({
      product: p.product._id,
      quantity: p.quantity,
    })),
    totalAmount,
    status: "pending",
    paymobOrderId: payombOrder.id,
  });

  const iframeId = process.env.PAYMOB_IFRAME_ID;
  const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`;

  res.status(200).json({
    status: "success",
    paymentUrl,
    data: {
      order: newOrder,
    },
  });
});

exports.handleWebhook = catchAsync(async (req, res, next) => {
  const { type, obj } = req.body;

  if (type !== "TRANSACTION") {
    return next(new AppError("Not a transaction event.", 400));
  }

  const paymobOrderId = obj.order?.id?.toString();
  if (!paymobOrderId) {
    return next(new AppError("Missing order id", 400));
  }
  const order = await Order.findOne({ paymobOrderId });
  if (!order) {
    return next(new AppError("Order not found", 400));
  }
  order.status = obj.success ? "paid" : "failed";
  await order.save();

  res.status(200).json({
    status: "success",
    message: "Order status update",
  });
});

exports.checkoutStripe = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const cart = await Cart.findOne({ user: userId }).populate(
    "products.product"
  );
  if (!cart || cart.products.length === 0) {
    return next(new AppError("Cart is empty", 400));
  }
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    success_url: `${req.protocol}://api/products/`,
    cancel_url: `${req.protocol}://${req.get("host")}/cancel`,
    customer_email: req.user.email,
    client_reference_id: cart._id.toString(),
    line_items: cart.products.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.product.name,
        },
        unit_amount: Math.round(item.product.finalPrice * 100),
      },
      quantity: item.quantity,
    })),
  });

  res.status(200).json({
    status: "success",
    session,
  });
});
