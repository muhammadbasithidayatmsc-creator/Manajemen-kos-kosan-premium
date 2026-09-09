export type RoomStatus = 'Kosong' | 'Terisi' | 'Booking' | 'Maintenance';
export type TenantStatus = 'Aktif' | 'Tidak Aktif';
export type BillStatus = 'Belum Dibayar' | 'Lunas' | 'Terlambat';
export type PaymentMethod = 'Transfer Bank' | 'Cash' | 'Lainnya';

export interface Property {
  id: string;
  name: string;
  address: string;
  contactNumber: string;
  description: string;
  roomCount?: number;
  status: 'Aktif' | 'Nonaktif';
  createdAt: string;
}

export interface Room {
  id: string;
  propertyId: string;
  roomNumber: string;
  type: string; // e.g. Standard, Deluxe, VIP
  monthlyPrice: number;
  status: RoomStatus;
  facilities: string[];
  notes?: string;
}

export interface Tenant {
  id: string;
  fullName: string;
  whatsappNumber: string;
  nik: string;
  address: string; // asal kota/alamat KTP
  propertyId: string;
  roomId: string;
  monthlyRent: number;
  entryDate: string; // YYYY-MM-DD
  dueDateDay: number; // 1 - 31
  status: TenantStatus;
  notes?: string;
  emergencyContact?: string;
  createdAt: string;
}

export interface Bill {
  id: string;
  invoiceNumber: string; // e.g. INV-2026-0001
  tenantId: string;
  propertyId: string;
  roomId: string;
  period: string; // e.g. "September 2026"
  billDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  rentAmount: number;
  additionalFees: number;
  additionalFeesNotes?: string;
  discount: number;
  totalAmount: number;
  notes?: string;
  status: BillStatus;
  paidAt?: string;
  paymentMethod?: PaymentMethod;
  createdAt: string;
}

export interface Payment {
  id: string;
  billId?: string;
  invoiceNumber: string;
  tenantId: string;
  propertyId: string;
  roomId: string;
  paymentDate: string; // YYYY-MM-DD
  amount: number;
  method: PaymentMethod;
  notes?: string;
  receiptProof?: string;
  createdAt: string;
}

export type ExpenseCategory =
  | 'Listrik'
  | 'Air'
  | 'WiFi'
  | 'Internet'
  | 'Kebersihan'
  | 'Perbaikan'
  | 'Gaji Karyawan'
  | 'Gaji'
  | 'Perlengkapan'
  | 'Perawatan'
  | 'Operasional'
  | 'Lain-lain'
  | 'Lainnya';

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  propertyId: string; // can be 'all' or propertyId
  category: ExpenseCategory | string;
  description: string;
  amount: number;
  notes?: string;
  createdAt: string;
}

export interface BusinessIdentity {
  businessName: string;
  kosName?: string;
  ownerName: string;
  whatsappNumber: string;
  ownerPhone?: string;
  address: string;
  city?: string;
  email?: string;
  logoText?: string;
  description?: string;
}

export interface PaymentSettings {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  additionalBankInfo?: string;
  notes?: string;
}

export interface InvoiceTemplateSettings {
  invoiceTitle?: string;
  notes: string;
  footerNote: string;
  paymentInfoTitle?: string;
}

export interface AppSettings {
  business: BusinessIdentity;
  payment: PaymentSettings;
  invoiceTemplate: InvoiceTemplateSettings;
  expenseCategories: string[];
}

export type ActiveMenu =
  | 'dashboard'
  | 'properties'
  | 'rooms'
  | 'tenants'
  | 'bills'
  | 'payments'
  | 'expenses'
  | 'reports'
  | 'invoice'
  | 'settings';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
