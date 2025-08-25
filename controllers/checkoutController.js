const Cart = require("./../models/cartModel");
const paymob = require("./../utils/paymob");
const User = require("./../models/userModel");
const Order = require("./../models/orderModel");

exports.checkout = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId }).populate(
      "products.product"
    );
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
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
    const payombOrder = await paymob.createPaymobOrder(
      token,
      items,
      totalAmount
    );
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
    console.log("Paymob Order ID Created:", payombOrder.id);

    const iframeId = process.env.PAYMOB_IFRAME_ID;
    const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`;

    res.status(200).json({
      status: "success",
      paymentUrl,
      data: {
        order: newOrder,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.handleWebhook = async (req, res) => {
  try {
    const { type, obj } = req.body;

    if (type !== "TRANSACTION") {
      return res.status(400).json({
        status: "fail",
        message: "Not a transaction event.",
      });
    }

    const paymobOrderId = obj.order?.id?.toString();
    if (!paymobOrderId) {
      return res.status(400).json({
        status: "fail",
        message: "Missing order id",
      });
    }
    console.log("Received Paymob Order ID:", req.body.obj.order.id);
    const order = await Order.findOne({ paymobOrderId });
    if (!order) {
      return res.status(400).json({
        status: "fail",
        message: "Order not found",
      });
    }
    order.status = obj.success ? "paid" : "failed";
    await order.save();

    res.status(200).json({
      status: "success",
      message: "Order status update",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};
