"use client";
import { useState } from "react";
import {
  Euro, TrendingUp, TrendingDown, FileText, Download, Plus,
  CheckCircle, Clock, AlertCircle, X, Receipt, Wallet,
  BarChart2, ArrowUpRight, ArrowDownRight, Filter, Search,
  Printer, ChevronDown, Tag, Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/ui/LogoMark";

// ── Types ──────────────────────────────────────────────────────────────────────

type InvoiceStatus = "paid" | "pending" | "overdue" | "draft";
type ExpenseCategory = "cleaning" | "maintenance" | "supplies" | "taxes" | "platform" | "insurance" | "other";

interface Invoice {
  id: string;
  number: string;
  guest: string;
  property: string;
  nights: number;
  checkIn: string;
  checkOut: string;
  amount: number;
  tva: number;
  channel: string;
  status: InvoiceStatus;
  date: string;
}

interface Expense {
  id: string;
  label: string;
  category: ExpenseCategory;
  amount: number;
  property: string;
  date: string;
  vat?: number;
}

// ── Data ───────────────────────────────────────────────────────────────────────

const INVOICES: Invoice[] = [
  { id: "i1", number: "FAC-2024-0142", guest: "Sophie Martin", property: "Villa Azur", nights: 4, checkIn: "15 mai", checkOut: "19 mai", amount: 936, tva: 156, channel: "Airbnb", status: "paid", date: "15 mai 2024" },
  { id: "i2", number: "FAC-2024-0141", guest: "Jean-Pierre Dupont", property: "Penthouse Côte", nights: 7, checkIn: "17 mai", checkOut: "24 mai", amount: 3710, tva: 618.33, channel: "Booking.com", status: "paid", date: "17 mai 2024" },
  { id: "i3", number: "FAC-2024-0140", guest: "Anna Kowalski", property: "Villa Azur", nights: 5, checkIn: "20 mai", checkOut: "25 mai", amount: 1170, tva: 195, channel: "WhatsApp Direct", status: "pending", date: "20 mai 2024" },
  { id: "i4", number: "FAC-2024-0139", guest: "Marc Thibault", property: "Studio Antibes", nights: 2, checkIn: "16 mai", checkOut: "18 mai", amount: 156, tva: 26, channel: "SMS Direct", status: "pending", date: "16 mai 2024" },
  { id: "i5", number: "FAC-2024-0138", guest: "Claire Beaumont", property: "Apt. Bellevue", nights: 4, checkIn: "18 mai", checkOut: "22 mai", amount: 572, tva: 95.33, channel: "Booking.com", status: "overdue", date: "18 mai 2024" },
  { id: "i6", number: "FAC-2024-0137", guest: "Thomas Petit", property: "Villa Azur", nights: 3, checkIn: "10 mai", checkOut: "13 mai", amount: 702, tva: 117, channel: "Airbnb", status: "paid", date: "10 mai 2024" },
  { id: "i7", number: "FAC-2024-0136", guest: "Isabelle Garnier", property: "Penthouse Côte", nights: 9, checkIn: "5 mai", checkOut: "14 mai", amount: 4770, tva: 795, channel: "Airbnb", status: "paid", date: "5 mai 2024" },
  { id: "i8", number: "FAC-2024-0135", guest: "Pierre Laurent", property: "Apt. Bellevue", nights: 6, checkIn: "28 avr", checkOut: "4 mai", amount: 858, tva: 143, channel: "Direct", status: "draft", date: "28 avr 2024" },
];

const EXPENSES: Expense[] = [
  { id: "e1", label: "Ménage Villa Azur (arrivée)", category: "cleaning", amount: 85, property: "Villa Azur", date: "15 mai", vat: 10 },
  { id: "e2", label: "Ménage Penthouse (arrivée)", category: "cleaning", amount: 120, property: "Penthouse Côte", date: "17 mai", vat: 10 },
  { id: "e3", label: "Commission Airbnb (mai)", category: "platform", amount: 467, property: "Toutes", date: "1 mai", vat: 20 },
  { id: "e4", label: "Commission Booking.com (mai)", category: "platform", amount: 389, property: "Toutes", date: "1 mai", vat: 20 },
  { id: "e5", label: "Remplacement robinet Studio", category: "maintenance", amount: 210, property: "Studio Antibes", date: "10 mai", vat: 20 },
  { id: "e6", label: "Produits d'accueil (lot × 4)", category: "supplies", amount: 68, property: "Toutes", date: "8 mai", vat: 20 },
  { id: "e7", label: "Assurance multirisque habitation", category: "insurance", amount: 186, property: "Villa Azur", date: "1 mai", vat: 20 },
  { id: "e8", label: "Taxe de séjour collectée", category: "taxes", amount: 145, property: "Toutes", date: "15 mai" },
  { id: "e9", label: "Révision chaudière Apt. Bellevue", category: "maintenance", amount: 140, property: "Apt. Bellevue", date: "12 mai", vat: 20 },
  { id: "e10", label: "Fournitures bureau (gestion)", category: "supplies", amount: 32, property: "Toutes", date: "5 mai", vat: 20 },
];

const EXPENSE_CATS: Record<ExpenseCategory, { label: string; color: string; bg: string }> = {
  cleaning:    { label: "Ménage",      color: "text-blue-700",   bg: "bg-blue-50" },
  maintenance: { label: "Maintenance", color: "text-orange-700", bg: "bg-orange-50" },
  supplies:    { label: "Fournitures", color: "text-green-700",  bg: "bg-green-50" },
  taxes:       { label: "Taxes",       color: "text-red-700",    bg: "bg-red-50" },
  platform:    { label: "Commissions", color: "text-purple-700", bg: "bg-purple-50" },
  insurance:   { label: "Assurance",   color: "text-amber-700",  bg: "bg-amber-50" },
  other:       { label: "Autre",       color: "text-[#717171]",  bg: "bg-[#F7F7F7]" },
};

const STATUS_CFG: Record<InvoiceStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  paid:    { label: "Payée",      color: "text-green-700",  bg: "bg-green-50",  icon: <CheckCircle size={12} /> },
  pending: { label: "En attente", color: "text-amber-700",  bg: "bg-amber-50",  icon: <Clock size={12} /> },
  overdue: { label: "En retard",  color: "text-red-700",    bg: "bg-red-50",    icon: <AlertCircle size={12} /> },
  draft:   { label: "Brouillon",  color: "text-[#717171]",  bg: "bg-[#F7F7F7]", icon: <FileText size={12} /> },
};

// Cash flow bars
const CASH_FLOW = [
  { month: "Jan", income: 9400,  expenses: 2100 },
  { month: "Fév", income: 11800, expenses: 2400 },
  { month: "Mar", income: 14200, expenses: 2800 },
  { month: "Avr", income: 17400, expenses: 3200 },
  { month: "Mai", income: 18640, expenses: 3620 },
];

// ── Mini chart ─────────────────────────────────────────────────────────────────

function CashFlowChart() {
  const maxVal = Math.max(...CASH_FLOW.map(m => m.income));
  return (
    <div className="flex items-end gap-3 h-24 px-1">
      {CASH_FLOW.map((m, i) => (
        <div key={i} className="flex-1 flex gap-1 items-end">
          <div className="flex-1 bg-[#FF5A5F]/80 rounded-t-sm" style={{ height: `${(m.income / maxVal) * 100}%` }} title={`Revenus: ${m.income}€`} />
          <div className="flex-1 bg-red-200 rounded-t-sm" style={{ height: `${(m.expenses / maxVal) * 100}%` }} title={`Dépenses: ${m.expenses}€`} />
        </div>
      ))}
    </div>
  );
}

// ── Invoice preview modal ─────────────────────────────────────────────────────

function InvoiceModal({ inv, onClose }: { inv: Invoice; onClose: () => void }) {
  const tvaRate = 16.67; // percentage
  const ht = (inv.amount - inv.tva).toFixed(2);
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDDDDD]">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-[#FF5A5F]" />
            <h2 className="font-bold text-[#222222]">Facture {inv.number}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 border border-[#DDDDDD] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#717171] hover:bg-[#F7F7F7] transition-colors">
              <Printer size={12} /> Imprimer
            </button>
            <button className="flex items-center gap-1.5 bg-[#FF5A5F] rounded-xl px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#E00B41] transition-colors">
              <Download size={12} /> PDF
            </button>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[#F7F7F7] text-[#717171] transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="p-6">
          {/* Header invoice */}
          <div className="flex justify-between mb-6">
            <div>
              <LogoMark variant="light" size="md" />
              <div className="text-xs text-[#717171] mt-1">Gestion Locative Professionnelle</div>
              <div className="text-xs text-[#717171]">contact@hostpro.fr</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-[#222222]">{inv.number}</div>
              <div className="text-xs text-[#717171] mt-1">Date : {inv.date}</div>
              <div className={cn("inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full mt-1",
                STATUS_CFG[inv.status].bg, STATUS_CFG[inv.status].color
              )}>
                {STATUS_CFG[inv.status].icon} {STATUS_CFG[inv.status].label}
              </div>
            </div>
          </div>

          {/* Guest info */}
          <div className="bg-[#F7F7F7] rounded-xl p-4 mb-4">
            <div className="font-semibold text-[#222222]">{inv.guest}</div>
            <div className="text-sm text-[#717171]">{inv.property}</div>
            <div className="text-sm text-[#717171]">{inv.checkIn} → {inv.checkOut} ({inv.nights} nuits)</div>
            <div className="text-xs text-[#BBBBBB] mt-1">Canal : {inv.channel}</div>
          </div>

          {/* Line items */}
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="border-b border-[#DDDDDD]">
                <th className="text-left py-2 text-xs font-bold text-[#717171]">Description</th>
                <th className="text-right py-2 text-xs font-bold text-[#717171]">Montant HT</th>
                <th className="text-right py-2 text-xs font-bold text-[#717171]">TVA 20%</th>
                <th className="text-right py-2 text-xs font-bold text-[#717171]">Total TTC</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#F7F7F7]">
                <td className="py-2 text-[#222222]">Location {inv.property} — {inv.nights} nuit{inv.nights > 1 ? "s" : ""}</td>
                <td className="py-2 text-right text-[#222222]">{ht}€</td>
                <td className="py-2 text-right text-[#717171]">{inv.tva.toFixed(2)}€</td>
                <td className="py-2 text-right font-bold text-[#222222]">{inv.amount.toFixed(2)}€</td>
              </tr>
            </tbody>
          </table>

          <div className="border-t border-[#DDDDDD] pt-3">
            <div className="flex justify-between text-sm text-[#717171] mb-1">
              <span>Sous-total HT</span><span>{ht}€</span>
            </div>
            <div className="flex justify-between text-sm text-[#717171] mb-2">
              <span>TVA (20%)</span><span>{inv.tva.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between text-lg font-black text-[#222222]">
              <span>Total TTC</span><span className="text-[#FF5A5F]">{inv.amount.toFixed(2)}€</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Add expense modal ─────────────────────────────────────────────────────────

function AddExpenseModal({ onClose, onAdd }: { onClose: () => void; onAdd: (e: Expense) => void }) {
  const [form, setForm] = useState({ label: "", category: "cleaning" as ExpenseCategory, amount: "", property: "Toutes", date: "", vat: "20" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: `e${Date.now()}`, label: form.label, category: form.category,
      amount: parseFloat(form.amount), property: form.property,
      date: form.date, vat: parseFloat(form.vat) || undefined,
    });
    onClose();
  };

  const inputCls = "w-full border border-[#DDDDDD] rounded-xl px-3 py-2.5 text-sm text-[#222222] outline-none focus:border-[#FF5A5F]";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDDDDD]">
          <h2 className="font-bold text-[#222222]">Ajouter une dépense</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[#F7F7F7] text-[#717171]">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-[#222222] mb-1.5 block">Description</label>
            <input required value={form.label} onChange={e => setForm({...form, label: e.target.value})} className={inputCls} placeholder="Ex: Ménage Villa Azur" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#222222] mb-1.5 block">Catégorie</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value as ExpenseCategory})} className={inputCls}>
                {Object.entries(EXPENSE_CATS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#222222] mb-1.5 block">Montant (€)</label>
              <input required type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className={inputCls} placeholder="0.00" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#222222] mb-1.5 block">Propriété</label>
              <select value={form.property} onChange={e => setForm({...form, property: e.target.value})} className={inputCls}>
                {["Toutes", "Villa Azur", "Penthouse Côte", "Apt. Bellevue", "Studio Antibes"].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#222222] mb-1.5 block">TVA %</label>
              <select value={form.vat} onChange={e => setForm({...form, vat: e.target.value})} className={inputCls}>
                <option value="">Sans TVA</option>
                <option value="10">10%</option>
                <option value="20">20%</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-[#222222] mb-1.5 block">Date</label>
            <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className={inputCls} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-[#DDDDDD] text-[#222222] font-semibold py-2.5 rounded-xl hover:bg-[#F7F7F7] text-sm">Annuler</button>
            <button type="submit" className="flex-1 bg-[#FF5A5F] hover:bg-[#E00B41] text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">Ajouter</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── P&L Statement ─────────────────────────────────────────────────────────────

function PLStatement({ invoices, expenses }: { invoices: Invoice[]; expenses: Expense[] }) {
  const totalRevenue = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalTva = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.tva, 0);
  const revenueHT = totalRevenue - totalTva;
  const netProfit = revenueHT - totalExpenses;
  const margin = revenueHT > 0 ? ((netProfit / revenueHT) * 100).toFixed(1) : "0";

  const rows = [
    { label: "Revenus bruts (TTC)", value: totalRevenue, color: "text-[#FF5A5F]", bold: true },
    { label: "TVA collectée (20%)", value: -totalTva, color: "text-red-500" },
    { label: "Revenus nets (HT)", value: revenueHT, color: "text-green-600", bold: true },
    { label: "— Charges de ménage", value: -expenses.filter(e => e.category === "cleaning").reduce((s, e) => s + e.amount, 0), color: "text-[#717171]" },
    { label: "— Commissions plateformes", value: -expenses.filter(e => e.category === "platform").reduce((s, e) => s + e.amount, 0), color: "text-[#717171]" },
    { label: "— Maintenance & réparations", value: -expenses.filter(e => e.category === "maintenance").reduce((s, e) => s + e.amount, 0), color: "text-[#717171]" },
    { label: "— Assurance", value: -expenses.filter(e => e.category === "insurance").reduce((s, e) => s + e.amount, 0), color: "text-[#717171]" },
    { label: "— Fournitures & autres", value: -(expenses.filter(e => ["supplies", "other"].includes(e.category)).reduce((s, e) => s + e.amount, 0)), color: "text-[#717171]" },
    { label: "Total charges", value: -totalExpenses, color: "text-red-600", bold: true },
    { label: "Résultat net", value: netProfit, color: netProfit >= 0 ? "text-green-600" : "text-red-600", bold: true, big: true },
  ];

  return (
    <div className="space-y-1">
      {rows.map((r, i) => (
        <div key={i} className={cn("flex justify-between py-1.5", r.big && "border-t-2 border-[#222222] pt-2 mt-1")}>
          <span className={cn("text-sm", r.bold ? "font-bold text-[#222222]" : "text-[#717171]")}>{r.label}</span>
          <span className={cn("text-sm font-bold tabular-nums", r.color, r.big && "text-base")}>
            {r.value >= 0 ? "+" : ""}{r.value.toLocaleString("fr-FR", { minimumFractionDigits: 0 })}€
          </span>
        </div>
      ))}
      <div className="bg-[#F7F7F7] rounded-xl p-3 mt-2">
        <div className="flex justify-between">
          <span className="text-xs font-bold text-[#717171]">Marge nette</span>
          <span className={cn("text-sm font-black", parseFloat(margin) >= 0 ? "text-green-600" : "text-red-600")}>{margin}%</span>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AccountingPage() {
  const [tab, setTab] = useState<"invoices" | "expenses" | "pl">("invoices");
  const [invoices, setInvoices] = useState<Invoice[]>(INVOICES);
  const [expenses, setExpenses] = useState<Expense[]>(EXPENSES);
  const [selectedInv, setSelectedInv] = useState<Invoice | null>(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");
  const [search, setSearch] = useState("");

  // KPI calculations
  const paidInvoices = invoices.filter(i => i.status === "paid");
  const totalRevenue = paidInvoices.reduce((s, i) => s + i.amount, 0);
  const totalTva = paidInvoices.reduce((s, i) => s + i.tva, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalRevenue - totalTva - totalExpenses;
  const pending = invoices.filter(i => i.status === "pending").reduce((s, i) => s + i.amount, 0);
  const overdue = invoices.filter(i => i.status === "overdue").reduce((s, i) => s + i.amount, 0);

  const KPIS = [
    { label: "Revenus perçus", value: `${totalRevenue.toLocaleString("fr-FR")}€`, icon: <Euro size={18} />, color: "text-[#FF5A5F]", bg: "bg-[#FF5A5F]/10", delta: "+17.3%" },
    { label: "Bénéfice net", value: `${netProfit.toLocaleString("fr-FR")}€`, icon: <TrendingUp size={18} />, color: "text-green-600", bg: "bg-green-50", delta: "+22.1%" },
    { label: "En attente", value: `${pending.toLocaleString("fr-FR")}€`, icon: <Clock size={18} />, color: "text-amber-600", bg: "bg-amber-50", delta: `${invoices.filter(i => i.status === "pending").length} factures` },
    { label: "TVA à déclarer", value: `${totalTva.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}€`, icon: <Receipt size={18} />, color: "text-purple-600", bg: "bg-purple-50", delta: "20% du HT" },
  ];

  const filteredInvoices = invoices.filter(i => {
    const q = search.toLowerCase();
    return (statusFilter === "all" || i.status === statusFilter) &&
      (i.guest.toLowerCase().includes(q) || i.property.toLowerCase().includes(q) || i.number.toLowerCase().includes(q));
  });

  const expenseByCategory = Object.entries(EXPENSE_CATS).map(([cat, cfg]) => ({
    ...cfg, cat, total: expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0)
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#222222]">Comptabilité</h1>
          <p className="text-[#717171] text-sm mt-0.5">Factures automatiques · Dépenses · TVA · Compte de résultat</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 border border-[#DDDDDD] rounded-xl px-3 py-2 text-xs font-semibold text-[#717171] hover:bg-[#F7F7F7] transition-colors">
            <Download size={13} /> Exporter
          </button>
          {tab === "expenses" && (
            <button onClick={() => setShowAddExpense(true)} className="flex items-center gap-1.5 bg-[#FF5A5F] hover:bg-[#E00B41] text-white rounded-xl px-4 py-2 text-xs font-bold transition-colors">
              <Plus size={13} /> Ajouter une dépense
            </button>
          )}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {KPIS.map((k, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#DDDDDD] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", k.bg, k.color)}>{k.icon}</div>
              <span className="text-xs font-bold text-green-600">{k.delta}</span>
            </div>
            <div className="text-2xl font-black text-[#222222]">{k.value}</div>
            <div className="text-xs text-[#717171] mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Cash flow + P&L summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-2xl border border-[#DDDDDD] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#222222]">Flux de trésorerie (5 mois)</h3>
            <div className="flex items-center gap-3 text-xs text-[#717171]">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#FF5A5F]/80 rounded-sm inline-block" />Revenus</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-200 rounded-sm inline-block" />Dépenses</span>
            </div>
          </div>
          <CashFlowChart />
          <div className="flex justify-between mt-2">
            {CASH_FLOW.map(m => <span key={m.month} className="text-[10px] text-[#BBBBBB] flex-1 text-center">{m.month}</span>)}
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-[#F7F7F7]">
            {[
              { label: "Revenus cumul", value: `${CASH_FLOW.reduce((s,m) => s+m.income,0).toLocaleString("fr-FR")}€`, color: "text-[#FF5A5F]" },
              { label: "Charges cumul", value: `${CASH_FLOW.reduce((s,m) => s+m.expenses,0).toLocaleString("fr-FR")}€`, color: "text-red-500" },
              { label: "Résultat net", value: `${(CASH_FLOW.reduce((s,m) => s+m.income-m.expenses,0)).toLocaleString("fr-FR")}€`, color: "text-green-600" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className={cn("text-lg font-black", s.color)}>{s.value}</div>
                <div className="text-xs text-[#717171]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#DDDDDD] p-5">
          <h3 className="font-bold text-[#222222] mb-4">Charges par catégorie</h3>
          <div className="space-y-2">
            {expenseByCategory.map((c, i) => {
              const pct = totalExpenses > 0 ? (c.total / totalExpenses) * 100 : 0;
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={cn("font-semibold", c.color)}>{c.label}</span>
                    <span className="font-bold text-[#222222]">{c.total}€</span>
                  </div>
                  <div className="h-1.5 bg-[#F7F7F7] rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", c.bg.replace("bg-", "bg-").replace("-50", "-400"))}
                      style={{ width: `${pct}%`, backgroundColor: undefined }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="pt-2 border-t border-[#F7F7F7]">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-[#222222]">Total</span>
                <span className="font-black text-red-600">{totalExpenses.toLocaleString("fr-FR")}€</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F7F7F7] p-1 rounded-xl w-fit">
        {([
          { id: "invoices", label: "Factures", icon: <FileText size={14} /> },
          { id: "expenses", label: "Dépenses", icon: <Wallet size={14} /> },
          { id: "pl",       label: "Compte de résultat", icon: <BarChart2 size={14} /> },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
              tab === t.id ? "bg-white shadow-sm text-[#222222]" : "text-[#717171] hover:text-[#222222]"
            )}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Invoices tab */}
      {tab === "invoices" && (
        <div className="bg-white rounded-2xl border border-[#DDDDDD] overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-[#DDDDDD] flex-wrap">
            <div className="relative flex-1 max-w-xs">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#BBBBBB]" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
                className="w-full pl-8 pr-3 py-2 bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl text-sm outline-none focus:border-[#FF5A5F] placeholder-[#BBBBBB]" />
            </div>
            <div className="flex gap-1">
              {(["all", "paid", "pending", "overdue", "draft"] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={cn("px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
                    statusFilter === s ? "bg-[#FF5A5F] text-white" : "bg-[#F7F7F7] text-[#717171] hover:bg-[#EEEEEE]"
                  )}>
                  {s === "all" ? "Toutes" : s === "paid" ? "Payées" : s === "pending" ? "En attente" : s === "overdue" ? "En retard" : "Brouillons"}
                </button>
              ))}
            </div>
            <span className="text-xs text-[#BBBBBB] ml-auto">{filteredInvoices.length} facture{filteredInvoices.length > 1 ? "s" : ""}</span>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#DDDDDD]">
                {["N° Facture", "Voyageur", "Propriété", "Période", "Canal", "Montant TTC", "Statut", ""].map((h, i) => (
                  <th key={h} className={cn("px-4 py-3 text-xs font-bold text-[#717171] uppercase tracking-wide", i === 0 ? "text-left" : i < 6 ? "text-left" : "text-right")}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map(inv => {
                const st = STATUS_CFG[inv.status];
                return (
                  <tr key={inv.id} className="border-b border-[#F7F7F7] hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#717171]">{inv.number}</td>
                    <td className="px-4 py-3 font-semibold text-[#222222]">{inv.guest}</td>
                    <td className="px-4 py-3 text-[#717171]">{inv.property}</td>
                    <td className="px-4 py-3 text-xs text-[#717171]">{inv.checkIn} → {inv.checkOut}</td>
                    <td className="px-4 py-3 text-xs text-[#717171]">{inv.channel}</td>
                    <td className="px-4 py-3 font-bold text-[#222222]">{inv.amount.toFixed(2)}€</td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full", st.bg, st.color)}>
                        {st.icon} {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setSelectedInv(inv)}
                        className="flex items-center gap-1 text-xs font-semibold text-[#717171] hover:text-[#FF5A5F] transition-colors">
                        <FileText size={12} /> Voir
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Expenses tab */}
      {tab === "expenses" && (
        <div className="bg-white rounded-2xl border border-[#DDDDDD] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#DDDDDD]">
                {["Date", "Description", "Catégorie", "Propriété", "HT", "TVA", "TTC"].map((h, i) => (
                  <th key={h} className={cn("px-4 py-3 text-xs font-bold text-[#717171] uppercase tracking-wide", i < 4 ? "text-left" : "text-right")}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.map(e => {
                const cat = EXPENSE_CATS[e.category];
                const vatAmt = e.vat ? e.amount * (e.vat / (100 + e.vat)) : 0;
                const ht = e.amount - vatAmt;
                return (
                  <tr key={e.id} className="border-b border-[#F7F7F7] hover:bg-[#FAFAFA]">
                    <td className="px-4 py-3 text-xs text-[#717171]">{e.date}</td>
                    <td className="px-4 py-3 font-medium text-[#222222]">{e.label}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", cat.bg, cat.color)}>{cat.label}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#717171]">{e.property}</td>
                    <td className="px-4 py-3 text-right text-[#717171]">{ht.toFixed(2)}€</td>
                    <td className="px-4 py-3 text-right text-[#717171]">{e.vat ? `${vatAmt.toFixed(2)}€` : "—"}</td>
                    <td className="px-4 py-3 text-right font-bold text-[#222222]">{e.amount.toFixed(2)}€</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-[#F7F7F7] border-t border-[#DDDDDD]">
                <td colSpan={6} className="px-4 py-3 font-bold text-[#222222]">Total dépenses</td>
                <td className="px-4 py-3 text-right font-black text-red-600">{totalExpenses.toFixed(2)}€</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* P&L tab */}
      {tab === "pl" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-[#DDDDDD] p-6">
            <h3 className="font-bold text-[#222222] mb-1">Compte de résultat</h3>
            <p className="text-xs text-[#717171] mb-4">Période : mai 2024</p>
            <PLStatement invoices={invoices} expenses={expenses} />
          </div>
          <div className="bg-white rounded-2xl border border-[#DDDDDD] p-6">
            <h3 className="font-bold text-[#222222] mb-4">Synthèse TVA</h3>
            <div className="space-y-3">
              {[
                { label: "TVA collectée (factures)",    value: `${totalTva.toFixed(2)}€`,      note: "à reverser à l'État",       color: "text-red-600" },
                { label: "TVA déductible (dépenses)",   value: `${(totalExpenses * 0.15).toFixed(2)}€`, note: "à récupérer",        color: "text-green-600" },
                { label: "TVA nette à déclarer",        value: `${(totalTva - totalExpenses * 0.15).toFixed(2)}€`, note: "prochaine déclaration", color: "text-purple-600" },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-[#F7F7F7] rounded-xl">
                  <div>
                    <div className="text-sm font-semibold text-[#222222]">{row.label}</div>
                    <div className="text-xs text-[#717171]">{row.note}</div>
                  </div>
                  <span className={cn("text-lg font-black", row.color)}>{row.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Prochaine déclaration TVA le <strong>31 mai 2024</strong>. Pensez à exporter votre rapport comptable.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedInv && <InvoiceModal inv={selectedInv} onClose={() => setSelectedInv(null)} />}
      {showAddExpense && (
        <AddExpenseModal
          onClose={() => setShowAddExpense(false)}
          onAdd={e => setExpenses(prev => [...prev, e])}
        />
      )}
    </div>
  );
}
