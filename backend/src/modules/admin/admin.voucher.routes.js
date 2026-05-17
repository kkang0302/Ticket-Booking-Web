const express = require("express");
const voucherController = require("../voucher/voucher.controller");
const { authMiddleware, adminMiddleware } = require("../auth/auth.middleware");

const router = express.Router();
router.use(authMiddleware, adminMiddleware);

router.post("/", voucherController.createVoucher);
router.get("/", voucherController.listVouchers);
router.get("/:id", voucherController.getVoucherById);
router.patch("/:id/status", voucherController.updateVoucherStatus);
router.delete("/:id", voucherController.deleteVoucher);

module.exports = router;
