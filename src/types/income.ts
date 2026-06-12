export type IncomeFrequency = "weekly" | "biweekly" | "monthly" | "custom";

export interface Income {
  id: number;
  name: string;
  amount: number;
  frequency: IncomeFrequency;
  createdAt: string;
  updatedAt: string;
}

export type IncomeInput = Omit<Income, "id" | "createdAt" | "updatedAt">;
