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
  UserAccount,
  UserRole,
} from '../types';
import {
  INITIAL_PROPERTIES,
  INITIAL_ROOMS,
  INITIAL_TENANTS,
  INITIAL_BILLS,
  INITIAL_PAYMENTS,
  INITIAL_EXPENSES,
  INITIAL_SETTINGS,
  INITIAL_ADMIN_ACCOUNTS,
} from '../data/initialData';

interface KosContextType {
  // Authentication & Roles
  currentUser: UserAccount;
  setCurrentUser: (user: UserAccount) => void;
  adminAccounts: UserAccount[];
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  addAdminAccount: (account: Omit<UserAccount, 'id' | 'createdAt'>) => void;
  updateAdminAccount: (id: string, updated: Partial<UserAccount>) => void;
  deleteAdminAccount: (id: string) => void;
  toggleAdminStatus: (id: string) => void;

  // Navigation
  activeMenu: ActiveMenu;
  setActiveMenu: (menu: ActiveMenu) => void;
  viewingInvoice: Bill | null;
  openInvoice: (bill: Bill) => void;
  closeInvoice: () => void;

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
  resetToInitialData: () => void;
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
  const [viewingInvoice, setViewingInvoice] = useState<Bill | null>(null);

  // User Authentication state
  const [adminAccounts, setAdminAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_admin_accounts`);
    return saved ? JSON.parse(saved) : INITIAL_ADMIN_ACCOUNTS;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_current_user`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_ADMIN_ACCOUNTS[0]; // Default is Owner
  });

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
    localStorage.setItem(`${STORAGE_KEY}_admin_accounts`, JSON.stringify(adminAccounts));
  }, [adminAccounts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_current_user`, JSON.stringify(currentUser));
  }, [currentUser]);

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

  // Invoice view helpers
  const openInvoice = (bill: Bill) => {
    setViewingInvoice(bill);
  };

  const closeInvoice = () => {
    setViewingInvoice(null);
  };

  // Authentication Helpers
  const login = (email: string, pass: string): boolean => {
    const found = adminAccounts.find(
      (acc) => acc.email.toLowerCase() === email.trim().toLowerCase() && acc.password === pass.trim()
    );
    if (found) {
      if (found.status === 'Nonaktif') {
        showToast('error', 'Akun ini sedang dinonaktifkan oleh Owner.');
        return false;
      }
      setCurrentUser(found);
      showToast('success', `Selamat datang kembali, ${found.name} (${found.role})`);
      return true;
    }
    showToast('error', 'Email atau password salah!');
    return false;
  };

  const logout = () => {
    // Switch to default admin or open login
    showToast('info', 'Anda telah keluar dari sesi.');
  };

  const switchRole = (targetRole: UserRole) => {
    const targetUser = adminAccounts.find((a) => a.role === targetRole && a.status === 'Aktif');
    if (targetUser) {
      setCurrentUser(targetUser);
      showToast('info', `Beralih ke mode ${targetRole}: ${targetUser.name}`);
    } else {
      // Create a fallback user of that role
      const fallbackUser: UserAccount = {
        id: `user-${targetRole.toLowerCase()}`,
        name: targetRole === 'OWNER' ? 'Bapak Hendra Pratama (Owner)' : 'Siti Rahma (Admin Operasional)',
        email: `${targetRole.toLowerCase()}@kos.id`,
        role: targetRole,
        phone: settings.business.whatsappNumber || '081803716514',
        status: 'Aktif',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setCurrentUser(fallbackUser);
      showToast('info', `Beralih ke mode ${targetRole}`);
    }
  };

  const addAdminAccount = (newAcc: Omit<UserAccount, 'id' | 'createdAt'>) => {
    const id = 'admin-' + Date.now();
    const created: UserAccount = {
      ...newAcc,
      id,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAdminAccounts((prev) => [...prev, created]);
    showToast('success', `Akun Admin "${created.name}" berhasil dibuat.`);
  };

  const updateAdminAccount = (id: string, updated: Partial<UserAccount>) => {
    setAdminAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, ...updated } : acc))
    );
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...updated }));
    }
    showToast('success', 'Akun admin berhasil diperbarui.');
  };

  const deleteAdminAccount = (id: string) => {
    if (currentUser.id === id) {
      showToast('error', 'Tidak dapat menghapus akun yang sedang aktif digunakan.');
      return;
    }
    const target = adminAccounts.find((a) => a.id === id);
    if (target?.role === 'OWNER') {
      showToast('error', 'Akun Owner utama tidak boleh dihapus.');
      return;
    }
    setAdminAccounts((prev) => prev.filter((a) => a.id !== id));
    showToast('info', `Akun "${target?.name}" telah dihapus.`);
  };

  const toggleAdminStatus = (id: string) => {
    const target = adminAccounts.find((a) => a.id === id);
    if (!target) return;
    if (target.role === 'OWNER') {
      showToast('error', 'Status akun Owner tidak dapat dinonaktifkan.');
      return;
    }
    const nextStatus = target.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
    updateAdminAccount(id, { status: nextStatus });
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

      // If room changed, free old room
      if (oldTenant.roomId && oldTenant.roomId !== newRoomId) {
        setRooms((prev) =>
          prev.map((r) => (r.id === oldTenant.roomId ? { ...r, status: 'Kosong' } : r))
        );
      }

      // If inactive, free room
      if (newStatus === 'Tidak Aktif' && newRoomId) {
        setRooms((prev) =>
          prev.map((r) => (r.id === newRoomId ? { ...r, status: 'Kosong' } : r))
        );
      } else if (newStatus === 'Aktif' && newRoomId) {
        setRooms((prev) =>
          prev.map((r) => (r.id === newRoomId ? { ...r, status: 'Terisi' } : r))
        );
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

  // Bill CRUD - Automatic sequential invoice number: INV-0001, INV-0002...
  const addBill = (
    newBill: Omit<Bill, 'id' | 'createdAt' | 'invoiceNumber'> & { invoiceNumber?: string }
  ) => {
    const id = 'bill-' + Date.now();
    const nextSeq = bills.length + 1;
    const autoInvNumber = `INV-${nextSeq.toString().padStart(4, '0')}`;
    const invNumber = newBill.invoiceNumber || autoInvNumber;

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
        // Never change existing invoiceNumber when editing
        const safeUpdated = { ...updated };
        delete safeUpdated.invoiceNumber;

        const merged = { ...b, ...safeUpdated };
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
    // Also remove associated payments if any
    setPayments((prev) => prev.filter((p) => p.billId !== id));
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

    showToast('success', `Pembayaran ${created.invoiceNumber} berhasil dicatat.`);
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

    // Revert bill status back to 'Belum Dibayar' if this payment was linked to a bill
    if (target.billId) {
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

    showToast('info', `Pembayaran ${target.invoiceNumber} telah dihapus.`);
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
    showToast('success', `Pengeluaran ${created.category} berhasil dicatat.`);
  };

  const updateExpense = (id: string, updated: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updated } : e))
    );
    showToast('success', 'Data pengeluaran berhasil diperbarui.');
  };

  const deleteExpense = (id: string) => {
    const target = expenses.find((e) => e.id === id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showToast('info', `Pengeluaran "${target?.description || ''}" telah dihapus.`);
  };

  // Settings & Category CRUD
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
      business: {
        ...prev.business,
        ...(newSettings.business || {}),
      },
      payment: {
        ...prev.payment,
        ...(newSettings.payment || {}),
      },
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
    setAdminAccounts(INITIAL_ADMIN_ACCOUNTS);
    showToast('success', 'Data sample berhasil dimuat ulang.');
  };

  const resetToInitialData = () => {
    loadSampleData();
  };

  const exportBackupJSON = () => {
    const backup = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      properties,
      rooms,
      tenants,
      bills,
      payments,
      expenses,
      settings,
      adminAccounts,
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
      if (data.adminAccounts && Array.isArray(data.adminAccounts)) setAdminAccounts(data.adminAccounts);
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
        currentUser,
        setCurrentUser,
        adminAccounts,
        login,
        logout,
        switchRole,
        addAdminAccount,
        updateAdminAccount,
        deleteAdminAccount,
        toggleAdminStatus,
        activeMenu,
        setActiveMenu,
        viewingInvoice,
        openInvoice,
        closeInvoice,
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
        resetToInitialData,
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
