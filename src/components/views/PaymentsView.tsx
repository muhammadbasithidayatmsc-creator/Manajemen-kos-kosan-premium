import React, { useState, useEffect } from 'react';
import { useKos } from '../../context/KosContext';
import { Payment, PaymentMethod } from '../../types';
import {
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  Search,
  Download,
  Calendar,
  CheckCircle2,
  X,
  Receipt,
  FileText,
  Upload,
  Image as ImageIcon,
  Eye,
} from 'lucide-react';
import {
  formatRupiah,
  formatDateIndo,
  exportToCSV,
} from '../../utils/formatters';

interface PaymentsViewProps {
  autoOpenAddModal?: boolean;
  onClearAutoOpenModal?: () => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  autoOpenAddModal,
  onClearAutoOpenModal,
}) => {
  const {
    payments,
    bills,
    tenants,
    properties,
    rooms,
    recordPayment,
    updatePayment,
    deletePayment,
    openConfirmDialog,
    openInvoice,
  } = useKos();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethodFilter, setSelectedMethodFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    billId: '',
    paymentDate: new Date().toISOString().split('T')[0],
    amount: 1000000,
    method: 'Transfer Bank' as PaymentMethod,
    notes: '',
    receiptProof: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Receipt preview modal state
  const [previewProof, setPreviewProof] = useState<string | null>(null);

  // Unpaid or partially paid bills for dropdown
  const unpaidBills = bills.filter(
    (b) => b.status === 'Belum Dibayar' || b.status === 'Terlambat'
  );

  const handleOpenAdd = () => {
    setEditingPayment(null);
    const firstUnpaid = unpaidBills[0] || bills[0];
    setFormData({
      billId: firstUnpaid?.id || '',
      paymentDate: new Date().toISOString().split('T')[0],
      amount: firstUnpaid ? firstUnpaid.totalAmount : 1200000,
      method: 'Transfer Bank',
      notes: firstUnpaid ? `Pembayaran tagihan ${firstUnpaid.invoiceNumber}` : '',
      receiptProof: '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      billId: payment.billId || '',
      paymentDate: payment.paymentDate,
      amount: payment.amount,
      method: payment.method,
      notes: payment.notes || '',
      receiptProof: payment.receiptProof || '',
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

  const handleBillSelect = (billId: string) => {
    const selected = bills.find((b) => b.id === billId);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        billId,
        amount: selected.totalAmount,
        notes: `Pelunasan tagihan ${selected.invoiceNumber} (${selected.period})`,
      }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size < 2MB
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      setFormData((prev) => ({
        ...prev,
        receiptProof: result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.billId && !editingPayment) {
      errors.billId = 'Pilih tagihan yang dibayar';
    }
    if (!formData.amount || formData.amount <= 0) {
      errors.amount = 'Nominal pembayaran harus lebih dari 0';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const bill = bills.find((b) => b.id === formData.billId);

    if (editingPayment) {
      updatePayment(editingPayment.id, {
        paymentDate: formData.paymentDate,
        amount: Number(formData.amount),
        method: formData.method,
        notes: formData.notes.trim(),
        receiptProof: formData.receiptProof,
        ...(bill
          ? {
              billId: bill.id,
              invoiceNumber: bill.invoiceNumber,
              tenantId: bill.tenantId,
              propertyId: bill.propertyId,
              roomId: bill.roomId,
            }
          : {}),
      });
    } else {
      if (!bill) return;
      recordPayment({
        billId: bill.id,
        invoiceNumber: bill.invoiceNumber,
        tenantId: bill.tenantId,
        propertyId: bill.propertyId,
        roomId: bill.roomId,
        paymentDate: formData.paymentDate,
        amount: Number(formData.amount),
        method: formData.method,
        notes: formData.notes.trim(),
        receiptProof: formData.receiptProof,
      });
    }

    setModalOpen(false);
  };

  const handleDelete = (payment: Payment) => {
    openConfirmDialog(
      'Hapus Catatan Pembayaran',
      `Apakah Anda yakin ingin menghapus catatan pembayaran invoice "${payment.invoiceNumber}" sebesar ${formatRupiah(payment.amount)}? Perhitungan keuangan dan status tagihan akan otomatis diperbarui.`,
      () => deletePayment(payment.id)
    );
  };

  const handleExportCSV = () => {
    const headers = [
      'No. Invoice',
      'Penghuni',
      'Properti',
      'Kamar',
      'Tanggal Bayar',
      'Nominal',
      'Metode',
      'Catatan',
    ];

    const rows = filteredPayments.map((p) => {
      const t = tenants.find((item) => item.id === p.tenantId);
      const prop = properties.find((item) => item.id === p.propertyId);
      const r = rooms.find((item) => item.id === p.roomId);
      return [
        p.invoiceNumber,
        t?.fullName || '-',
        prop?.name || '-',
        r?.roomNumber || '-',
        p.paymentDate,
        p.amount,
        p.method,
        p.notes || '',
      ];
    });

    exportToCSV(`catatan_pembayaran_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  const filteredPayments = payments.filter((p) => {
    const tenant = tenants.find((t) => t.id === p.tenantId);
    const matchSearch =
      p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tenant && tenant.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.notes && p.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchMethod =
      selectedMethodFilter === 'all' || p.method === selectedMethodFilter;

    return matchSearch && matchMethod;
  });

  const totalPaymentsAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Pencatatan Pembayaran Sewa
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola data pelunasan sewa kamar, metode bayar, dan bukti transaksi
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs sm:text-sm font-semibold text-slate-700 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            id="btn-add-payment"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Catat Pembayaran</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Dana Masuk
          </span>
          <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">
            {formatRupiah(totalPaymentsAmount)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Dari {filteredPayments.length} transaksi yang dicatat
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Tagihan Menunggu Bayar
          </span>
          <div className="text-2xl font-black text-amber-600 mt-1 font-mono">
            {unpaidBills.length} Tagihan
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Perlu konfirmasi atau penagihan via WA
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Metode Pembayaran
          </span>
          <div className="text-base font-bold text-slate-800 mt-1.5 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-xs font-semibold">
              Transfer Bank
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-xs font-semibold">
              Cash / Tunai
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Fleksibel sesuai preferensi penyewa
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-payments"
            type="text"
            placeholder="Cari invoice, penghuni, catatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 transition-colors"
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

        <div className="w-full md:w-auto flex items-center gap-2.5">
          <select
            id="filter-payment-method"
            value={selectedMethodFilter}
            onChange={(e) => setSelectedMethodFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 outline-none"
          >
            <option value="all">Semua Metode Pembayaran</option>
            <option value="Transfer Bank">Transfer Bank</option>
            <option value="Cash">Cash / Tunai</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredPayments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
          <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Tidak ada riwayat pembayaran</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'Coba sesuaikan kata kunci pencarian atau filter Anda.'
              : 'Belum ada pembayaran sewa yang dicatat.'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Catat Pembayaran Sekarang</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">No. Invoice</th>
                  <th className="py-3.5 px-4">Penghuni & Kamar</th>
                  <th className="py-3.5 px-4">Tanggal Pembayaran</th>
                  <th className="py-3.5 px-4">Nominal Diterima</th>
                  <th className="py-3.5 px-4">Metode</th>
                  <th className="py-3.5 px-4">Bukti Transaksi</th>
                  <th className="py-3.5 px-4">Catatan</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPayments.map((p) => {
                  const t = tenants.find((item) => item.id === p.tenantId);
                  const prop = properties.find((item) => item.id === p.propertyId);
                  const r = rooms.find((item) => item.id === p.roomId);
                  const bill = bills.find(
                    (b) => b.id === p.billId || b.invoiceNumber === p.invoiceNumber
                  );

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                        {p.invoiceNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{t?.fullName || '-'}</div>
                        <div className="text-xs text-slate-500">
                          {prop?.name} • Kamar {r?.roomNumber || '-'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {formatDateIndo(p.paymentDate)}
                      </td>

                      <td className="py-3.5 px-4 font-black text-emerald-600 font-mono">
                        {formatRupiah(p.amount)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {p.method}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {p.receiptProof ? (
                          <button
                            onClick={() => setPreviewProof(p.receiptProof || null)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors"
                          >
                            <ImageIcon className="w-3 h-3" />
                            <span>Lihat Bukti</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs italic">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate">
                        {p.notes || '-'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {bill && (
                            <button
                              onClick={() => openInvoice(bill)}
                              className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors"
                              title="Buka Invoice Resmi"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit Catatan Pembayaran"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(p)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                            title="Hapus Catatan Pembayaran"
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

      {/* Modal Bukti Transaksi */}
      {previewProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                Bukti Pembayaran / Transfer
              </h3>
              <button
                onClick={() => setPreviewProof(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto flex items-center justify-center rounded-xl bg-slate-50 p-2">
              <img
                src={previewProof}
                alt="Bukti Transfer"
                className="max-h-80 max-w-full rounded-lg object-contain shadow-xs"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setPreviewProof(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Catat / Edit Pembayaran */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingPayment ? 'Edit Catatan Pembayaran' : 'Catat Pembayaran Sewa'}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingPayment
                    ? `Perbarui rincian pelunasan invoice ${editingPayment.invoiceNumber}`
                    : 'Input dana masuk sewa dari penghuni kos'}
                </p>
              </div>
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
                  Pilih Tagihan / Invoice <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.billId}
                  onChange={(e) => handleBillSelect(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white ${
                    formErrors.billId ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  }`}
                >
                  <option value="">-- Pilih Tagihan --</option>
                  {bills.map((b) => {
                    const t = tenants.find((item) => item.id === b.tenantId);
                    return (
                      <option key={b.id} value={b.id}>
                        {b.invoiceNumber} - {t?.fullName} ({formatRupiah(b.totalAmount)}) [{b.status}]
                      </option>
                    );
                  })}
                </select>
                {formErrors.billId && (
                  <p className="text-xs text-rose-500 mt-1">{formErrors.billId}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Pembayaran <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nominal Diterima (Rp) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="50000"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-mono font-bold"
                />
                {formErrors.amount && (
                  <p className="text-xs text-rose-500 mt-1">{formErrors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Metode Pembayaran
                </label>
                <select
                  value={formData.method}
                  onChange={(e) =>
                    setFormData({ ...formData, method: e.target.value as PaymentMethod })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-medium"
                >
                  <option value="Transfer Bank">Transfer Bank</option>
                  <option value="Cash">Cash / Tunai</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bukti Pembayaran / Transfer (Gambar / File)
                </label>
                <div className="flex items-center gap-3">
                  <label className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer transition-colors inline-flex items-center gap-1.5 shadow-2xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Bukti</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {formData.receiptProof && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Bukti Terlampir
                      </span>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, receiptProof: '' }))}
                        className="text-slate-400 hover:text-rose-500 text-xs underline"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan / Keterangan Transaksi
                </label>
                <textarea
                  rows={2}
                  placeholder="Keterangan pengirim, nomor referensi, dll."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
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
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-bold shadow-md shadow-emerald-600/20 transition-all"
                >
                  {editingPayment ? 'Simpan Perubahan' : 'Simpan Pembayaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
