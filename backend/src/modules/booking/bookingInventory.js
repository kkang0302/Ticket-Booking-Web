async function releaseBookingInventory(tx, booking) {
  for (const item of booking.bookingItems) {
    await tx.ticketCategory.update({
      where: { id: item.ticketCategoryId },
      data: {
        remainingQuantity: { increment: item.quantity },
      },
    });
  }

  if (booking.voucherId && booking.status === "PAID") {
    await tx.voucher.updateMany({
      where: {
        id: booking.voucherId,
        usedCount: { gt: 0 },
      },
      data: {
        usedCount: { decrement: 1 },
      },
    });
  }
}

module.exports = {
  releaseBookingInventory,
};
