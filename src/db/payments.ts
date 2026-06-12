import type { OpenBillsData } from "./database";

export function recordPayment(billId: number, data: OpenBillsData): OpenBillsData {
  const now = new Date();
  const paidMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return {
    ...data,
    billPayments: [
      ...data.billPayments,
      { id: Math.max(0, ...data.billPayments.map((payment) => payment.id)) + 1, billId, paidMonth, paidAt: now.toISOString() }
    ]
  };
}
