const prisma = require("../../common/prismaClient");

function buildValidationError(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

async function createVoucher(data) {
  const { code, discountType, discountValue, usageLimit, expiredAt, status } = data;

  if (!code || !discountType || discountValue == null || usageLimit == null || !expiredAt || !status) {
    throw buildValidationError("code, discountType, discountValue, usageLimit, expiredAt and status are required.");
  }

  const existing = await prisma.voucher.findUnique({ where: { code } });
  if (existing) {
    const error = new Error("Voucher code already exists.");
    error.status = 409;
    throw error;
  }

  const expirationDate = new Date(expiredAt);
  if (Number.isNaN(expirationDate.getTime())) {
    throw buildValidationError("expiredAt must be a valid date.");
  }

  const voucher = await prisma.voucher.create({
    data: {
      code,
      discountType,
      discountValue: Number(discountValue),
      usageLimit: Number(usageLimit),
      expiredAt: expirationDate,
      status,
    },
  });

  return voucher;
}

async function listVouchers() {
  return prisma.voucher.findMany({ orderBy: { expiredAt: "asc" } });
}

async function updateVoucherStatus({ voucherId, status }) {
  if (!voucherId || !status) {
    const error = new Error("voucherId and status are required.");
    error.status = 400;
    throw error;
  }

  return prisma.voucher.update({
    where: { id: Number(voucherId) },
    data: { status },
  });
}

module.exports = {
  createVoucher,
  listVouchers,
  updateVoucherStatus,
};

async function getVoucherById(voucherId) {
  const voucher = await prisma.voucher.findUnique({ where: { id: Number(voucherId) } });
  if (!voucher) {
    const error = new Error("Voucher not found.");
    error.status = 404;
    throw error;
  }
  return voucher;
}

async function getVoucherByCode(code) {
  const voucher = await prisma.voucher.findUnique({ where: { code } });
  if (!voucher) {
    const error = new Error("Voucher not found.");
    error.status = 404;
    throw error;
  }
  return voucher;
}

async function deleteVoucher(voucherId) {
  return prisma.voucher.delete({
    where: { id: Number(voucherId) },
  });
}

module.exports = {
  createVoucher,
  listVouchers,
  updateVoucherStatus,
  getVoucherById,
  getVoucherByCode,
  deleteVoucher,
};
