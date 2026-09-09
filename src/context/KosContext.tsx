import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Property,
  Room,
  Tenant,
  Bill,
  Payment,
  Expense,
  AppSettings,
  ActiveMenu,
  ToastMessage,
} from '../types';
import {
  INITIAL_PROPERTIES,
  INITIAL_ROOMS,
  INITIAL_TENANTS,
  INITIAL_BILLS,
  INITIAL_PAYMENTS,
  INITIAL_EXPENSES,
  INITIAL_SETTINGS,
} from '../data/initialData';

interface KosContextType {
  // Navigation
  activeMenu: ActiveMenu;
  setActiveMenu: (menu: ActiveMenu) => void;
  selectedBillForInvoice: Bill | null;
  setSelectedBillForInvoice: (bill: Bill | null) => void;
  openInvoice: (bill: Bill) => void;

  // Data
  properties: Property[];
  rooms: Room[];
  tenants: Tenant[];
  bills: Bill[];
  payments: Payment[];
  expenses: Expense[];
  settings: AppSettings;

  // CRUD Properties
  addProperty: (property: Omit<Property, 'id' | 'createdAt'>) => void;
  updateProperty: (id: string, property: Partial<Property>) => void;
  deleteProperty: (id: string) => void;

  // CRUD Rooms
  addRoom: (room: Omit<Room, 'id'>) => void;
  updateRoom: (id: string, room: Partial<Room>) => void;
  deleteRoom: (id: string) => void;

  // CRUD Tenants
  addTenant: (tenant: Omit<Tenant, 'id' | 'createdAt'>) => void;
  updateTenant: (id: string, tenant: Partial<Tenant>) => void;
  deleteTenant: (id: string) => void;

  // CRUD Bills
  addBill: (bill: Omit<Bill, 'id' | 'createdAt' | 'invoiceNumber'> & { invoiceNumber?: string }) => Bill;
  updateBill: (id: string, bill: Partial<Bill>) => void;
  deleteBill: (id: string) => void;

  // Payments
  recordPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => void;
  updatePayment: (id: string, payment: Partial<Payment>) => void;
  deletePayment: (id: string) => void;

  // CRUD Expenses
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Settings
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  addExpenseCategory: (category: string) => void;
  updateExpenseCategory: (oldCategory: string, newCategory: string) => void;
  deleteExpenseCategory: (category: string) => void;

  // Data Management
  resetAllData: () => void;
  loadSampleData: () => void;
  exportBackupJSON: () => void;
  importBackupJSON: (jsonString: string) => boolean;

  // Notifications / Toasts
  toasts: ToastMessage[];
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
  removeToast: (id: string) => void;

  // Global Dialog Confirmations
  confirmDialog: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  };
  openConfirmDialog: (title: string, message: string, onConfirm: () => void) => void;
  closeConfirmDialog: () => void;
}

const STORAGE_KEY = 'kos_management_database_v1';

const KosContext = createContext<KosContextType | undefined>(undefined);

export const KosProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation state
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>('dashboard');
  const [selectedBillForInvoice, setSelectedBillForInvoice] = useState<Bill | null>(null);

  // Entities state
  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_properties`);
    return saved ? JSON.parse(saved) : INITIAL_PROPERTIES;
  });

  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_rooms`);
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });

  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_tenants`);
    return saved ? JSON.parse(saved) : INITIAL_TENANTS;
  });

  const [bills, setBills] = useState<Bill[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_bills`);
    return saved ? JSON.parse(saved) : INITIAL_BILLS;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_payments`);
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_expenses`);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_properties`, JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_rooms`, JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_tenants`, JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_bills`, JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_payments`, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_expenses`, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
  }, [settings]);

  // Toast Helpers
  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 5);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Confirm dialog helper
  const openConfirmDialog = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  };

  // Open invoice viewer directly
  const openInvoice = (bill: Bill) => {
    setSelectedBillForInvoice(bill);
    setActiveMenu('invoice');
  };

  // Property CRUD
  const addProperty = (newProp: Omit<Property, 'id' | 'createdAt'>) => {
    const id = 'prop-' + Date.now();
    const created: Property = {
      ...newProp,
      id,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setProperties((prev) => [created, ...prev]);
    showToast('success', `Properti "${created.name}" berhasil ditambahkan.`);
  };

  const updateProperty = (id: string, updated: Partial<Property>) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
    showToast('success', 'Data properti berhasil diperbarui.');
  };

  const deleteProperty = (id: string) => {
    const target = properties.find((p) => p.id === id);
    setProperties((prev) => prev.filter((p) => p.id !== id));
    // Also remove associated rooms, or keep them unassigned
    setRooms((prev) => prev.filter((r) => r.propertyId !== id));
    showToast('info', `Properti "${target?.name || ''}" telah dihapus.`);
  };

  // Room CRUD
  const addRoom = (newRoom: Omit<Room, 'id'>) => {
    const id = 'room-' + Date.now();
    const created: Room = { ...newRoom, id };
    setRooms((prev) => [created, ...prev]);
    showToast('success', `Kamar ${created.roomNumber} berhasil ditambahkan.`);
  };

  const updateRoom = (id: string, updated: Partial<Room>) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updated } : r))
    );
    showToast('success', 'Data kamar berhasil diperbarui.');
  };

  const deleteRoom = (id: string) => {
    const target = rooms.find((r) => r.id === id);
    setRooms((prev) => prev.filter((r) => r.id !== id));
    showToast('info', `Kamar ${target?.roomNumber || ''} telah dihapus.`);
  };

  // Tenant CRUD with Room Status synchronization
  const addTenant = (newTenant: Omit<Tenant, 'id' | 'createdAt'>) => {
    const id = 'tenant-' + Date.now();
    const created: Tenant = {
      ...newTenant,
      id,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTenants((prev) => [created, ...prev]);

    // Update room status to 'Terisi' if active
    if (created.roomId && created.status === 'Aktif') {
      setRooms((prev) =>
        prev.map((r) => (r.id === created.roomId ? { ...r, status: 'Terisi' } : r))
      );
    }

    showToast('success', `Penghuni "${created.fullName}" berhasil didaftarkan.`);
  };

  const updateTenant = (id: string, updated: Partial<Tenant>) => {
    const oldTenant = tenants.find((t) => t.id === id);
    setTenants((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
    );

    // If room changed or status changed
    if (oldTenant) {
      const newRoomId = updated.roomId ?? oldTenant.roomId;
      const newStatus = updated.status ?? oldTenant.status;

      if (newRoomId !== oldTenant.roomId) {
        // Free old room
        setRooms((prev) =>
          prev.map((r) => (r.id === oldTenant.roomId ? { ...r, status: 'Kosong' } : r))
        );
        // Fill new room
        if (newStatus === 'Aktif') {
          setRooms((prev) =>
            prev.map((r) => (r.id === newRoomId ? { ...r, status: 'Terisi' } : r))
          );
        }
      } else if (newStatus !== oldTenant.status) {
        if (newStatus === 'Tidak Aktif') {
          setRooms((prev) =>
            prev.map((r) => (r.id === newRoomId ? { ...r, status: 'Kosong' } : r))
          );
        } else if (newStatus === 'Aktif') {
          setRooms((prev) =>
            prev.map((r) => (r.id === newRoomId ? { ...r, status: 'Terisi' } : r))
          );
        }
      }
    }

    showToast('success', 'Data penghuni berhasil diperbarui.');
  };

  const deleteTenant = (id: string) => {
    const target = tenants.find((t) => t.id === id);
    if (target && target.roomId) {
      // Free room
      setRooms((prev) =>
        prev.map((r) => (r.id === target.roomId ? { ...r, status: 'Kosong' } : r))
      );
    }
    setTenants((prev) => prev.filter((t) => t.id !== id));
    showToast('info', `Penghuni "${target?.fullName || ''}" telah dihapus.`);
  };

  // Bill CRUD
  const addBill = (
    newBill: Omit<Bill, 'id' | 'createdAt' | 'invoiceNumber'> & { invoiceNumber?: string }
  ) => {
    const id = 'bill-' + Date.now();
    const invCount = bills.length + 1;
    const invNumber =
      newBill.invoiceNumber ||
      `INV-${new Date().getFullYear()}-${invCount.toString().padStart(4, '0')}`;

    const total =
      (newBill.rentAmount || 0) +
      (newBill.additionalFees || 0) -
      (newBill.discount || 0);

    const created: Bill = {
      ...newBill,
      id,
      invoiceNumber: invNumber,
      totalAmount: Math.max(0, total),
      createdAt: new Date().toISOString().split('T')[0],
    };

    setBills((prev) => [created, ...prev]);
    showToast('success', `Tagihan ${created.invoiceNumber} berhasil dibuat.`);
    return created;
  };

  const updateBill = (id: string, updated: Partial<Bill>) => {
    setBills((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const merged = { ...b, ...updated };
        // Recalculate total if components changed
        if (
          updated.rentAmount !== undefined ||
          updated.additionalFees !== undefined ||
          updated.discount !== undefined
        ) {
          merged.totalAmount = Math.max(
            0,
            (merged.rentAmount || 0) +
              (merged.additionalFees || 0) -
              (merged.discount || 0)
          );
        }
        return merged;
      })
    );
    showToast('success', 'Tagihan berhasil diperbarui.');
  };

  const deleteBill = (id: string) => {
    const target = bills.find((b) => b.id === id);
    setBills((prev) => prev.filter((b) => b.id !== id));
    showToast('info', `Tagihan ${target?.invoiceNumber || ''} dihapus.`);
  };

  // Payment recording
  const recordPayment = (newPay: Omit<Payment, 'id' | 'createdAt'>) => {
    const id = 'pay-' + Date.now();
    const created: Payment = {
      ...newPay,
      id,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPayments((prev) => [created, ...prev]);

    // Automatically mark the bill as 'Lunas'
    if (newPay.billId) {
      setBills((prev) =>
        prev.map((b) =>
          b.id === newPay.billId
            ? {
                ...b,
                status: 'Lunas',
                paidAt: newPay.paymentDate,
                paymentMethod: newPay.method,
              }
            : b
        )
      );
    }

    showToast('success', `Pembayaran ${created.invoiceNumber} sebesar Rp ${created.amount.toLocaleString('id-ID')} berhasil dicatat.`);
  };

  const updatePayment = (id: string, updated: Partial<Payment>) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
    showToast('success', 'Data pembayaran berhasil diperbarui.');
  };

  const deletePayment = (id: string) => {
    const target = payments.find((p) => p.id === id);
    if (!target) return;

    setPayments((prev) => prev.filter((p) => p.id !== id));

    // If payment was tied to a bill, check if any remaining payments exist for this bill
    if (target.billId) {
      const remainingPayments = payments.filter(
        (p) => p.billId === target.billId && p.id !== id
      );
      if (remainingPayments.length === 0) {
        setBills((prev) =>
          prev.map((b) =>
            b.id === target.billId
              ? {
                  ...b,
                  status: 'Belum Dibayar',
                  paidAt: undefined,
                  paymentMethod: undefined,
                }
              : b
          )
        );
      }
    }

    showToast('info', 'Catatan pembayaran dihapus.');
  };

  // Expense CRUD
  const addExpense = (newExp: Omit<Expense, 'id' | 'createdAt'>) => {
    const id = 'exp-' + Date.now();
    const created: Expense = {
      ...newExp,
      id,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setExpenses((prev) => [created, ...prev]);
    showToast('success', `Pengeluaran "${created.description}" berhasil disimpan.`);
  };

  const updateExpense = (id: string, updated: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updated } : e))
    );
    showToast('success', 'Data pengeluaran berhasil diperbarui.');
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showToast('info', 'Catatan pengeluaran dihapus.');
  };

  // Settings
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
      business: { ...prev.business, ...(newSettings.business || {}) },
      payment: { ...prev.payment, ...(newSettings.payment || {}) },
      invoiceTemplate: {
        ...prev.invoiceTemplate,
        ...(newSettings.invoiceTemplate || {}),
      },
    }));
    showToast('success', 'Pengaturan berhasil disimpan.');
  };

  const addExpenseCategory = (category: string) => {
    const trimmed = category.trim();
    if (!trimmed) return;
    if (settings.expenseCategories.includes(trimmed)) {
      showToast('error', 'Kategori tersebut sudah ada.');
      return;
    }
    setSettings((prev) => ({
      ...prev,
      expenseCategories: [...prev.expenseCategories, trimmed],
    }));
    showToast('success', `Kategori "${trimmed}" berhasil ditambahkan.`);
  };

  const updateExpenseCategory = (oldCategory: string, newCategory: string) => {
    const cleanNew = newCategory.trim();
    if (!cleanNew) return;
    if (cleanNew !== oldCategory && settings.expenseCategories.includes(cleanNew)) {
      showToast('error', `Kategori "${cleanNew}" sudah ada.`);
      return;
    }
    setSettings((prev) => ({
      ...prev,
      expenseCategories: prev.expenseCategories.map((c) => (c === oldCategory ? cleanNew : c)),
    }));
    // Also update existing expenses that used oldCategory
    setExpenses((prev) =>
      prev.map((e) => (e.category === oldCategory ? { ...e, category: cleanNew } : e))
    );
    showToast('success', `Kategori diperbarui menjadi "${cleanNew}".`);
  };

  const deleteExpenseCategory = (category: string) => {
    setSettings((prev) => ({
      ...prev,
      expenseCategories: prev.expenseCategories.filter((c) => c !== category),
    }));
    showToast('info', `Kategori "${category}" dihapus.`);
  };

  // Reset & Sample data
  const resetAllData = () => {
    setProperties([]);
    setRooms([]);
    setTenants([]);
    setBills([]);
    setPayments([]);
    setExpenses([]);
    showToast('info', 'Semua data telah dikosongkan.');
  };

  const loadSampleData = () => {
    setProperties(INITIAL_PROPERTIES);
    setRooms(INITIAL_ROOMS);
    setTenants(INITIAL_TENANTS);
    setBills(INITIAL_BILLS);
    setPayments(INITIAL_PAYMENTS);
    setExpenses(INITIAL_EXPENSES);
    setSettings(INITIAL_SETTINGS);
    showToast('success', 'Data sample berhasil dimuat ulang.');
  };

  const exportBackupJSON = () => {
    const backup = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      properties,
      rooms,
      tenants,
      bills,
      payments,
      expenses,
      settings,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_kos_management_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('success', 'File backup JSON berhasil diunduh.');
  };

  const importBackupJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.properties && Array.isArray(data.properties)) setProperties(data.properties);
      if (data.rooms && Array.isArray(data.rooms)) setRooms(data.rooms);
      if (data.tenants && Array.isArray(data.tenants)) setTenants(data.tenants);
      if (data.bills && Array.isArray(data.bills)) setBills(data.bills);
      if (data.payments && Array.isArray(data.payments)) setPayments(data.payments);
      if (data.expenses && Array.isArray(data.expenses)) setExpenses(data.expenses);
      if (data.settings) setSettings(data.settings);
      showToast('success', 'Data berhasil dipulihkan dari file backup.');
      return true;
    } catch {
      showToast('error', 'Format file JSON tidak valid!');
      return false;
    }
  };

  return (
    <KosContext.Provider
      value={{
        activeMenu,
        setActiveMenu,
        selectedBillForInvoice,
        setSelectedBillForInvoice,
        openInvoice,
        properties,
        rooms,
        tenants,
        bills,
        payments,
        expenses,
        settings,
        addProperty,
        updateProperty,
        deleteProperty,
        addRoom,
        updateRoom,
        deleteRoom,
        addTenant,
        updateTenant,
        deleteTenant,
        addBill,
        updateBill,
        deleteBill,
        recordPayment,
        updatePayment,
        deletePayment,
        addExpense,
        updateExpense,
        deleteExpense,
        updateSettings,
        addExpenseCategory,
        updateExpenseCategory,
        deleteExpenseCategory,
        resetAllData,
        loadSampleData,
        exportBackupJSON,
        importBackupJSON,
        toasts,
        showToast,
        removeToast,
        confirmDialog,
        openConfirmDialog,
        closeConfirmDialog,
      }}
    >
      {children}
    </KosContext.Provider>
  );
};

export const useKos = () => {
  const context = useContext(KosContext);
  if (!context) {
    throw new Error('useKos must be used within a KosProvider');
  }
  return context;
};
