// server/middleware/security.js
// Authentication and IP extraction

const jwt = require("jsonwebtoken");

// ✅ Extract client IP (handles proxies)
function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.connection.remoteAddress || "unknown";
}

// ✅ Optional or required authentication
function authenticate(options = {}) {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      if (options.required) {
        return res.status(401).json({ error: "Missing authentication token" });
      }
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      if (options.required) {
        return res.status(401).json({ error: "Invalid token" });
      }
      req.user = null;
      next();
    }
  };
}

// ✅ Create JWT token
function createToken(payload, expiresIn = "6h") {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

module.exports = {
  getClientIp,
  authenticate,
  createToken,
};
