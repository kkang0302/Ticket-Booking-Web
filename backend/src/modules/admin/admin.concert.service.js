const prisma = require("../../common/prismaClient");

function buildValidationError(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

async function createConcert(data) {
  const { title, venue, startTime, status, ticketCategories } = data;
  if (!title || !venue || !startTime) {
    throw buildValidationError("title, venue, and startTime are required.");
  }

  const startDate = new Date(startTime);
  if (Number.isNaN(startDate.getTime())) {
    throw buildValidationError("startTime must be a valid date.");
  }

  const createData = {
    title,
    venue,
    startTime: startDate,
    status: status || "DRAFT",
  };

  // If ticketCategories provided (array of { name, price, totalQuantity }), create them together
  if (Array.isArray(ticketCategories) && ticketCategories.length > 0) {
    createData.ticketCategories = {
      create: ticketCategories.map((tc) => ({
        name: tc.name,
        price: Number(tc.price),
        totalQuantity: Number(tc.totalQuantity),
        remainingQuantity: Number(tc.totalQuantity),
      })),
    };
  }

  return prisma.concert.create({
    data: createData,
    include: { ticketCategories: true },
  });
}

async function createTicketCategory(data) {
  const { concertId, name, price, totalQuantity } = data;
  if (!concertId || !name || price == null || totalQuantity == null) {
    throw buildValidationError("concertId, name, price, and totalQuantity are required.");
  }

  const concert = await prisma.concert.findUnique({ where: { id: Number(concertId) } });
  if (!concert) {
    throw buildValidationError("Concert does not exist.");
  }

  return prisma.ticketCategory.create({
    data: {
      concertId: Number(concertId),
      name,
      price: Number(price),
      totalQuantity: Number(totalQuantity),
      remainingQuantity: Number(totalQuantity),
    },
  });
}

async function updateTicketCategory(categoryId, data) {
  const { name, price, totalQuantity } = data;
  const existing = await prisma.ticketCategory.findUnique({ where: { id: Number(categoryId) } });
  if (!existing) {
    const error = new Error("Ticket category not found.");
    error.status = 404;
    throw error;
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (price != null) updateData.price = Number(price);
  if (totalQuantity != null) {
    const tq = Number(totalQuantity);
    // adjust remainingQuantity by difference between new total and old total
    const diff = tq - existing.totalQuantity;
    updateData.totalQuantity = tq;
    updateData.remainingQuantity = existing.remainingQuantity + diff;
    if (updateData.remainingQuantity < 0) updateData.remainingQuantity = 0;
  }

  return prisma.ticketCategory.update({ where: { id: Number(categoryId) }, data: updateData });
}

async function deleteTicketCategory(categoryId) {
  const existing = await prisma.ticketCategory.findUnique({ where: { id: Number(categoryId) } });
  if (!existing) {
    const error = new Error("Ticket category not found.");
    error.status = 404;
    throw error;
  }
  return prisma.ticketCategory.delete({ where: { id: Number(categoryId) } });
}

module.exports = {
  createConcert,
  createTicketCategory,
};

async function getConcertDetail(concertId) {
  const concert = await prisma.concert.findUnique({
    where: { id: Number(concertId) },
    include: {
      ticketCategories: true,
      bookings: {
        include: {
          bookingItems: true,
          user: { select: { id: true, email: true, fullName: true } },
        },
      },
    },
  });

  if (!concert) {
    const error = new Error("Concert not found.");
    error.status = 404;
    throw error;
  }

  return concert;
}

async function updateConcert(concertId, data) {
  const { title, venue, startTime, status } = data;
  
  const updateData = {};
  if (title) updateData.title = title;
  if (venue) updateData.venue = venue;
  if (status) updateData.status = status;
  if (startTime) {
    const startDate = new Date(startTime);
    if (!Number.isNaN(startDate.getTime())) {
      updateData.startTime = startDate;
    } else {
      throw buildValidationError("startTime must be a valid date.");
    }
  }

  const existingConcert = await prisma.concert.findUnique({ where: { id: Number(concertId) } });
  if (!existingConcert) {
    const error = new Error("Concert not found.");
    error.status = 404;
    throw error;
  }

  return prisma.concert.update({
    where: { id: Number(concertId) },
    data: updateData,
  });
}

async function listAllConcerts() {
  return prisma.concert.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      ticketCategories: true,
      bookings: true,
    },
  });
}

async function deleteConcert(concertId) {
  const id = Number(concertId);
  const existingConcert = await prisma.concert.findUnique({ where: { id } });
  if (!existingConcert) {
    const error = new Error("Concert not found.");
    error.status = 404;
    throw error;
  }

  // Delete ticket categories first to avoid FK issues, then delete concert
  return prisma.$transaction([
    prisma.ticketCategory.deleteMany({ where: { concertId: id } }),
    prisma.concert.delete({ where: { id } }),
  ]);
}

module.exports = {
  createConcert,
  createTicketCategory,
  getConcertDetail,
  updateConcert,
  listAllConcerts,
  deleteConcert,
  updateTicketCategory,
  deleteTicketCategory,
};
