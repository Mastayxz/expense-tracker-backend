const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");

exports.createTransaction = async (req, res) => {
  try {
    const { name, amount, type, walletId, categoryId, time } = req.body;
    const userId = req.user.id; // Ambil user dari token (pastikan middleware auth sudah dipasang)

    // cek wallet
    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      return res.status(404).json({ msg: "wallet not found" });
    }

    // validasi tipe transaksi
    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({ msg: "Invalid transacrion type " });
    }

    // cek saldo jika expense
    if (type === "expese" && wallet.balance < amount) {
      return res.status(400).json({ msg: "Insufficient funds" });
    }

    const transaction = new Transaction({
      name,
      amount,
      type,
      walletId,
      categoryId,
      userId,
      time,
    });

    await transaction.save();

    // update saldo wallet
    if (type === "income") {
      wallet.balance += amount;
    } else {
      wallet.balance -= amount;
    }
    await wallet.save();
    res.status(201).json({ msg: "Transaction created", transaction });
  } catch (error) {
    console.error("Create Transaction Error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id })
      .populate("walletId", "name balance")
      .populate("categoryId", "name")
      .sort({ time: -1 });

    res.status(200).json(transactions);
  } catch (err) {
    console.error("Get Transactions Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id,
    })
      .populate("walletId", "name balance")
      .populate("categoryId", "name");

    if (!transaction) {
      return res.status(404).json({ msg: "Transaction not found" });
    }

    res.status(200).json(transaction);
  } catch (err) {
    console.error("Get Transaction by ID Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getTransactionsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const userId = req.user.id;

    const transactions = await Transaction.find({
      categoryId,
      userId,
    }).populate("walletId categoryId");

    if (transactions.length === 0) {
      return res
        .status(404)
        .json({ msg: "No transactions found for this category" });
    }

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const { name, amount, type, walletId, categoryId, time } = req.body;
    const userId = req.user.id;

    // Cari transaksi berdasarkan ID dan pastikan itu milik user yang sedang login
    let transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: userId,
    });

    if (!transaction) {
      return res.status(404).json({ msg: "Transaction not found" });
    }

    // Cek jika wallet ada dan tipe transaksi valid
    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      return res.status(404).json({ msg: "Wallet not found" });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({ msg: "Invalid transaction type" });
    }

    // Koreksi saldo wallet berdasarkan transaksi lama
    if (transaction.type === "income") {
      wallet.balance -= transaction.amount; // Kurangi saldo lama
    } else {
      wallet.balance += transaction.amount; // Tambah saldo lama
    }

    // Update transaksi
    transaction.name = name || transaction.name;
    transaction.amount = amount || transaction.amount;
    transaction.type = type || transaction.type;
    transaction.walletId = walletId || transaction.walletId;
    transaction.categoryId = categoryId || transaction.categoryId;
    transaction.time = time || transaction.time;

    // Update saldo wallet sesuai transaksi baru
    if (type === "income") {
      wallet.balance += amount; // Tambah saldo wallet
    } else {
      wallet.balance -= amount; // Kurangi saldo wallet
    }

    // Simpan transaksi dan saldo wallet yang telah diperbarui
    await wallet.save();
    await transaction.save();

    res.status(200).json({ msg: "Transaction updated", transaction });
  } catch (error) {
    console.error("Update Transaction Error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id;

    // Cari transaksi berdasarkan ID dan pastikan transaksi milik user yang login
    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ msg: "Transaction not found" });
    }

    // Cari wallet yang terkait dengan transaksi
    const wallet = await Wallet.findById(transaction.walletId);
    if (!wallet) {
      return res.status(404).json({ msg: "Wallet not found" });
    }

    // Update saldo wallet tergantung pada tipe transaksi
    if (transaction.type === "income") {
      wallet.balance -= transaction.amount; // Jika income, kurangi saldo
    } else if (transaction.type === "expense") {
      wallet.balance += transaction.amount; // Jika expense, tambah saldo
    }

    // Simpan perubahan saldo wallet
    await wallet.save();

    // Hapus transaksi dari database
    await Transaction.deleteOne({ _id: transactionId });

    res
      .status(200)
      .json({ msg: "Transaction deleted and wallet balance updated" });
  } catch (err) {
    console.error("Delete Transaction Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
