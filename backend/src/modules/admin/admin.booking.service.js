const prisma = require("../../common/prismaClient");
const { releaseBookingInventory } = require("../booking/bookingInventory");

const BOOKING_INCLUDE = {
  bookingItems: { include: { ticketCategory: true } },
  concert: true,
  voucher: true,
};

const RELEASE_STATUSES = new Set(["CANCELLED", "FAILED", "EXPIRED"]);
const INVENTORY_HELD_STATUSES = new Set(["PENDING", "PAID"]);

function buildValidationError(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

const ALLOWED_TRANSITIONS = {
  PENDING: new Set(["PAID", "CANCELLED", "FAILED", "EXPIRED"]),
  PAID: new Set(["CANCELLED", "FAILED"]),
  RESERVED: new Set(["PAID", "CANCELLED", "FAILED", "EXPIRED"]),
  FAILED: new Set(),
  CANCELLED: new Set(),
  EXPIRED: new Set(),
};

async function listBookings(filters) {
  const where = {};

  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.concertId) {
    where.concertId = Number(filters.concertId);
  }
  if (filters.userId) {
    where.userId = Number(filters.userId);
  }

  return prisma.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, email: true, fullName: true },
      },
      concert: true,
      voucher: true,
      bookingItems: {
        include: {
          ticketCategory: true,
        },
      },
    },
  });
}

async function updateBookingStatus({ bookingId, status }) {
  if (!bookingId || !status) {
    throw buildValidationError("bookingId and status are required.");
  }

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

    const allowed = ALLOWED_TRANSITIONS[booking.status];
    if (!allowed || !allowed.has(status)) {
      throw buildValidationError(
        `Cannot transition booking from ${booking.status} to ${status}.`
      );
    }

    const shouldRelease =
      RELEASE_STATUSES.has(status) && INVENTORY_HELD_STATUSES.has(booking.status);

    if (shouldRelease) {
      await releaseBookingInventory(tx, booking);
    }

    return tx.booking.update({
      where: { id: booking.id },
      data: {
        status,
        expiresAt: status === "PAID" ? null : booking.expiresAt,
      },
      include: {
        user: {
          select: { id: true, email: true, fullName: true },
        },
        concert: true,
        voucher: true,
        bookingItems: {
          include: {
            ticketCategory: true,
          },
        },
      },
    });
  });
}

module.exports = {
  listBookings,
  updateBookingStatus,
};
