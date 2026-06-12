import type { Bill } from "../types/bill";
import type { Income } from "../types/income";
import type { Settings } from "../types/settings";

export interface OpenBillsBackup {
  version: 1;
  exportedAt: string;
  bills: Bill[];
  incomes: Income[];
  settings: Settings;
}

export function createBackup(bills: Bill[], incomes: Income[], settings: Settings): string {
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), bills, incomes, settings }, null, 2);
}

export function parseBackup(text: string): OpenBillsBackup {
  const parsed = JSON.parse(text) as OpenBillsBackup;
  if (parsed.version !== 1 || !Array.isArray(parsed.bills) || !Array.isArray(parsed.incomes)) {
    throw new Error("Unsupported OpenBills backup file.");
  }
  return parsed;
}
