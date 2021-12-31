const Mongoose = require("mongoose");
const checkAuth = require("../helpers/auth");
const Product = require("../models/product");

const addProduct = async (req, res) => {
  try {
    const sku = req.body.sku;
    const name = req.body.name;
    const description = req.body.description;
    const quantity = req.body.quantity;
    const price = req.body.price;
    const image = req.body.image;

    if (!sku) {
      return res.status(400).json({ error: "You must enter sku." });
    }

    if (!description || !name) {
      return res
        .status(400)
        .json({ error: "You must enter description & name." });
    }

    if (!quantity) {
      return res.status(400).json({ error: "You must enter a quantity." });
    }

    if (!price) {
      return res.status(400).json({ error: "You must enter a price." });
    }

    const foundProduct = await Product.findOne({ sku });

    if (foundProduct) {
      return res.status(400).json({ error: "This sku is already in use." });
    }

    const product = new Product({
      sku,
      name,
      description,
      quantity,
      price,
      image,
    });

    const savedProduct = await product.save();

    res.status(200).json({
      success: true,
      message: `Product has been added successfully!`,
      product: savedProduct,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      error: "Your request could not be processed. Please try again.",
    });
  }
};

const editProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const update = req.body.product;
    const query = { _id: productId };

    await Product.findOneAndUpdate(query, update, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Product has been updated successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: "Your request could not be processed. Please try again.",
    });
  }
};

const getListProduct = async (req, res) => {
  try {
    let { sortOrder, max, min, pageNumber: page = 1 } = req.body;

    const pageSize = 8;
    const priceFilter = min && max ? { price: { $gte: min, $lte: max } } : {};

    const basicQuery = [
      {
        $match: {
          price: priceFilter.price,
        },
      },
    ];
    let products = null;
    let productsCount = 0;
    productsCount = await Product.aggregate(basicQuery);
    const paginateQuery = [
      { $sort: sortOrder },
      { $skip: pageSize * (productsCount.length > 8 ? page - 1 : 0) },
      { $limit: pageSize },
    ];

    products = await Product.aggregate(basicQuery.concat(paginateQuery));
    res.status(200).json({
      products,
      page,
      pages:
        productsCount.length > 0
          ? Math.ceil(productsCount.length / pageSize)
          : 0,
      totalProducts: productsCount.length,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: "Your request could not be processed. Please try again.",
    });
  }
};

const getItem = async (req, res) => {
  try {
    const slug = req.params.slug;

    const productDoc = await Product.findOne({ slug, isActive: true });

    if (!productDoc || (productDoc && productDoc?.brand?.isActive === false)) {
      return res.status(404).json({
        message: "No product found.",
      });
    }

    res.status(200).json({
      product: productDoc,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: "Your request could not be processed. Please try again.",
    });
  }
};

const searchProduct = async (req, res) => {
  try {
    const name = req.params.name;

    const productDoc = await Product.find(
      { name: { $regex: new RegExp(name), $options: "is" }, isActive: true },
      { name: 1, slug: 1, imageUrl: 1, price: 1, _id: 0 }
    );

    if (productDoc.length < 0) {
      return res.status(404).json({
        message: "No product found.",
      });
    }

    res.status(200).json({
      products: productDoc,
    });
  } catch (error) {
    res.status(400).json({
      error: "Your request could not be processed. Please try again.",
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: `Product has been deleted successfully!`,
      product,
    });
  } catch (error) {
    res.status(400).json({
      error: "Your request could not be processed. Please try again.",
    });
  }
};
module.exports = {
  addProduct,
  editProduct,
  getListProduct,
  getItem,
  searchProduct,
  deleteProduct,
};
