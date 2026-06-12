import type { Bill } from "../types/bill";
import type { Income, IncomeFrequency } from "../types/income";
import { billDueDate, startOfDay } from "./dates";

export function monthlyIncomeFromAmount(amount: number, frequency: IncomeFrequency): number {
  if (frequency === "weekly") return amount * 52 / 12;
  if (frequency === "biweekly") return amount * 26 / 12;
  return amount;
}

export function totalMonthlyIncome(incomes: Income[]): number {
  return incomes.reduce((total, income) => total + monthlyIncomeFromAmount(income.amount, income.frequency), 0);
}

export function totalMonthlyBills(bills: Bill[]): number {
  return bills.reduce((total, bill) => total + bill.amount, 0);
}

export function leftoverMoney(monthlyIncome: number, totalBills: number): number {
  return monthlyIncome - totalBills;
}

export function daysUntilBill(dueDay: number, today = new Date()): number {
  const current = startOfDay(today);
  const due = billDueDate(dueDay, today);
  return Math.ceil((due.getTime() - current.getTime()) / 86400000);
}

export function isDueSoon(bill: Bill, reminderDays: number, today = new Date()): boolean {
  if (bill.isPaid) return false;
  const days = daysUntilBill(bill.dueDay, today);
  return days >= 0 && days <= reminderDays;
}

export function isOverdue(bill: Bill, today = new Date()): boolean {
  if (bill.isPaid) return false;
  return daysUntilBill(bill.dueDay, today) < 0;
}

export function nextDueBill(bills: Bill[], today = new Date()): Bill | undefined {
  return bills
    .filter((bill) => !bill.isPaid && daysUntilBill(bill.dueDay, today) >= 0)
    .sort((a, b) => daysUntilBill(a.dueDay, today) - daysUntilBill(b.dueDay, today))[0];
}
