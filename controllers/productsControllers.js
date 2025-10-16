const Products = require("./../models/productsModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.getAllProducts = catchAsync(async (req, res, next) => {
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
});

exports.addProducts = catchAsync(async (req, res, next) => {
  const newProducts = await Products.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      product: newProducts,
    },
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Products.findById(req.params.id);
  if (!product) {
    return next(new AppError("This Product not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const deletedProduct = await Products.findByIdAndDelete(req.params.id);
  if (!deletedProduct) {
    return next(new AppError("This Product not found", 404));
  }
  res.status(204).json();
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const theProduct = await Products.findById(req.params.id);
  if (!theProduct) {
    return next(new AppError("This Product not found", 404));
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
});
