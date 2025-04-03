const express = require("express");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const walletRoutes = require("./routes/walletRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const connectDB = require("./config/db"); // Mengimpor koneksi DB

dotenv.config();

const app = express();
app.use(express.json());

// connect to MongoDB using connectDB
connectDB(); // Memanggil koneksi database dari config

// use routes
app.use("/api/auth", authRoutes);
app.use("/api/wallets", walletRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/transactions", transactionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
