import { useMemo, useState } from "react";
import { CalendarDays, CircleDollarSign, ClipboardList, Info, LayoutDashboard, Settings as SettingsIcon } from "lucide-react";
import { billCategories, type Bill, type BillInput } from "./types/bill";
import type { Income, IncomeInput } from "./types/income";
import { defaultSettings, type Settings } from "./types/settings";
import { loadData, saveData, type OpenBillsData } from "./db/database";
import { createBackup, parseBackup } from "./utils/importExport";
import { daysUntilBill, isDueSoon, isOverdue, leftoverMoney, nextDueBill, totalMonthlyBills, totalMonthlyIncome } from "./utils/calculations";
import { formatMoney } from "./utils/money";
import { ordinal } from "./utils/dates";

type Page = "dashboard" | "bills" | "income" | "calendar" | "settings" | "about";

const navItems: Array<{ page: Page; label: string; icon: JSX.Element }> = [
  { page: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { page: "bills", label: "Bills", icon: <ClipboardList size={18} /> },
  { page: "income", label: "Income", icon: <CircleDollarSign size={18} /> },
  { page: "calendar", label: "Calendar", icon: <CalendarDays size={18} /> },
  { page: "settings", label: "Settings", icon: <SettingsIcon size={18} /> },
  { page: "about", label: "About", icon: <Info size={18} /> }
];

function emptyBill(): BillInput {
  return { name: "", amount: 0, dueDay: 1, category: "Other", repeatsMonthly: true, isPaid: false, notes: "" };
}

function emptyIncome(): IncomeInput {
  return { name: "", amount: 0, frequency: "monthly" };
}

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [data, setData] = useState<OpenBillsData>(() => loadData());
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [billDraft, setBillDraft] = useState<BillInput>(emptyBill());
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [incomeDraft, setIncomeDraft] = useState<IncomeInput>(emptyIncome());
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  function persist(next: OpenBillsData) {
    setData(next);
    saveData(next);
  }

  const monthlyIncome = totalMonthlyIncome(data.incomes);
  const monthlyBills = totalMonthlyBills(data.bills);
  const nextBill = nextDueBill(data.bills);
  const dueSoon = data.bills.filter((bill) => isDueSoon(bill, data.settings.reminderDays));
  const overdue = data.bills.filter((bill) => isOverdue(bill));
  const filteredBills = useMemo(() => data.bills
    .filter((bill) => bill.name.toLowerCase().includes(query.toLowerCase()))
    .filter((bill) => category === "All" || bill.category === category)
    .sort((a, b) => a.dueDay - b.dueDay), [data.bills, query, category]);

  function saveBill() {
    if (!billDraft.name.trim() || billDraft.amount <= 0 || billDraft.dueDay < 1 || billDraft.dueDay > 31) return;
    const now = new Date().toISOString();
    const bills = editingBill
      ? data.bills.map((bill) => bill.id === editingBill.id ? { ...bill, ...billDraft, updatedAt: now } : bill)
      : [...data.bills, { ...billDraft, id: Math.max(0, ...data.bills.map((bill) => bill.id)) + 1, createdAt: now, updatedAt: now }];
    persist({ ...data, bills });
    setEditingBill(null);
    setBillDraft(emptyBill());
  }

  function saveIncome() {
    if (!incomeDraft.name.trim() || incomeDraft.amount <= 0) return;
    const now = new Date().toISOString();
    const incomes = editingIncome
      ? data.incomes.map((income) => income.id === editingIncome.id ? { ...income, ...incomeDraft, updatedAt: now } : income)
      : [...data.incomes, { ...incomeDraft, id: Math.max(0, ...data.incomes.map((income) => income.id)) + 1, createdAt: now, updatedAt: now }];
    persist({ ...data, incomes });
    setEditingIncome(null);
    setIncomeDraft(emptyIncome());
  }

  function updateSettings(settings: Settings) {
    persist({ ...data, settings });
  }

  return (
    <div className={data.settings.darkMode ? "app dark" : "app"}>
      <aside className="sidebar">
        <div className="brand">OpenBills</div>
        <nav>
          {navItems.map((item) => (
            <button key={item.page} className={page === item.page ? "active" : ""} onClick={() => setPage(item.page)}>
              {item.icon}<span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      <main className="main">
        {page === "dashboard" && (
          <section>
            <header className="page-head"><h1>Dashboard</h1><button onClick={() => setPage("bills")}>Add Bill</button></header>
            <div className="metrics">
              <Card title="Monthly Income" value={formatMoney(monthlyIncome)} tone="income" />
              <Card title="Total Bills" value={formatMoney(monthlyBills)} tone="bills" />
              <Card title="Money Left" value={formatMoney(leftoverMoney(monthlyIncome, monthlyBills))} tone="left" />
              <Card title="Unpaid Bills" value={String(data.bills.filter((bill) => !bill.isPaid).length)} tone="neutral" />
            </div>
            <div className="columns">
              <Panel title="Next Due">{nextBill ? <BillLine bill={nextBill} /> : <p>No unpaid bills due this month.</p>}</Panel>
              <Panel title="Due Soon">{dueSoon.length ? dueSoon.map((bill) => <BillLine key={bill.id} bill={bill} />) : <p>Nothing due soon.</p>}</Panel>
              <Panel title="Overdue">{overdue.length ? overdue.map((bill) => <BillLine key={bill.id} bill={bill} overdue />) : <p>No overdue bills.</p>}</Panel>
            </div>
          </section>
        )}
        {page === "bills" && (
          <section>
            <header className="page-head"><h1>Bills</h1><button onClick={() => { setEditingBill(null); setBillDraft(emptyBill()); }}>Add Bill</button></header>
            <div className="filters"><input placeholder="Search bills" value={query} onChange={(event) => setQuery(event.target.value)} /><select value={category} onChange={(event) => setCategory(event.target.value)}><option>All</option>{billCategories.map((item) => <option key={item}>{item}</option>)}</select></div>
            <FormGrid>
              <Text label="Bill name" value={billDraft.name} onChange={(value) => setBillDraft({ ...billDraft, name: value })} />
              <NumberInput label="Amount" value={billDraft.amount} onChange={(value) => setBillDraft({ ...billDraft, amount: value })} />
              <NumberInput label="Due day" value={billDraft.dueDay} onChange={(value) => setBillDraft({ ...billDraft, dueDay: value })} />
              <label>Category<select value={billDraft.category} onChange={(event) => setBillDraft({ ...billDraft, category: event.target.value as BillInput["category"] })}>{billCategories.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label>Notes<textarea value={billDraft.notes} onChange={(event) => setBillDraft({ ...billDraft, notes: event.target.value })} /></label>
              <label className="check"><input type="checkbox" checked={billDraft.repeatsMonthly} onChange={(event) => setBillDraft({ ...billDraft, repeatsMonthly: event.target.checked })} /> Repeats monthly</label>
              <button onClick={saveBill}>{editingBill ? "Save Changes" : "Save Bill"}</button>
              <button className="secondary" onClick={() => { setEditingBill(null); setBillDraft(emptyBill()); }}>Cancel</button>
            </FormGrid>
            <div className="list">{filteredBills.map((bill) => <article key={bill.id} className="row"><div><strong>{bill.name}</strong><span>{formatMoney(bill.amount)} - Due {ordinal(bill.dueDay)} - {bill.category}</span>{bill.notes && <small>{bill.notes}</small>}</div><div className="actions"><button onClick={() => persist({ ...data, bills: data.bills.map((item) => item.id === bill.id ? { ...item, isPaid: !item.isPaid } : item) })}>{bill.isPaid ? "Mark Unpaid" : "Mark Paid"}</button><button onClick={() => { setEditingBill(bill); setBillDraft({ name: bill.name, amount: bill.amount, dueDay: bill.dueDay, category: bill.category, repeatsMonthly: bill.repeatsMonthly, isPaid: bill.isPaid, notes: bill.notes }); }}>Edit</button><button className="danger" onClick={() => persist({ ...data, bills: data.bills.filter((item) => item.id !== bill.id) })}>Delete</button></div></article>)}</div>
          </section>
        )}
        {page === "income" && (
          <section>
            <header className="page-head"><h1>Income</h1><strong>Estimated Monthly Income: {formatMoney(monthlyIncome)}</strong></header>
            <FormGrid><Text label="Income name" value={incomeDraft.name} onChange={(value) => setIncomeDraft({ ...incomeDraft, name: value })} /><NumberInput label="Amount" value={incomeDraft.amount} onChange={(value) => setIncomeDraft({ ...incomeDraft, amount: value })} /><label>Frequency<select value={incomeDraft.frequency} onChange={(event) => setIncomeDraft({ ...incomeDraft, frequency: event.target.value as IncomeInput["frequency"] })}><option value="weekly">Weekly</option><option value="biweekly">Biweekly</option><option value="monthly">Monthly</option><option value="custom">Custom</option></select></label><button onClick={saveIncome}>{editingIncome ? "Save Changes" : "Save Income"}</button><button className="secondary" onClick={() => { setEditingIncome(null); setIncomeDraft(emptyIncome()); }}>Cancel</button></FormGrid>
            <div className="list">{data.incomes.map((income) => <article key={income.id} className="row"><div><strong>{income.name}</strong><span>{formatMoney(income.amount)} - {income.frequency}</span></div><div className="actions"><button onClick={() => { setEditingIncome(income); setIncomeDraft({ name: income.name, amount: income.amount, frequency: income.frequency }); }}>Edit</button><button className="danger" onClick={() => persist({ ...data, incomes: data.incomes.filter((item) => item.id !== income.id) })}>Delete</button></div></article>)}</div>
          </section>
        )}
        {page === "calendar" && <CalendarView bills={data.bills} />}
        {page === "settings" && (
          <section><header className="page-head"><h1>Settings</h1></header><div className="settings"><label>Currency<select value={data.settings.currency} onChange={() => updateSettings({ ...data.settings, currency: "USD" })}><option value="USD">USD</option></select></label><label>Reminder days<select value={data.settings.reminderDays} onChange={(event) => updateSettings({ ...data.settings, reminderDays: Number(event.target.value) as Settings["reminderDays"] })}><option value="1">1 day before</option><option value="3">3 days before</option><option value="5">5 days before</option><option value="7">7 days before</option></select></label><label className="check"><input type="checkbox" checked={data.settings.darkMode} onChange={(event) => updateSettings({ ...data.settings, darkMode: event.target.checked })} /> Dark mode</label><button onClick={() => navigator.clipboard.writeText(createBackup(data.bills, data.incomes, data.settings))}>Export data</button><textarea placeholder="Paste OpenBills backup JSON to import" onBlur={(event) => { if (!event.target.value.trim()) return; const backup = parseBackup(event.target.value); persist({ ...data, bills: backup.bills, incomes: backup.incomes, settings: backup.settings || defaultSettings }); }} /><button className="danger" onClick={() => persist({ ...data, bills: [], incomes: [] })}>Reset app data</button></div></section>
        )}
        {page === "about" && <section className="about"><h1>OpenBills</h1><p>OpenBills is a free, open-source, privacy-first bill tracker.</p><p>No account required.<br />No bank connection.<br />No cloud sync.<br />No ads.<br />All data stays on your device.</p><p>License: MIT</p></section>}
      </main>
    </div>
  );
}

function Card({ title, value, tone }: { title: string; value: string; tone: string }) {
  return <article className={`card ${tone}`}><span>{title}</span><strong>{value}</strong></article>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="panel"><h2>{title}</h2>{children}</section>;
}

function BillLine({ bill, overdue }: { bill: Bill; overdue?: boolean }) {
  const days = daysUntilBill(bill.dueDay);
  return <div className={overdue ? "bill-line overdue" : "bill-line"}><strong>{bill.name}</strong><span>{formatMoney(bill.amount)} - {days < 0 ? `${Math.abs(days)} days overdue` : `Due in ${days} days`}</span></div>;
}

function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="form-grid">{children}</div>;
}

function Text({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label>{label}<input value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label>{label}<input type="number" min="0" value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

function CalendarView({ bills }: { bills: Bill[] }) {
  const today = new Date();
  const first = new Date(today.getFullYear(), today.getMonth(), 1);
  const days = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  return <section><header className="page-head"><h1>{first.toLocaleString("en-US", { month: "long", year: "numeric" })}</h1></header><div className="calendar">{Array.from({ length: first.getDay() }).map((_, index) => <div key={`blank-${index}`} />)}{Array.from({ length: days }).map((_, index) => { const day = index + 1; return <div key={day} className="day"><strong>{day}</strong>{bills.filter((bill) => bill.dueDay === day).map((bill) => <span key={bill.id} className={bill.isPaid ? "paid" : ""}>{bill.name} - {formatMoney(bill.amount)}</span>)}</div>; })}</div></section>;
}
