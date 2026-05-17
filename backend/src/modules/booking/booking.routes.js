const express = require("express");
const bookingController = require("./booking.controller");
const { authMiddleware } = require("../auth/auth.middleware");
const { createBookingRateLimiter } = require("../../middleware/rateLimit");

const router = express.Router();

let bookingRateLimiter;

function applyBookingRateLimit(req, res, next) {
  if (!bookingRateLimiter) {
    bookingRateLimiter = createBookingRateLimiter();
  }
  return bookingRateLimiter(req, res, next);
}

router.post("/", authMiddleware, applyBookingRateLimit, bookingController.createBooking);
router.get("/me", authMiddleware, bookingController.getMyBookings);
router.post("/:id/pay", authMiddleware, bookingController.mockPayBooking);
router.get("/:id", authMiddleware, bookingController.getBookingById);

module.exports = router;
