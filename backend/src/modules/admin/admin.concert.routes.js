const express = require("express");
const adminConcertController = require("./admin.concert.controller");
const { authMiddleware, adminMiddleware } = require("../auth/auth.middleware");

const router = express.Router();
router.use(authMiddleware, adminMiddleware);

router.get("/", adminConcertController.listAllConcerts);
router.post("/", adminConcertController.createConcert);
router.post("/ticket-categories", adminConcertController.createTicketCategory);
router.patch("/ticket-categories/:id", adminConcertController.updateTicketCategory);
router.delete("/ticket-categories/:id", adminConcertController.deleteTicketCategory);
router.get("/:id", adminConcertController.getConcertDetail);
router.patch("/:id", adminConcertController.updateConcert);
router.delete("/:id", adminConcertController.deleteConcert);

module.exports = router;
