const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );
    req.user = decoded; // { id: ..., email: ... }
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = auth;
