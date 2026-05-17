const concertService = require("./concert.service");

async function getPublishedConcerts(req, res, next) {
  try {
    const concerts = await concertService.listPublishedConcerts();
    res.json({ data: concerts });
  } catch (error) {
    next(error);
  }
}

async function getConcertDetail(req, res, next) {
  try {
    const concertId = Number(req.params.id);
    const concert = await concertService.getConcertDetail(concertId);
    res.json({ data: concert });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPublishedConcerts,
  getConcertDetail,
};
