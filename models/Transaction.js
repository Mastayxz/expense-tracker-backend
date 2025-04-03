const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  type: {
    type: String,
    enum: ["income", "expense"],
    required: true,
  },

  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    required: true,
  },

  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category", // kalau kamu mau pake kategori
  },
  time: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Transaction", transactionSchema);
