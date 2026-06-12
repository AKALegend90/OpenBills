import assert from "node:assert/strict";
import test from "node:test";

function monthlyIncomeFromAmount(amount, frequency) {
  if (frequency === "weekly") return amount * 52 / 12;
  if (frequency === "biweekly") return amount * 26 / 12;
  return amount;
}

function leftoverMoney(monthlyIncome, totalBills) {
  return monthlyIncome - totalBills;
}

function daysUntilBill(dueDay, today) {
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const due = new Date(today.getFullYear(), today.getMonth(), dueDay);
  return Math.ceil((due.getTime() - current.getTime()) / 86400000);
}

function isDueSoon(bill, reminderDays, today) {
  if (bill.isPaid) return false;
  const days = daysUntilBill(bill.dueDay, today);
  return days >= 0 && days <= reminderDays;
}

function isOverdue(bill, today) {
  return !bill.isPaid && daysUntilBill(bill.dueDay, today) < 0;
}

test("monthly income calculation", () => {
  assert.equal(monthlyIncomeFromAmount(3000, "monthly"), 3000);
});

test("weekly income conversion", () => {
  assert.equal(Number(monthlyIncomeFromAmount(500, "weekly").toFixed(2)), 2166.67);
});

test("biweekly income conversion", () => {
  assert.equal(Number(monthlyIncomeFromAmount(1300, "biweekly").toFixed(2)), 2816.67);
});

test("leftover money calculation", () => {
  assert.equal(leftoverMoney(3500, 2200), 1300);
});

test("due soon calculation", () => {
  assert.equal(isDueSoon({ dueDay: 13, isPaid: false }, 3, new Date(2026, 5, 12)), true);
});

test("overdue calculation", () => {
  assert.equal(isOverdue({ dueDay: 10, isPaid: false }, new Date(2026, 5, 12)), true);
});
