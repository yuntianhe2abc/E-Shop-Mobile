const express = require("express");
const router = express.Router();
const { Product } = require("../model/product.model");
const { Category } = require("../model/category.model");
const mongoose = require("mongoose");
router.get("/", async (req, res) => {
  // const productList = await Product.find().select("name image");
  const productList = await Product.find();

  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.send(productList);
});

router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");
  if (!product) {
    res
      .status(500)
      .json({ message: `the product with id ${req.params.id} is not found` });
  }
  res.status(200).send(product);
});

router.post("/", async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send("Invalid Category");
  }
  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: req.body.image,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });
  await product.save();
  if (!product) {
    res.status(500).json({ message: "The product Can not be created" });
  }
  res.status(201).json(product);
});

router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send("Invalid Product Id");
  }
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true }
  );
  if (!product) {
    return res.status(400).send("The product can not be updated!");
  }
  return res.send(product);
});

router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (product) {
      return res.status(200).json({
        success: true,
        message: "the product is deleted",
      });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "product not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err, success: false });
  }
});
module.exports = router;
