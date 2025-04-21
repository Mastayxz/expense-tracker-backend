const express = require("express");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const walletRoutes = require("./routes/walletRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const connectDB = require("./config/db"); // Mengimpor koneksi DB
const cors = require("cors"); // ⬅️ Tambahkan ini

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// connect to MongoDB using connectDB
connectDB(); // Memanggil koneksi database dari config

// use routes
app.use("/api/auth", authRoutes);
app.use("/api/wallets", walletRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/dashboard", dashboardRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
