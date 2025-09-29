const Products = require("./../models/productsModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.getAllProducts = async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];

    excludeFields.forEach((el) => delete queryObj[el]);
    let query = Products.find(queryObj);

    if (req.query.sort) {
      const sortU = req.query.sort.split(",").join(" ");
      query = query.sort(sortU);
    } else {
      query.sort("-createdAt");
    }

    if (req.query.fields) {
      const seletU = req.query.fields.split(",").join(" ");
      query = query.select(seletU);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    const products = await query;

    res.status(200).json({
      status: "success",
      results: products.length,
      data: {
        products,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

exports.addProducts = async (req, res) => {
  try {
    const newProducts = await Products.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        product: newProducts,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Products.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: "This Product not found",
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        product,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Products.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({
        status: "fail",
        message: "This Product not found",
      });
    }
    res.status(204).json();
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const theProduct = await Products.findById(req.params.id);
    if (!theProduct) {
      return res.status(404).json({
        status: "fail",
        message: "This Product not found",
      });
    }
    const price =
      req.body.price !== undefined ? req.body.price : theProduct.price;
    const discount =
      req.body.discount !== undefined ? req.body.discount : theProduct.discount;

    const finalPrice = price - (price * discount) / 100;

    const product = await Products.findByIdAndUpdate(
      req.params.id,
      { ...req.body, finalPrice },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      data: {
        product,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};
