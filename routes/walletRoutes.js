const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createWallet,
  getWallets,
  updateWallet,
  deleteWallet,
} = require("../controllers/walletController");

router.post("/", auth, createWallet);
router.get("/", auth, getWallets);
router.put("/:id", auth, updateWallet);
router.delete("/:id", auth, deleteWallet);

module.exports = router;  
