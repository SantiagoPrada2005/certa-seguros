export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'draft';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  taxId?: string; // NIT/RUT
  address?: string;
  phone?: string;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  clientName: string; // Denormalized for easy display
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discountAmount: number;
  discountDescription?: string;
  taxRate: number; // e.g., 0.19 for 19% IVA
  taxAmount: number;
  total: number;
  status: InvoiceStatus;
  notes?: string;
}

export interface BillingStats {
  totalBilled: number;
  pendingAmount: number;
  paidAmount: number;
  overdueAmount: number;
  percentageChange: number;
}
