const express = require("express");
const authController = require("./auth.controller");
const { authMiddleware, adminMiddleware } = require("./auth.middleware");

const router = express.Router();

router.post("/register", authController.register);
router.post("/register-admin", authMiddleware, adminMiddleware, authController.registerAdmin);
router.post("/login", authController.login);

module.exports = router;
