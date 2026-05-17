const adminConcertService = require("./admin.concert.service");

async function createConcert(req, res, next) {
  try {
    const concert = await adminConcertService.createConcert(req.body);
    res.status(201).json({ data: concert });
  } catch (error) {
    next(error);
  }
}

async function createTicketCategory(req, res, next) {
  try {
    const ticketCategory = await adminConcertService.createTicketCategory(req.body);
    res.status(201).json({ data: ticketCategory });
  } catch (error) {
    next(error);
  }
}

async function updateTicketCategory(req, res, next) {
  try {
    const categoryId = Number(req.params.id);
    const updated = await adminConcertService.updateTicketCategory(categoryId, req.body);
    res.json({ data: updated });
  } catch (error) {
    next(error);
  }
}

async function deleteTicketCategory(req, res, next) {
  try {
    const categoryId = Number(req.params.id);
    await adminConcertService.deleteTicketCategory(categoryId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

async function getConcertDetail(req, res, next) {
  try {
    const concertId = Number(req.params.id);
    const concert = await adminConcertService.getConcertDetail(concertId);
    res.json({ data: concert });
  } catch (error) {
    next(error);
  }
}

async function updateConcert(req, res, next) {
  try {
    const concertId = Number(req.params.id);
    const concert = await adminConcertService.updateConcert(concertId, req.body);
    res.json({ data: concert });
  } catch (error) {
    next(error);
  }
}

async function deleteConcert(req, res, next) {
  try {
    const concertId = Number(req.params.id);
    await adminConcertService.deleteConcert(concertId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

async function listAllConcerts(req, res, next) {
  try {
    const concerts = await adminConcertService.listAllConcerts();
    res.json({ data: concerts });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createConcert,
  createTicketCategory,
  getConcertDetail,
  updateConcert,
  deleteConcert,
  listAllConcerts,
  updateTicketCategory,
  deleteTicketCategory,
};
