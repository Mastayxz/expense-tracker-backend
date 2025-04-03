const Wallet = require("../models/Wallet");

exports.createWallet = async (req, res) => {
  try {
    const { name, balance } = req.body;
    const userId = req.user.id;

    const newWallet = new Wallet({ name, balance, userId });
    await newWallet.save();

    res.status(201).json(newWallet);
  } catch (error) {
    console.error("Create Wallet Error: ", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.getWallets = async (req, res) => {
  try {
    const wallets = await Wallet.find({ userId: req.user.id });
    res.json(wallets);
  } catch (error) {
    console.log("Get Wallets Error: ", error);
    res.status(500).json({ msg: "server error" });
  }
};

exports.updateWallet = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, balance } = req.body;
    const wallet = await Wallet.findOneAndUpdate(
      {
        _id: id,
        userId: req.user.id,
      },
      { name, balance },
      { new: true }
    );
    if (!wallet) {
      return res.status(404).json({ msg: "Wallet Not Found!" });
    }
    res.status(200).json(wallet);
  } catch (error) {
    console.log("Update wallet Error", error);
    res.status(500).json({ msg: "server error" });
  }
};

exports.deleteWallet = async (req, res) => {
  try {
    const { id } = req.params;
    const wallet = await Wallet.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!wallet) {
      return res.status(404).json({ msg: "Wallet Not Found!" });
    }
    res.status(200).json({ msg: "wallet deleted succesfully" });
  } catch (error) {
    console.error("Delete wallet Error: ", error);
    res.status(500).json({ msg: "server error" });
  }
};

