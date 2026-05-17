const prisma = require("../../common/prismaClient");
const {
  getBookingIdByIdempotencyKey,
  cacheIdempotencyKey,
  acquireTicketLock,
  releaseTicketLock,
} = require("./bookingRedis");

const BOOKING_HOLD_MINUTES = 15;
const BOOKING_INCLUDE = {
  bookingItems: { include: { ticketCategory: true } },
  concert: true,
  voucher: true,
};

function buildValidationError(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function buildConflictError(message) {
  const error = new Error(message);
  error.status = 409;
  return error;
}

function normalizeItems(items) {
  const normalizedItems = items.reduce((acc, item) => {
    const categoryId = Number(item.ticketCategoryId);
    const quantity = Number(item.quantity);
    if (!categoryId || quantity <= 0) {
      return acc;
    }

    if (!acc[categoryId]) {
      acc[categoryId] = { ticketCategoryId: categoryId, quantity };
    } else {
      acc[categoryId].quantity += quantity;
    }
    return acc;
  }, {});

  return Object.values(normalizedItems);
}

function computeDiscount(totalAmount, voucher) {
  if (!voucher) return 0;
  if (voucher.discountType === "PERCENTAGE") {
    return Number(((totalAmount * Number(voucher.discountValue)) / 100).toFixed(2));
  }
  return Number(voucher.discountValue);
}

async function validateVoucherForBooking(tx, voucherCode, now) {
  if (!voucherCode) return { voucherId: null, voucher: null };

  const voucher = await tx.voucher.findUnique({ where: { code: voucherCode } });
  if (!voucher) {
    throw buildValidationError("Voucher code is invalid.");
  }
  if (voucher.status !== "ACTIVE") {
    throw buildValidationError("Voucher is not active.");
  }
  if (voucher.expiredAt <= now) {
    throw buildValidationError("Voucher has expired.");
  }
  if (voucher.usedCount >= voucher.usageLimit) {
    throw buildConflictError("Voucher usage limit has been reached.");
  }

  return { voucherId: voucher.id, voucher };
}

async function reserveTickets(tx, bookingItems, ticketCategoryMap) {
  for (const item of bookingItems) {
    const lockAcquired = await acquireTicketLock(item.ticketCategoryId);
    if (!lockAcquired) {
      throw buildConflictError(
        `High demand for ${ticketCategoryMap[item.ticketCategoryId].name}. Please retry.`
      );
    }

    try {
      const updated = await tx.ticketCategory.updateMany({
        where: {
          id: item.ticketCategoryId,
          remainingQuantity: { gte: item.quantity },
        },
        data: {
          remainingQuantity: { decrement: item.quantity },
        },
      });

      if (updated.count !== 1) {
        throw buildConflictError(
          `Not enough tickets for category ${ticketCategoryMap[item.ticketCategoryId].name}.`
        );
      }
    } finally {
      await releaseTicketLock(item.ticketCategoryId);
    }
  }
}

async function createBooking({ userId, data }) {
  const { concertId, items, voucherCode, idempotencyKey } = data;

  if (!idempotencyKey) {
    throw buildValidationError("idempotencyKey is required.");
  }

  if (!concertId || !Array.isArray(items) || items.length === 0) {
    throw buildValidationError("concertId and items are required.");
  }

  const bookingItems = normalizeItems(items);
  if (bookingItems.length === 0) {
    throw buildValidationError("At least one ticket item with positive quantity is required.");
  }

  const cachedBookingId = await getBookingIdByIdempotencyKey(idempotencyKey);
  if (cachedBookingId) {
    const cached = await prisma.booking.findUnique({
      where: { id: cachedBookingId },
      include: BOOKING_INCLUDE,
    });
    if (cached) return cached;
  }

  const existingBooking = await prisma.booking.findUnique({
    where: { idempotencyKey },
    include: BOOKING_INCLUDE,
  });
  if (existingBooking) {
    return existingBooking;
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + BOOKING_HOLD_MINUTES * 60 * 1000);

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const prior = await tx.booking.findUnique({
        where: { idempotencyKey },
        include: BOOKING_INCLUDE,
      });
      if (prior) {
        return prior;
      }

      const concert = await tx.concert.findUnique({
        where: { id: Number(concertId) },
      });
      if (!concert || concert.status !== "PUBLISHED") {
        throw buildValidationError("Concert is not available for booking.");
      }

      const ticketCategories = await tx.ticketCategory.findMany({
        where: {
          id: { in: bookingItems.map((item) => item.ticketCategoryId) },
          concertId: Number(concertId),
        },
      });

      if (ticketCategories.length !== bookingItems.length) {
        throw buildValidationError(
          "One or more ticket categories are invalid for the selected concert."
        );
      }

      let subtotal = 0;
      const ticketCategoryMap = ticketCategories.reduce((map, category) => {
        map[category.id] = category;
        return map;
      }, {});

      for (const item of bookingItems) {
        const category = ticketCategoryMap[item.ticketCategoryId];
        if (!category) {
          throw buildValidationError("Invalid ticket category.");
        }
        if (category.remainingQuantity < item.quantity) {
          throw buildConflictError(`Not enough tickets for category ${category.name}.`);
        }
        subtotal += Number(category.price) * item.quantity;
      }

      await reserveTickets(tx, bookingItems, ticketCategoryMap);

      const { voucherId, voucher } = await validateVoucherForBooking(tx, voucherCode, now);
      const discountAmount = computeDiscount(subtotal, voucher);
      const finalAmount = Math.max(0, subtotal - discountAmount);

      return tx.booking.create({
        data: {
          userId,
          concertId: Number(concertId),
          voucherId,
          totalAmount: finalAmount,
          status: "PENDING",
          idempotencyKey,
          expiresAt,
          bookingItems: {
            create: bookingItems.map((item) => ({
              ticketCategoryId: item.ticketCategoryId,
              quantity: item.quantity,
              unitPrice: ticketCategoryMap[item.ticketCategoryId].price,
            })),
          },
        },
        include: BOOKING_INCLUDE,
      });
    });

    await cacheIdempotencyKey(idempotencyKey, booking.id);
    return booking;
  } catch (error) {
    if (error.code === "P2002") {
      const duplicate = await prisma.booking.findUnique({
        where: { idempotencyKey },
        include: BOOKING_INCLUDE,
      });
      if (duplicate) {
        return duplicate;
      }
    }
    throw error;
  }
}

async function mockPayBooking({ bookingId, userId }) {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: Number(bookingId) },
      include: BOOKING_INCLUDE,
    });

    if (!booking) {
      const error = new Error("Booking not found.");
      error.status = 404;
      throw error;
    }

    if (booking.userId !== userId) {
      const error = new Error("Access denied.");
      error.status = 403;
      throw error;
    }

    if (booking.status !== "PENDING") {
      throw buildValidationError(
        `Cannot pay booking with status ${booking.status}. Only PENDING bookings can be paid.`
      );
    }

    if (booking.expiresAt && booking.expiresAt <= now) {
      throw buildValidationError("Booking has expired. Please create a new booking.");
    }

    if (booking.voucherId) {
      const voucher = await tx.voucher.findUnique({ where: { id: booking.voucherId } });
      if (!voucher || voucher.status !== "ACTIVE" || voucher.expiredAt <= now) {
        throw buildValidationError("Voucher is no longer valid.");
      }

      const voucherUpdate = await tx.voucher.updateMany({
        where: {
          id: booking.voucherId,
          usedCount: { lt: voucher.usageLimit },
        },
        data: {
          usedCount: { increment: 1 },
        },
      });

      if (voucherUpdate.count !== 1) {
        throw buildConflictError("Voucher usage limit has been reached.");
      }
    }

    return tx.booking.update({
      where: { id: booking.id },
      data: {
        status: "PAID",
        expiresAt: null,
      },
      include: BOOKING_INCLUDE,
    });
  });
}

async function getBookingById({ bookingId, currentUser }) {
  const booking = await prisma.booking.findUnique({
    where: { id: Number(bookingId) },
    include: {
      bookingItems: { include: { ticketCategory: true } },
      concert: true,
      voucher: true,
    },
  });

  if (!booking) {
    const error = new Error("Booking not found.");
    error.status = 404;
    throw error;
  }

  const isAdmin =
    currentUser.role === "ADMIN" || currentUser.role === "OPERATOR";
  if (!isAdmin && booking.userId !== currentUser.id) {
    const error = new Error("Access denied.");
    error.status = 403;
    throw error;
  }

  return booking;
}

async function getBookingsForUser({ userId, query }) {
  const where = { userId: Number(userId) };
  if (query && query.status) {
    where.status = query.status;
  }

  return prisma.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: BOOKING_INCLUDE,
  });
}

module.exports = {
  createBooking,
  mockPayBooking,
  getBookingById,
  getBookingsForUser,
  BOOKING_INCLUDE,
};
