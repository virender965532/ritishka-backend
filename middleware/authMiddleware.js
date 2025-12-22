const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const authHeader = req.header("Authorization") || req.header("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });

  const token = authHeader.split(" ")[1];
  try {
    const secret = process.env.JWT_SECRET || "RITISHKA";
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const role = (req.user.role || "").toString().toUpperCase();
  if (!["ADMIN", "SUPERADMIN"].includes(role)) return res.status(403).json({ error: "Access Denied" });
  next();
};

module.exports = { protect, isAdmin };
