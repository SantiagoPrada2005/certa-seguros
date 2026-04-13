/**
 * api-client.ts
 * Typed fetch helpers used by Client Components to call the REST API.
 * Server Components should query Prisma directly instead of calling these.
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ─── Clients ─────────────────────────────────────────────────────────────────

export interface ClientRecord {
  id: string;
  name: string;
  type: "INDIVIDUAL" | "BUSINESS";
  documentType: string | null;
  documentNumber: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: string;
  source: string | null;
  createdAt: string;
  services: {
    service: { name: string };
  }[];
}

export async function fetchClients(params?: {
  status?: string;
  search?: string;
}): Promise<ClientRecord[]> {
  const url = new URL(`${BASE_URL}/api/clients`);
  if (params?.status && params.status !== "all") url.searchParams.set("status", params.status);
  if (params?.search) url.searchParams.set("search", params.search);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Error fetching clients");
  return res.json();
}

// ─── Services ────────────────────────────────────────────────────────────────

export interface ServiceRecord {
  id: string;
  name: string;
  description: string | null;
  validityType: string | null;
  price: number | null;
  priceDescription: string | null;
  isActive: boolean;
  subcategoryId: string | null;
  subcategory: {
    id: string;
    name: string;
    category: { id: string; name: string };
  } | null;
}

export async function fetchServices(params?: {
  grouped?: boolean;
}): Promise<ServiceRecord[]> {
  const url = new URL(`${BASE_URL}/api/services`);
  if (params?.grouped) url.searchParams.set("grouped", "true");
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Error fetching services");
  return res.json();
}

export async function updateService(
  id: string,
  data: {
    price?: number | null;
    priceDescription?: string | null;
    name?: string;
    description?: string;
    validityType?: string;
    isActive?: boolean;
    subcategoryId?: string;
  }
): Promise<ServiceRecord> {
  const url = new URL(`${BASE_URL}/api/services?id=${id}`);
  const res = await fetch(url.toString(), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    cache: "no-store",
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Error updating service" }));
    throw new Error(error.error || "Error updating service");
  }
  return res.json();
}

// ─── Invoices ────────────────────────────────────────────────────────────────

export interface InvoiceRecord {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  subtotal: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: "DRAFT" | "PENDING" | "PAID" | "OVERDUE";
  notes: string | null;
  clientId: string;
  client: { id: string; name: string; email: string | null };
  items?: { id: string; description: string; quantity: number; unitPrice: number; total: number }[];
}

export async function fetchInvoices(params?: {
  status?: string;
}): Promise<InvoiceRecord[]> {
  const url = new URL(`${BASE_URL}/api/invoices`);
  if (params?.status && params.status !== "all") url.searchParams.set("status", params.status);
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Error fetching invoices");
  return res.json();
}

// ─── Reminders ───────────────────────────────────────────────────────────────

export interface ReminderRecord {
  id: string;
  type: string;
  priority: string;
  status: string;
  dueDate: string;
  description: string | null;
  clientId: string;
  client: { id: string; name: string };
  createdAt: string;
}

export async function fetchReminders(params?: {
  status?: string;
}): Promise<ReminderRecord[]> {
  const url = new URL(`${BASE_URL}/api/reminders`);
  if (params?.status && params.status !== "all") url.searchParams.set("status", params.status);
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Error fetching reminders");
  return res.json();
}

// ─── Goals ───────────────────────────────────────────────────────────────────

export interface GoalRecord {
  id: string;
  name: string;
  description: string | null;
  category: string;
  period: string;
  targetValue: number;
  currentValue: number;
  status: string;
  trend: number;
  unit: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  milestones: { id: string; label: string; value: number; reached: boolean }[];
}

export async function fetchGoals(params?: {
  category?: string;
  period?: string;
}): Promise<GoalRecord[]> {
  const url = new URL(`${BASE_URL}/api/goals`);
  if (params?.category && params.category !== "all") url.searchParams.set("category", params.category);
  if (params?.period && params.period !== "all") url.searchParams.set("period", params.period);
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Error fetching goals");
  return res.json();
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export interface DashboardStats {
  feed: {
    id: string;
    action: string;
    type: string;
    createdAt: string;
    client: { name: string; type: string } | null;
  }[];
  stats: {
    totalClients: number;
    activePolicies: number;
    monthlyRevenue: number;
    pendingReminders: number;
  };
}

export async function fetchDashboardStats(limit = 6): Promise<DashboardStats> {
  const url = new URL(`${BASE_URL}/api/dashboard/stats`);
  url.searchParams.set("limit", String(limit));
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Error fetching dashboard stats");
  return res.json();
}
