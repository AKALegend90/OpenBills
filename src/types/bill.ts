export type BillCategory =
  | "Rent"
  | "Mortgage"
  | "Car Payment"
  | "Insurance"
  | "Phone"
  | "Internet"
  | "Utilities"
  | "Credit Card"
  | "Loan"
  | "Food"
  | "Subscription"
  | "Other";

export interface Bill {
  id: number;
  name: string;
  amount: number;
  dueDay: number;
  category: BillCategory;
  repeatsMonthly: boolean;
  isPaid: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type BillInput = Omit<Bill, "id" | "createdAt" | "updatedAt">;

export const billCategories: BillCategory[] = [
  "Rent",
  "Mortgage",
  "Car Payment",
  "Insurance",
  "Phone",
  "Internet",
  "Utilities",
  "Credit Card",
  "Loan",
  "Food",
  "Subscription",
  "Other"
];
