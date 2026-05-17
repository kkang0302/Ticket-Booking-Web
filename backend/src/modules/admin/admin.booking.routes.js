const express = require("express");
const adminBookingController = require("./admin.booking.controller");
const { authMiddleware, adminMiddleware } = require("../auth/auth.middleware");

const router = express.Router();
router.use(authMiddleware, adminMiddleware);

router.get("/", adminBookingController.listBookings);
router.patch("/:id/status", adminBookingController.updateBookingStatus);

module.exports = router;
