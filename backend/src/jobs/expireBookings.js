const prisma = require("../common/prismaClient");
const { releaseBookingInventory } = require("../modules/booking/bookingInventory");

const BOOKING_INCLUDE = {
  bookingItems: { include: { ticketCategory: true } },
  voucher: true,
};

async function expirePendingBookings() {
  const now = new Date();

  const expiredBookings = await prisma.booking.findMany({
    where: {
      status: "PENDING",
      expiresAt: { lt: now },
    },
    include: BOOKING_INCLUDE,
  });

  for (const booking of expiredBookings) {
    try {
      await prisma.$transaction(async (tx) => {
        const current = await tx.booking.findUnique({
          where: { id: booking.id },
          include: BOOKING_INCLUDE,
        });

        if (!current || current.status !== "PENDING") {
          return;
        }

        await releaseBookingInventory(tx, current);

        await tx.booking.update({
          where: { id: current.id },
          data: { status: "EXPIRED", expiresAt: null },
        });
      });
    } catch (err) {
      console.error(`Failed to expire booking ${booking.id}:`, err.message);
    }
  }

  if (expiredBookings.length > 0) {
    console.log(`Expired ${expiredBookings.length} pending booking(s).`);
  }
}

function startExpireBookingsJob(intervalMs = 60 * 1000) {
  expirePendingBookings();
  return setInterval(expirePendingBookings, intervalMs);
}

module.exports = {
  expirePendingBookings,
  startExpireBookingsJob,
};
