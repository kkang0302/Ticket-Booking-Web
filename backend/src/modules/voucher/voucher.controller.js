const voucherService = require("./voucher.service");

async function createVoucher(req, res, next) {
  try {
    const data = req.body;
    const voucher = await voucherService.createVoucher(data);
    res.status(201).json({ data: voucher });
  } catch (error) {
    next(error);
  }
}

async function listVouchers(req, res, next) {
  try {
    const vouchers = await voucherService.listVouchers();
    res.json({ data: vouchers });
  } catch (error) {
    next(error);
  }
}

async function updateVoucherStatus(req, res, next) {
  try {
    const voucherId = Number(req.params.id);
    const { status } = req.body;
    const voucher = await voucherService.updateVoucherStatus({ voucherId, status });
    res.json({ data: voucher });
  } catch (error) {
    next(error);
  }
}

async function getVoucherById(req, res, next) {
  try {
    const voucherId = Number(req.params.id);
    const voucher = await voucherService.getVoucherById(voucherId);
    res.json({ data: voucher });
  } catch (error) {
    next(error);
  }
}

async function validateVoucher(req, res, next) {
  try {
    const code = req.params.code;
    const voucher = await voucherService.getVoucherByCode(code);
    
    // validate it's active and not expired
    const now = new Date();
    if (voucher.status !== 'ACTIVE' || voucher.expiredAt <= now || voucher.usedCount >= voucher.usageLimit) {
      return res.status(400).json({ error: { message: "Voucher is invalid, expired, or fully used." } });
    }
    
    res.json({ data: voucher });
  } catch (error) {
    next(error);
  }
}

async function deleteVoucher(req, res, next) {
  try {
    const voucherId = Number(req.params.id);
    await voucherService.deleteVoucher(voucherId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createVoucher,
  listVouchers,
  updateVoucherStatus,
  getVoucherById,
  validateVoucher,
  deleteVoucher,
};
