const express = require("express");
const router = express.Router();
const { Product } = require("../model/product.model");
const { Category } = require("../model/category.model");
const mongoose = require("mongoose");

const multer = require("multer");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "png",
  "image/jpg": "jpg",
};
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid image type");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.replace(" ", "-").replace(".", "");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});
const uploadOptions = multer({ storage: storage });
router.get("/", async (req, res) => {
  // const productList = await Product.find().select("name image");
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }
  const productList = await Product.find(filter);

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

router.post("/", uploadOptions.single("image"), async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send("Invalid Category");
  }
  const file = req.file;
  if (!file) {
    return res.status(400).send("No image in the request");
  }
  const fileName = file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`,
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
router.put("/:id", uploadOptions.single("image"), async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send("Invalid Category");
  }
  const product = await Product.findById(req.body.id);

  const file = req.file;
  let imagePath;
  if (file) {
    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    imagePath = `${basePath}${fileName}`;
  } else {
    imagePath = product.image;
  }

  const updatedProduct = await Product.findByIdAndUpdate(req.params.id, {
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: imagePath,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });
  await updatedProduct.save();

  res.status(201).json(updatedProduct);
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
router.put(
  "/gallery/:id",
  uploadOptions.array("images", 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("Invalid Product Id");
    }
    const files = req.files;
    let imagePaths = [];
    if (files) {
      files.map((file) => {
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
        const imagePath = `${basePath}${fileName}`;
        imagePaths.push(imagePath);
      });
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagePaths,
      },
      { new: true }
    );
    console.log(product);
    if (!product) {
      return res.status(500).send("the product cannot be updated");
    }
    res.send(product);
  }
);

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

router.get("/get/count", async (req, res) => {
  const productCount = await Product.countDocuments();
  if (!productCount) {
    res.status(500).json({ success: false });
  }
  res.status(200).send({ count: productCount });
});
router.get("/get/featured", async (req, res) => {
  const featuredProducts = await Product.find({
    isFeatured: true,
  });
  console.log(featuredProducts);
  if (!featuredProducts) {
    res.status(500).json({ success: false });
  }
  res.status(200).send({ featuredProducts: featuredProducts });
});

router.get("/get/featured/:count", async (req, res) => {
  const count = req.params.count ? req.params.count : 0;

  const featuredProducts = await Product.find({
    isFeatured: true,
  }).limit(+count);
  console.log(featuredProducts);
  if (!featuredProducts) {
    res.status(500).json({ success: false });
  }
  res.status(200).send({ featuredProducts: featuredProducts });
});

module.exports = router;
