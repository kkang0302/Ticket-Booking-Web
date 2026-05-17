const jwt = require("jsonwebtoken");
const prisma = require("../../common/prismaClient");

const JWT_SECRET = process.env.JWT_SECRET || "replace-with-secure-secret";

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: { message: "Authorization header missing." } });
  }

  const token = authHeader.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return res.status(401).json({ error: { message: "Invalid token." } });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: { message: "Invalid or expired token." } });
  }
}

function adminMiddleware(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: { message: "Unauthorized." } });
  }

  if (req.user.role !== "ADMIN" && req.user.role !== "OPERATOR") {
    return res.status(403).json({ error: { message: "Admin access required." } });
  }

  next();
}

module.exports = {
  authMiddleware,
  adminMiddleware,
};
