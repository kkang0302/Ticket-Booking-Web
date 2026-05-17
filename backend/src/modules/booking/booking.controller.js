const bookingService = require("./booking.service");

async function createBooking(req, res, next) {
  try {
    const payload = req.body;
    const result = await bookingService.createBooking({
      userId: req.user.id,
      data: payload,
    });

    res.status(201).json({ data: result });
  } catch (error) {
    next(error);
  }
}

async function getBookingById(req, res, next) {
  try {
    const bookingId = Number(req.params.id);
    const result = await bookingService.getBookingById({
      bookingId,
      currentUser: req.user,
    });

    res.json({ data: result });
  } catch (error) {
    next(error);
  }
}

async function getMyBookings(req, res, next) {
  try {
    const userId = req.user.id;
    const result = await bookingService.getBookingsForUser({ userId, query: req.query });
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
}

async function mockPayBooking(req, res, next) {
  try {
    const bookingId = Number(req.params.id);
    const result = await bookingService.mockPayBooking({
      bookingId,
      userId: req.user.id,
    });

    res.json({
      data: result,
      meta: {
        payment: "mock",
        message: "Payment simulated successfully",
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createBooking,
  getBookingById,
  getMyBookings,
  mockPayBooking,
};
