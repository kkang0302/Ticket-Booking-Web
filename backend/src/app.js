require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const errorHandler = require("./common/errorHandler");
const { initRedis } = require("./infrastructure/redis");

const authRoutes = require("./modules/auth/auth.routes");
const concertRoutes = require("./modules/concert/concert.routes");
const bookingRoutes = require("./modules/booking/booking.routes");
const voucherRoutes = require("./modules/voucher/voucher.routes");
const adminBookingRoutes = require("./modules/admin/admin.booking.routes");
const adminConcertRoutes = require("./modules/admin/admin.concert.routes");
const adminVoucherRoutes = require("./modules/admin/admin.voucher.routes");

const app = express();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ message: "Server is running" });
});

app.use("/auth", authRoutes);
app.use("/concerts", concertRoutes);
app.use("/bookings", bookingRoutes);
app.use("/vouchers", voucherRoutes);
app.use("/admin/bookings", adminBookingRoutes);
app.use("/admin/concerts", adminConcertRoutes);
app.use("/admin/vouchers", adminVoucherRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  const { startExpireBookingsJob } = require("./jobs/expireBookings");

  initRedis()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        startExpireBookingsJob();
      });
    })
    .catch((err) => {
      console.error("Failed to start server:", err);
      process.exit(1);
    });
}

module.exports = app;
