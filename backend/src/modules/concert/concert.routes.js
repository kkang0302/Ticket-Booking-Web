const express = require("express");
const concertController = require("./concert.controller");

const router = express.Router();

router.get("/", concertController.getPublishedConcerts);
router.get("/:id", concertController.getConcertDetail);

module.exports = router;
