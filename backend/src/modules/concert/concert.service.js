const prisma = require("../../common/prismaClient");

async function listPublishedConcerts() {
  return prisma.concert.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { startTime: "asc" },
    include: {
      ticketCategories: {
        select: {
          id: true,
          name: true,
          price: true,
          remainingQuantity: true,
        },
      },
    },
  });
}

async function getConcertDetail(concertId) {
  const concert = await prisma.concert.findUnique({
    where: { id: Number(concertId) },
    include: {
      ticketCategories: {
        select: {
          id: true,
          name: true,
          price: true,
          totalQuantity: true,
          remainingQuantity: true,
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

module.exports = {
  listPublishedConcerts,
  getConcertDetail,
};
