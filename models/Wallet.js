const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wallet", walletSchema);
