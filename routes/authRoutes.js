const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

router.get("/me", authMiddleware, getMe);
router.post("/register", register);
router.post("/login", login);

module.exports = router;
