const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const mongoose = require("mongoose");

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Filter parameters
    const walletId = req.query.walletId; // Optional wallet filter
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : new Date(new Date().setDate(1)); // Default to first day of current month
    const endDate = req.query.endDate
      ? new Date(req.query.endDate)
      : new Date(new Date().setMonth(new Date().getMonth() + 1, 0)); // Default to last day of current month

    // Set endDate to end of day
    endDate.setHours(23, 59, 59, 999);

    // Base match condition for all queries
    const baseMatch = {
      userId: new mongoose.Types.ObjectId(userId),
      time: { $gte: startDate, $lte: endDate },
    };

    // Add wallet filter if provided
    if (walletId) {
      baseMatch.walletId = new mongoose.Types.ObjectId(walletId);
    }

    // Get wallet data
    let walletData;
    if (walletId) {
      walletData = await Wallet.findById(walletId);
    } else {
      walletData = await Wallet.find({ userId });
    }

    // Get total transactions count
    const totalTransactions = await Transaction.countDocuments(baseMatch);

    // Calculate total income
    const totalIncome = await Transaction.aggregate([
      {
        $match: { ...baseMatch, type: "income" },
      },
      {
        $group: { _id: null, total: { $sum: "$amount" } },
      },
    ]);
    const totalIncomeValue = totalIncome.length > 0 ? totalIncome[0].total : 0;

    // Calculate total expense
    const totalExpense = await Transaction.aggregate([
      {
        $match: { ...baseMatch, type: "expense" },
      },
      {
        $group: { _id: null, total: { $sum: "$amount" } },
      },
    ]);
    const totalExpenseValue =
      totalExpense.length > 0 ? totalExpense[0].total : 0;

    // Get recent transactions
    const recentTransactions = await Transaction.find(baseMatch)
      .sort({ time: -1 })
      .limit(5)
      .populate("categoryId", "name")
      .populate("walletId", "name balance");

    // Get expense breakdown by category
    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: { ...baseMatch, type: "expense" },
      },
      {
        $group: {
          _id: "$categoryId",
          total: { $sum: "$amount" },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $project: {
          categoryName: "$category.name",
          total: 1,
        },
      },
    ]);
    const categoryBreakdownValue =
      categoryBreakdown.length > 0 ? categoryBreakdown : [];

    // Get daily transactions for chart
    // Calculate number of days to show based on date range
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Limit chart data points to keep visualization clean
    const chartInterval =
      diffDays > 31 ? "month" : diffDays > 7 ? "week" : "day";

    let dateFormat;
    let dateGrouping;

    if (chartInterval === "month") {
      dateFormat = "%Y-%m";
      dateGrouping = { year: { $year: "$time" }, month: { $month: "$time" } };
    } else if (chartInterval === "week") {
      dateFormat = "%Y-%U"; // Week number format
      dateGrouping = {
        year: { $year: "$time" },
        week: { $week: "$time" },
      };
    } else {
      dateFormat = "%Y-%m-%d";
      dateGrouping = {
        year: { $year: "$time" },
        month: { $month: "$time" },
        day: { $dayOfMonth: "$time" },
      };
    }

    const timeSeriesData = await Transaction.aggregate([
      {
        $match: baseMatch,
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: dateFormat, date: "$time" } },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          data: {
            $push: {
              type: "$_id.type",
              amount: "$total",
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format time series data for chart
    const chartData = timeSeriesData.map((item) => {
      const incomeData = item.data.find((d) => d.type === "income");
      const expenseData = item.data.find((d) => d.type === "expense");

      return {
        date: item._id,
        income: incomeData ? incomeData.amount : 0,
        expense: expenseData ? expenseData.amount : 0,
        balance:
          (incomeData ? incomeData.amount : 0) -
          (expenseData ? expenseData.amount : 0),
      };
    });

    // Calculate total balance
    const totalBalance = walletId
      ? walletData.balance
      : walletData.reduce((sum, wallet) => sum + wallet.balance, 0);

    // Send response
    res.json({
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      totalBalance,
      totalTransactions,
      totalIncome: totalIncomeValue,
      totalExpense: totalExpenseValue,
      recentTransactions,
      categoryBreakdown: categoryBreakdownValue,
      chartData,
      wallets: walletId ? [walletData] : walletData,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
