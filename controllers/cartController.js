const Cart = require("./../modules/cartModule");
const Product = require("./../modules/productsModule");

exports.addCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    const parsedQuantity = parseInt(quantity) || 1;
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({
        status: "fail",
        message: "Quantity must be a valid positive number",
      });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: "This Product not found",
      });
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
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

exports.deleteFormCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        status: "fail",
        message: "Cart not found",
      });
    }
    const product = cart.products.findIndex(
      (el) => el.product.toString() === req.params.productId
    );
    if (product === -1) {
      return res.status(404).json({
        status: "fail",
      });
    }
    cart.products.splice(product, 1);
    await cart.save();

    res.status(204).json();
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "products.product"
    );
    if (!cart) {
      return res.status(404).json({
        status: "fail",
        message: "Cart not found",
      });
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
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};
