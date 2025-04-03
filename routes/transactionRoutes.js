const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createTransaction,
  getTransactions,
  getTransactionById,
  getTransactionsByCategory,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");

router.post("/", auth, createTransaction);
router.get("/", auth, getTransactions);
router.get("/:id", auth, getTransactionById);
router.get("/category/:categoryId", auth, getTransactionsByCategory);
router.put("/:id", auth, updateTransaction); // Update transaksi
router.delete("/:id", auth, deleteTransaction); // Hapus transaksi

module.exports = router;
