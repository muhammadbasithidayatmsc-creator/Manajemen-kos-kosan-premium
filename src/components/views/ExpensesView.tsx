import React, { useState, useEffect } from 'react';
import { useKos } from '../../context/KosContext';
import { Expense, ExpenseCategory } from '../../types';
import {
  TrendingDown,
  Plus,
  Edit2,
  Trash2,
  Search,
  Download,
  Calendar,
  Building2,
  X,
  Tag,
  Zap,
  Droplets,
  Wifi,
  Sparkles,
  Wrench,
  UserCheck,
  Package,
  Layers,
  Settings2,
  Check,
} from 'lucide-react';
import {
  formatRupiah,
  formatDateIndo,
  exportToCSV,
} from '../../utils/formatters';

export interface ExpensesViewProps {
  autoOpenAddModal?: boolean;
  onClearAutoOpenModal?: () => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  autoOpenAddModal,
  onClearAutoOpenModal,
}) => {
  const {
    expenses,
    properties,
    settings,
    addExpense,
    updateExpense,
    deleteExpense,
    addExpenseCategory,
    updateExpenseCategory,
    deleteExpenseCategory,
    openConfirmDialog,
  } = useKos();

  const categories = settings.expenseCategories || [
    'Listrik',
    'Air',
    'WiFi',
    'Kebersihan',
    'Perbaikan',
    'Gaji Karyawan',
    'Perlengkapan',
    'Lain-lain',
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Manage Category Modal State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryOldName, setEditingCategoryOldName] = useState<string | null>(null);
  const [editingCategoryNewName, setEditingCategoryNewName] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    propertyId: '',
    category: (categories[0] || 'Listrik') as ExpenseCategory,
    date: new Date().toISOString().split('T')[0],
    amount: 100000,
    description: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setFormData({
      propertyId: properties[0]?.id || '',
      category: categories[0] || 'Listrik',
      date: new Date().toISOString().split('T')[0],
      amount: 150000,
      description: '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  useEffect(() => {
    if (autoOpenAddModal) {
      handleOpenAdd();
      if (onClearAutoOpenModal) onClearAutoOpenModal();
    }
  }, [autoOpenAddModal]);

  const handleOpenEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      propertyId: expense.propertyId,
      category: expense.category,
      date: expense.date,
      amount: expense.amount,
      description: expense.description,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleDelete = (expense: Expense) => {
    openConfirmDialog(
      'Hapus Catatan Pengeluaran',
      `Apakah Anda yakin ingin menghapus pengeluaran "${expense.category} - ${formatRupiah(expense.amount)}"?`,
      () => deleteExpense(expense.id)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.propertyId) errors.propertyId = 'Pilih properti';
    if (!formData.amount || formData.amount <= 0) {
      errors.amount = 'Nominal pengeluaran harus lebih dari 0';
    }
    if (!formData.description.trim()) {
      errors.description = 'Keterangan pengeluaran wajib diisi';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      propertyId: formData.propertyId,
      category: formData.category,
      date: formData.date,
      amount: Number(formData.amount),
      description: formData.description.trim(),
    };

    if (editingExpense) {
      updateExpense(editingExpense.id, payload);
    } else {
      addExpense(payload);
    }
    setModalOpen(false);
  };

  // Category CRUD Handlers
  const handleAddNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) {
      alert('Kategori dengan nama tersebut sudah ada.');
      return;
    }
    addExpenseCategory(trimmed);
    setNewCategoryName('');
  };

  const handleSaveEditCategory = (oldName: string) => {
    const trimmed = editingCategoryNewName.trim();
    if (!trimmed || trimmed === oldName) {
      setEditingCategoryOldName(null);
      return;
    }
    updateExpenseCategory(oldName, trimmed);
    setEditingCategoryOldName(null);
    setEditingCategoryNewName('');
  };

  const handleDeleteCategory = (catName: string) => {
    const relatedCount = expenses.filter((e) => e.category === catName).length;
    openConfirmDialog(
      'Hapus Kategori Pengeluaran',
      relatedCount > 0
        ? `Kategori "${catName}" digunakan pada ${relatedCount} catatan pengeluaran. Jika dihapus, catatan tersebut akan dialihkan ke "Lain-lain". Apakah Anda yakin?`
        : `Apakah Anda yakin ingin menghapus kategori "${catName}"?`,
      () => deleteExpenseCategory(catName)
    );
  };

  const handleExportCSV = () => {
    const headers = ['Tanggal', 'Kategori', 'Properti', 'Keterangan', 'Nominal'];
    const rows = filteredExpenses.map((exp) => {
      const prop = properties.find((p) => p.id === exp.propertyId);
      return [
        exp.date,
        exp.category,
        prop?.name || '-',
        exp.description,
        exp.amount,
      ];
    });

    exportToCSV(`pengeluaran_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Listrik':
        return <Zap className="w-3.5 h-3.5 text-amber-500" />;
      case 'Air':
        return <Droplets className="w-3.5 h-3.5 text-sky-500" />;
      case 'WiFi':
      case 'Internet':
        return <Wifi className="w-3.5 h-3.5 text-indigo-500" />;
      case 'Kebersihan':
        return <Sparkles className="w-3.5 h-3.5 text-emerald-500" />;
      case 'Perbaikan':
      case 'Renovasi':
        return <Wrench className="w-3.5 h-3.5 text-orange-500" />;
      case 'Gaji Karyawan':
      case 'Gaji':
        return <UserCheck className="w-3.5 h-3.5 text-purple-500" />;
      case 'Perlengkapan':
        return <Package className="w-3.5 h-3.5 text-blue-500" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const filteredExpenses = expenses.filter((exp) => {
    const matchSearch = exp.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory =
      selectedCategoryFilter === 'all' || exp.category === selectedCategoryFilter;
    const matchProperty =
      selectedPropertyFilter === 'all' || exp.propertyId === selectedPropertyFilter;

    return matchSearch && matchCategory && matchProperty;
  });

  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Pengeluaran & Biaya Operasional
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pencatatan biaya listrik, air, internet, perbaikan kamar, dan operasional kos
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Kelola Kategori Button */}
          <button
            id="btn-manage-categories"
            onClick={() => setCategoryModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm shadow-2xs transition-colors"
          >
            <Settings2 className="w-4 h-4 text-slate-500" />
            <span>Kelola Kategori</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            id="btn-add-expense"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Catat Pengeluaran</span>
          </button>
        </div>
      </div>

      {/* Expense Summary Header */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-900 text-white rounded-3xl p-6 border border-rose-900 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <span className="text-xs text-rose-300 font-bold uppercase tracking-wider block">
            Total Biaya Pengeluaran
          </span>
          <span className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
            {formatRupiah(totalFilteredAmount)}
          </span>
          <p className="text-xs text-rose-200/80 mt-1">
            Dari {filteredExpenses.length} catatan transaksi operasional terfilter
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {categories.slice(0, 5).map((c) => {
            const sumForCat = filteredExpenses
              .filter((e) => e.category === c)
              .reduce((s, e) => s + e.amount, 0);
            if (sumForCat === 0) return null;
            return (
              <span
                key={c}
                className="px-3 py-1.5 rounded-xl bg-white/10 text-white border border-white/15 font-semibold backdrop-blur-sm"
              >
                {c}: {formatRupiah(sumForCat)}
              </span>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-expenses"
            type="text"
            placeholder="Cari keterangan pengeluaran..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:bg-white focus:border-rose-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="w-full md:w-auto flex flex-wrap sm:flex-nowrap items-center gap-2">
          {/* Filter Property */}
          <select
            value={selectedPropertyFilter}
            onChange={(e) => setSelectedPropertyFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 outline-none"
          >
            <option value="all">Semua Properti</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Filter Category */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 outline-none"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredExpenses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
          <TrendingDown className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Tidak ada catatan pengeluaran</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery || selectedCategoryFilter !== 'all'
              ? 'Coba sesuaikan kata kunci atau filter yang Anda pilih.'
              : 'Belum ada pengeluaran operasional yang dicatat.'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Catat Pengeluaran Pertama</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Tanggal</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">Properti</th>
                  <th className="py-3.5 px-4">Keterangan Biaya</th>
                  <th className="py-3.5 px-4">Nominal</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredExpenses.map((exp) => {
                  const property = properties.find((p) => p.id === exp.propertyId);
                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {formatDateIndo(exp.date)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                          {getCategoryIcon(exp.category)}
                          {exp.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {property?.name || '-'}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs">
                        {exp.description}
                      </td>

                      <td className="py-3.5 px-4 font-black text-rose-600 font-mono">
                        {formatRupiah(exp.amount)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(exp)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit Pengeluaran"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(exp)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                            title="Hapus Pengeluaran"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Kelola Kategori Pengeluaran */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-indigo-600" />
                  Kelola Kategori Pengeluaran
                </h3>
                <p className="text-xs text-slate-500">
                  Tambah, ubah nama, atau hapus kategori biaya operasional
                </p>
              </div>
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Tambah Kategori Baru */}
            <form onSubmit={handleAddNewCategory} className="mt-4 flex items-center gap-2">
              <input
                type="text"
                placeholder="Nama kategori baru (misal: PBB, Iuran RW)..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-colors shadow-xs"
              >
                + Tambah
              </button>
            </form>

            {/* List Kategori Saat Ini */}
            <div className="mt-5 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Daftar Kategori Aktif ({categories.length})
              </span>

              <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden max-h-64 overflow-y-auto">
                {categories.map((cat) => {
                  const isEditing = editingCategoryOldName === cat;

                  return (
                    <div
                      key={cat}
                      className="p-3 bg-white flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                    >
                      {isEditing ? (
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={editingCategoryNewName}
                            onChange={(e) => setEditingCategoryNewName(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 rounded-lg border border-indigo-300 text-xs font-semibold focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditCategory(cat)}
                            className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                            title="Simpan"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCategoryOldName(null)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                            title="Batal"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(cat)}
                            <span className="text-xs sm:text-sm font-semibold text-slate-800">
                              {cat}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ({expenses.filter((e) => e.category === cat).length} catatan)
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCategoryOldName(cat);
                                setEditingCategoryNewName(cat);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="Edit Nama Kategori"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Hapus Kategori"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Catat / Edit Pengeluaran */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingExpense ? 'Edit Pengeluaran' : 'Catat Pengeluaran Operasional'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Properti Kos <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.propertyId}
                  onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500 outline-none bg-white"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {formErrors.propertyId && (
                  <p className="text-xs text-rose-500 mt-1">{formErrors.propertyId}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Kategori Biaya <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setModalOpen(false);
                      setCategoryModalOpen(true);
                    }}
                    className="text-[11px] text-indigo-600 hover:underline font-medium"
                  >
                    + Kelola Kategori
                  </button>
                </div>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as ExpenseCategory })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500 outline-none bg-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Pengeluaran <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nominal Biaya (Rp) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="10000"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: Number(e.target.value) })
                  }
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-rose-500 outline-none font-mono font-bold ${
                    formErrors.amount ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  }`}
                />
                {formErrors.amount && (
                  <p className="text-xs text-rose-500 mt-1">{formErrors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan Biaya <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Beli token listrik utama 200rb, ganti kran air kamar B03..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-rose-500 outline-none ${
                    formErrors.description
                      ? 'border-rose-400 bg-rose-50/30'
                      : 'border-slate-200'
                  }`}
                />
                {formErrors.description && (
                  <p className="text-xs text-rose-500 mt-1">{formErrors.description}</p>
                )}
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-sm font-bold shadow-md shadow-rose-600/20 transition-all"
                >
                  {editingExpense ? 'Simpan Perubahan' : 'Catat Pengeluaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
