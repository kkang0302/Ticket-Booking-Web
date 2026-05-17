const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../../common/prismaClient");

const JWT_SECRET = process.env.JWT_SECRET || "replace-with-secure-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const SALT_ROUNDS = 10;

function createToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    }
  );
}

async function registerUser({ email, password, fullName, role = "CUSTOMER" }) {
  if (!email || !password || !fullName) {
    const error = new Error("Email, password, and fullName are required.");
    error.status = 400;
    throw error;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const error = new Error("Email is already registered.");
    error.status = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      fullName,
      role,
    },
  });

  return user;
}

async function registerAdmin({ email, password, fullName }) {
  return registerUser({ email, password, fullName, role: "ADMIN" });
}

async function loginUser({ email, password }) {
  if (!email || !password) {
    const error = new Error("Email and password are required.");
    error.status = 400;
    throw error;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const error = new Error("Invalid email or password.");
    error.status = 401;
    throw error;
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    const error = new Error("Invalid email or password.");
    error.status = 401;
    throw error;
  }

  const token = createToken(user);
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
  };
}

module.exports = {
  registerUser,
  registerAdmin,
  loginUser,
  createToken,
};
