const adminBookingService = require("./admin.booking.service");

async function listBookings(req, res, next) {
  try {
    const filters = req.query;
    const bookings = await adminBookingService.listBookings(filters);
    res.json({ data: bookings });
  } catch (error) {
    next(error);
  }
}

async function updateBookingStatus(req, res, next) {
  try {
    const bookingId = Number(req.params.id);
    const { status } = req.body;
    const booking = await adminBookingService.updateBookingStatus({ bookingId, status });
    res.json({ data: booking });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listBookings,
  updateBookingStatus,
};