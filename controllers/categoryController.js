const Category = require("../models/Category");

exports.createCategory = async (req, res) => {
  try {
    const { name, type } = req.body;

    // kalau kategori dengan nama sama yang sudah ada
    const existingCategory = await Category.findOne({
      name,
      userId: req.user.id,
    });
    if (existingCategory) {
      return res.status(400).json({ msg: "Category already exists" });
    }
    const category = await Category.create({
      name,
      type,
      userId: req.user.id,
    });
    res.status(200).json(category);
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.user.id }).sort({
      name: 1,
    });
    if (categories.length === 0) {
      return res
        .status(200)
        .json({ msg: "No categories found", categories: [] });
    }
    res.status(200).json(categories);
  } catch (error) {
    console.error("get categories error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;
    const category = await Category.findOneAndUpdate(
      {
        _id: id,
        userId: req.user.id,
      },
      { name, type },
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ msg: "Catgeory Not Found!" });
    }
    res.status(200).json(category);
  } catch (error) {
    console.log("Update wallet Error", error);
    res.status(500).json({ msg: "server error" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });
    if (!category) {
      return res.status(404).json({ msg: "Catgeory Not Found!" });
    }
    res.status(200).json({ msg: "wallet deleted succesfully" });
  } catch (error) {
    console.log("Update wallet Error", error);
    res.status(500).json({ msg: "server error" });
  }
};
