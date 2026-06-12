export interface Settings {
  currency: "USD";
  reminderDays: 1 | 3 | 5 | 7;
  darkMode: boolean;
}

export const defaultSettings: Settings = {
  currency: "USD",
  reminderDays: 3,
  darkMode: false
};
