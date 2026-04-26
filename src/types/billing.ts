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

export interface PaymentInfo {
  bank: string;
  accountType: string;
  accountNumber: string;
  concept: string;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discountAmount: number;
  discountDescription?: string;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: InvoiceStatus;
  notes?: string;
  companyName?: string;
  companyNit?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  paymentInfo?: PaymentInfo;
  verificationToken?: string;
}

export type PaymentRequestStatus = 'draft' | 'pending' | 'paid' | 'cancelled';

export interface PaymentRequest {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discountAmount: number;
  discountDescription?: string;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: PaymentRequestStatus;
  notes?: string;
  bankName?: string;
  accountType?: string;
  accountNumber?: string;
  companyName?: string;
  companyNit?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
}

export interface BillingStats {
  totalBilled: number;
  pendingAmount: number;
  paidAmount: number;
  overdueAmount: number;
  percentageChange: number;
}
