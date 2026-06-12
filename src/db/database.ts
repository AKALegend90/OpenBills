import type { Bill, BillInput } from "../types/bill";
import type { Income, IncomeInput } from "../types/income";
import { defaultSettings, type Settings } from "../types/settings";

export interface OpenBillsData {
  bills: Bill[];
  incomes: Income[];
  settings: Settings;
  billPayments: Array<{ id: number; billId: number; paidMonth: string; paidAt: string }>;
}

const storageKey = "openbills.data.v1";

const seedData: OpenBillsData = {
  bills: [
    {
      id: 1,
      name: "Rent",
      amount: 1400,
      dueDay: 1,
      category: "Rent",
      repeatsMonthly: true,
      isPaid: false,
      notes: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      name: "Car Payment",
      amount: 520,
      dueDay: 10,
      category: "Car Payment",
      repeatsMonthly: true,
      isPaid: false,
      notes: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  incomes: [
    {
      id: 1,
      name: "Paycheck",
      amount: 1300,
      frequency: "biweekly",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  settings: defaultSettings,
  billPayments: []
};

export function loadData(): OpenBillsData {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return seedData;
  return { ...seedData, ...JSON.parse(raw) } as OpenBillsData;
}

export function saveData(data: OpenBillsData): void {
  localStorage.setItem(storageKey, JSON.stringify(data));
}

export function nextId(items: Array<{ id: number }>): number {
  return Math.max(0, ...items.map((item) => item.id)) + 1;
}

export function createBill(input: BillInput, data: OpenBillsData): OpenBillsData {
  const now = new Date().toISOString();
  return {
    ...data,
    bills: [...data.bills, { ...input, id: nextId(data.bills), createdAt: now, updatedAt: now }]
  };
}

export function updateBill(id: number, input: BillInput, data: OpenBillsData): OpenBillsData {
  const now = new Date().toISOString();
  return {
    ...data,
    bills: data.bills.map((bill) => bill.id === id ? { ...bill, ...input, updatedAt: now } : bill)
  };
}

export function createIncome(input: IncomeInput, data: OpenBillsData): OpenBillsData {
  const now = new Date().toISOString();
  return {
    ...data,
    incomes: [...data.incomes, { ...input, id: nextId(data.incomes), createdAt: now, updatedAt: now }]
  };
}

export function updateIncome(id: number, input: IncomeInput, data: OpenBillsData): OpenBillsData {
  const now = new Date().toISOString();
  return {
    ...data,
    incomes: data.incomes.map((income) => income.id === id ? { ...income, ...input, updatedAt: now } : income)
  };
}
