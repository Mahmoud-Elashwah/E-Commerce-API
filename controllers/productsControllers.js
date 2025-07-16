const Products = require("./../modules/productsModule");

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
    const limit = parseInt(req.query.limit) || 1;
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
