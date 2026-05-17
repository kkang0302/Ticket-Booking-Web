const { describe, it } = require("node:test");
const assert = require("node:assert");

function normalizeItems(items) {
  const normalizedItems = items.reduce((acc, item) => {
    const categoryId = Number(item.ticketCategoryId);
    const quantity = Number(item.quantity);
    if (!categoryId || quantity <= 0) {
      return acc;
    }

    if (!acc[categoryId]) {
      acc[categoryId] = { ticketCategoryId: categoryId, quantity };
    } else {
      acc[categoryId].quantity += quantity;
    }
    return acc;
  }, {});

  return Object.values(normalizedItems);
}

function computeDiscount(totalAmount, voucher) {
  if (!voucher) return 0;
  if (voucher.discountType === "PERCENTAGE") {
    return Number(((totalAmount * Number(voucher.discountValue)) / 100).toFixed(2));
  }
  return Number(voucher.discountValue);
}

describe("booking logic", () => {
  it("merges duplicate ticket categories in items", () => {
    const result = normalizeItems([
      { ticketCategoryId: 1, quantity: 2 },
      { ticketCategoryId: 1, quantity: 3 },
    ]);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].quantity, 5);
  });

  it("computes percentage voucher discount", () => {
    const discount = computeDiscount(100, {
      discountType: "PERCENTAGE",
      discountValue: 10,
    });
    assert.strictEqual(discount, 10);
  });

  it("computes fixed voucher discount", () => {
    const discount = computeDiscount(100, {
      discountType: "FIXED",
      discountValue: 25,
    });
    assert.strictEqual(discount, 25);
  });
});
