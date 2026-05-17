const express = require("express");
const voucherController = require("./voucher.controller");
const { authMiddleware } = require("../auth/auth.middleware");

const router = express.Router();

router.get("/validate/:code", authMiddleware, voucherController.validateVoucher);

module.exports = router;
