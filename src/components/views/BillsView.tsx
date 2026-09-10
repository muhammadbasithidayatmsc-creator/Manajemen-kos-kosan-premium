import React, { useState, useEffect } from 'react';
import { useKos } from '../../context/KosContext';
import { Bill, BillStatus, Tenant, PaymentMethod } from '../../types';
import {
  Receipt,
  Plus,
  Edit2,
  Trash2,
  Search,
  MessageCircle,
  FileText,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  CreditCard,
  Building2,
  BedDouble,
  DollarSign,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import {
  formatRupiah,
  formatDateIndo,
  generateWhatsappBillingUrl,
  cleanWhatsappNumber,
  exportToCSV,
} from '../../utils/formatters';
import { exportToExcel, exportToPDF } from '../../utils/exportEngine';

interface BillsViewProps {
  initialTenantForBill?: Tenant | null;
  onClearInitialTenant?: () => void;
  onRecordPaymentForBill?: (bill: Bill) => void;
  autoOpenAddModal?: boolean;
  onClearAutoOpenModal?: () => void;
}

export const BillsView: React.FC<BillsViewProps> = ({
  initialTenantForBill,
  onClearInitialTenant,
  onRecordPaymentForBill,
  autoOpenAddModal,
  onClearAutoOpenModal,
}) => {
  const {
    bills,
    tenants,
    properties,
    rooms,
    settings,
    addBill,
    updateBill,
    deleteBill,
    openConfirmDialog,
    openInvoice,
    recordPayment,
  } = useKos();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  // Payment modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [billToPay, setBillToPay] = useState<Bill | null>(null);
  const [paymentData, setPaymentData] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    amount: 0,
    method: 'Transfer Bank' as PaymentMethod,
    notes: 'Pembayaran sewa via transfer',
  });

  // Current month default string
  const currentMonthYearStr = () => {
    const d = new Date();
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  // Form State
  const [formData, setFormData] = useState({
    tenantId: '',
    propertyId: '',
    roomId: '',
    period: currentMonthYearStr(),
    billDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    rentAmount: 1000000,
    additionalFees: 0,
    additionalFeesNotes: '',
    discount: 0,
    notes: '',
    status: 'Belum Dibayar' as BillStatus,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Trigger from external prop if user clicked "Buat Tagihan" from Tenants view or Quick Action
  useEffect(() => {
    if (initialTenantForBill) {
      handleOpenAdd(initialTenantForBill);
      if (onClearInitialTenant) onClearInitialTenant();
    } else if (autoOpenAddModal) {
      handleOpenAdd();
      if (onClearAutoOpenModal) onClearAutoOpenModal();
    }
  }, [initialTenantForBill, autoOpenAddModal]);

  const handleOpenAdd = (presetTenant?: Tenant) => {
    const targetTenant = presetTenant || tenants.find((t) => t.status === 'Aktif') || tenants[0];
    const targetRoom = rooms.find((r) => r.id === targetTenant?.roomId);

    setEditingBill(null);

    // Calculate due date based on tenant's dueDateDay
    const now = new Date();
    const dueDay = targetTenant?.dueDateDay || 10;
    const dueDateObj = new Date(now.getFullYear(), now.getMonth(), dueDay);
    const dueDateStr = dueDateObj.toISOString().split('T')[0];

    setFormData({
      tenantId: targetTenant?.id || '',
      propertyId: targetTenant?.propertyId || properties[0]?.id || '',
      roomId: targetTenant?.roomId || '',
      period: currentMonthYearStr(),
      billDate: now.toISOString().split('T')[0],
      dueDate: dueDateStr,
      rentAmount: targetTenant ? targetTenant.monthlyRent : targetRoom ? targetRoom.monthlyPrice : 1200000,
      additionalFees: 0,
      additionalFeesNotes: '',
      discount: 0,
      notes: `Tagihan sewa kos periode ${currentMonthYearStr()}`,
      status: 'Belum Dibayar',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (bill: Bill) => {
    setEditingBill(bill);
    setFormData({
      tenantId: bill.tenantId,
      propertyId: bill.propertyId,
      roomId: bill.roomId,
      period: bill.period,
      billDate: bill.billDate,
      dueDate: bill.dueDate,
      rentAmount: bill.rentAmount,
      additionalFees: bill.additionalFees || 0,
      additionalFeesNotes: bill.additionalFeesNotes || '',
      discount: bill.discount || 0,
      notes: bill.notes || '',
      status: bill.status,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleTenantSelectInForm = (tenantId: string) => {
    const t = tenants.find((item) => item.id === tenantId);
    if (!t) return;

    const r = rooms.find((room) => room.id === t.roomId);
    setFormData((prev) => ({
      ...prev,
      tenantId,
      propertyId: t.propertyId,
      roomId: t.roomId,
      rentAmount: t.monthlyRent || (r ? r.monthlyPrice : prev.rentAmount),
    }));
  };

  const handleDelete = (bill: Bill) => {
    openConfirmDialog(
      'Hapus Tagihan',
      `Apakah Anda yakin ingin menghapus tagihan invoice "${bill.invoiceNumber}"?`,
      () => deleteBill(bill.id)
    );
  };

  const calculatedTotal =
    Math.max(0, (Number(formData.rentAmount) || 0) + (Number(formData.additionalFees) || 0) - (Number(formData.discount) || 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.tenantId) errors.tenantId = 'Pilih penghuni kos';
    if (!formData.propertyId) errors.propertyId = 'Pilih properti';
    if (!formData.roomId) errors.roomId = 'Pilih kamar';
    if (!formData.period.trim()) errors.period = 'Periode tagihan wajib diisi';
    if (!formData.billDate) errors.billDate = 'Tanggal tagihan wajib diisi';
    if (!formData.dueDate) errors.dueDate = 'Tanggal jatuh tempo wajib diisi';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      tenantId: formData.tenantId,
      propertyId: formData.propertyId,
      roomId: formData.roomId,
      period: formData.period.trim(),
      billDate: formData.billDate,
      dueDate: formData.dueDate,
      rentAmount: Number(formData.rentAmount),
      additionalFees: Number(formData.additionalFees) || 0,
      additionalFeesNotes: formData.additionalFeesNotes.trim(),
      discount: Number(formData.discount) || 0,
      totalAmount: calculatedTotal,
      notes: formData.notes.trim(),
      status: formData.status,
    };

    if (editingBill) {
      updateBill(editingBill.id, payload);
    } else {
      addBill(payload);
    }
    setModalOpen(false);
  };

  // Payment modal trigger
  const handleOpenPaymentModal = (bill: Bill) => {
    setBillToPay(bill);
    setPaymentData({
      paymentDate: new Date().toISOString().split('T')[0],
      amount: bill.totalAmount,
      method: 'Transfer Bank',
      notes: `Pelunasan tagihan ${bill.invoiceNumber} (${bill.period})`,
    });
    setPaymentModalOpen(true);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billToPay) return;

    recordPayment({
      billId: billToPay.id,
      invoiceNumber: billToPay.invoiceNumber,
      tenantId: billToPay.tenantId,
      propertyId: billToPay.propertyId,
      roomId: billToPay.roomId,
      paymentDate: paymentData.paymentDate,
      amount: Number(paymentData.amount),
      method: paymentData.method,
      notes: paymentData.notes,
    });
    setPaymentModalOpen(false);
  };

  // Export to Excel
  const handleExportExcel = () => {
    const filename = `Data_Tagihan_Kos_${new Date().getFullYear()}`;
    const headers = [
      'No Invoice',
      'Penghuni',
      'WhatsApp',
      'Properti',
      'Kamar',
      'Periode',
      'Tanggal Tagihan',
      'Jatuh Tempo',
      'Sewa Kamar',
      'Biaya Tambahan',
      'Diskon',
      'Total Tagihan',
      'Status',
    ];

    const rows = filteredBills.map((b) => {
      const t = tenants.find((item) => item.id === b.tenantId);
      const p = properties.find((item) => item.id === b.propertyId);
      const r = rooms.find((item) => item.id === b.roomId);
      return [
        b.invoiceNumber,
        t?.fullName || '-',
        t?.whatsappNumber || '-',
        p?.name || '-',
        r?.roomNumber || '-',
        b.period,
        b.billDate,
        b.dueDate,
        b.rentAmount,
        b.additionalFees,
        b.discount,
        b.totalAmount,
        b.status,
      ];
    });

    const totalAll = filteredBills.reduce((s, b) => s + b.totalAmount, 0);
    rows.push([]);
    rows.push(['', '', '', '', '', '', '', 'TOTAL', '', '', '', totalAll, '']);

    exportToExcel({
      filename,
      title: 'DAFTAR TAGIHAN SEWA KOS',
      subtitle: `Total Tagihan: ${filteredBills.length} Tagihan (Total: ${formatRupiah(totalAll)})`,
      businessName: settings.business.businessName,
      headers,
      rows,
    });
  };

  // Export to PDF
  const handleExportPDF = () => {
    const filename = `Data_Tagihan_Kos_${new Date().getFullYear()}`;
    const headers = ['Invoice', 'Penghuni', 'Kamar', 'Periode', 'Jatuh Tempo', 'Sewa', 'Tambahan', 'Diskon', 'Total', 'Status'];

    const rows = filteredBills.map((b) => {
      const t = tenants.find((item) => item.id === b.tenantId);
      const r = rooms.find((item) => item.id === b.roomId);
      return [
        b.invoiceNumber,
        t?.fullName || '-',
        r?.roomNumber || '-',
        b.period,
        formatDateIndo(b.dueDate),
        formatRupiah(b.rentAmount),
        formatRupiah(b.additionalFees),
        formatRupiah(b.discount),
        formatRupiah(b.totalAmount),
        b.status,
      ];
    });

    const totalAll = filteredBills.reduce((s, b) => s + b.totalAmount, 0);

    exportToPDF({
      filename,
      title: 'DAFTAR TAGIHAN SEWA KOS',
      subtitle: `Total: ${filteredBills.length} Tagihan | Akumulasi: ${formatRupiah(totalAll)}`,
      businessName: settings.business.businessName,
      address: `${settings.business.address}, ${settings.business.city}`,
      ownerName: settings.business.ownerName,
      ownerPhone: settings.business.whatsappNumber,
      orientation: 'landscape',
      headers,
      rows,
      footerNote: `Dokumen Tagihan Resmi ${settings.business.businessName} - WhatsApp Pengelola: ${settings.business.whatsappNumber}`,
    });
  };

  // Extract unique periods for filter
  const uniquePeriods = Array.from(new Set(bills.map((b) => b.period))).filter(Boolean);

  const filteredBills = bills.filter((b) => {
    const tenant = tenants.find((t) => t.id === b.tenantId);
    const matchSearch =
      b.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tenant && tenant.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      b.period.toLowerCase().includes(searchQuery.toLowerCase());

    const matchProp =
      selectedPropertyFilter === 'all' || b.propertyId === selectedPropertyFilter;
    const matchStatus =
      selectedStatusFilter === 'all' || b.status === selectedStatusFilter;
    const matchMonth =
      selectedMonthFilter === 'all' || b.period === selectedMonthFilter;

    return matchSearch && matchProp && matchStatus && matchMonth;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Manajemen Tagihan Sewa
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Penerbitan tagihan bulanan, pengiriman pesan tagih WhatsApp, & pencatatan pembayaran
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-export-bills-excel"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors"
            title="Export Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            id="btn-export-bills-pdf"
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>

          <button
            id="btn-create-new-bill"
            onClick={() => handleOpenAdd()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Tagihan</span>
          </button>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="flex-1 w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            id="search-bills-input"
            type="text"
            placeholder="Cari nomor invoice atau nama penghuni..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm outline-none bg-transparent text-slate-800 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 p-0.5">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="w-full md:w-auto flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          {/* Month Filter */}
          <select
            id="filter-bill-month"
            value={selectedMonthFilter}
            onChange={(e) => setSelectedMonthFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 outline-none"
          >
            <option value="all">Semua Periode</option>
            {uniquePeriods.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Property Filter */}
          <select
            id="filter-bill-property"
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

          {/* Status Filter */}
          <select
            id="filter-bill-status"
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="Belum Dibayar">Belum Dibayar</option>
            <option value="Lunas">Lunas</option>
            <option value="Terlambat">Terlambat</option>
          </select>
        </div>
      </div>

      {/* Bills Table */}
      {filteredBills.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Tidak ada tagihan ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery || selectedStatusFilter !== 'all' || selectedPropertyFilter !== 'all'
              ? 'Coba sesuaikan filter pencarian.'
              : 'Terbitkan tagihan baru untuk penghuni kos Anda.'}
          </p>
          <button
            onClick={() => handleOpenAdd()}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            + Buat Tagihan Sekarang
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">No. Invoice</th>
                  <th className="py-3.5 px-4">Penghuni & Kamar</th>
                  <th className="py-3.5 px-4">Periode</th>
                  <th className="py-3.5 px-4">Rincian Biaya</th>
                  <th className="py-3.5 px-4">Total Tagihan</th>
                  <th className="py-3.5 px-4">Jatuh Tempo</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredBills.map((bill) => {
                  const tenant = tenants.find((t) => t.id === bill.tenantId);
                  const property = properties.find((p) => p.id === bill.propertyId);
                  const room = rooms.find((r) => r.id === bill.roomId);

                  const waUrl = tenant
                    ? generateWhatsappBillingUrl({
                        tenantPhone: tenant.whatsappNumber,
                        tenantName: tenant.fullName,
                        propertyName: property?.name || 'Kos',
                        roomNumber: room?.roomNumber || 'Kamar',
                        period: bill.period,
                        dueDate: bill.dueDate,
                        totalAmount: bill.totalAmount,
                        ownerName: settings.business.ownerName,
                        businessName: settings.business.businessName,
                        bankName: settings.payment.bankName,
                        accountNumber: settings.payment.accountNumber,
                        accountHolder: settings.payment.accountHolder,
                      })
                    : '#';

                  return (
                    <tr key={bill.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                        {bill.invoiceNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {tenant?.fullName || 'Penghuni (Dihapus)'}
                        </div>
                        <div className="text-xs text-slate-500">
                          {property?.name} • Kamar {room?.roomNumber || '-'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {bill.period}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        <div>Sewa: {formatRupiah(bill.rentAmount)}</div>
                        {bill.additionalFees > 0 && (
                          <div className="text-slate-600">
                            + Biaya: {formatRupiah(bill.additionalFees)}
                          </div>
                        )}
                        {bill.discount > 0 && (
                          <div className="text-rose-500">
                            - Diskon: {formatRupiah(bill.discount)}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        {formatRupiah(bill.totalAmount)}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="font-semibold">{formatDateIndo(bill.dueDate)}</div>
                        {bill.paidAt && (
                          <div className="text-[11px] text-emerald-600">
                            Dibayar: {formatDateIndo(bill.paidAt)}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {bill.status === 'Lunas' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Lunas
                          </span>
                        )}
                        {bill.status === 'Belum Dibayar' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            Belum Dibayar
                          </span>
                        )}
                        {bill.status === 'Terlambat' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertCircle className="w-3 h-3" />
                            Terlambat
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Tagih via WhatsApp */}
                          {tenant && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs"
                              title="Kirim Tagihan ke WhatsApp Penghuni"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span className="hidden lg:inline">Tagih WA</span>
                            </a>
                          )}

                          {/* Catat Pembayaran if not yet lunas */}
                          {bill.status !== 'Lunas' && (
                            <button
                              onClick={() => handleOpenPaymentModal(bill)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white font-semibold text-xs transition-colors"
                              title="Catat Pembayaran"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">Bayar</span>
                            </button>
                          )}

                          {/* Lihat Invoice */}
                          <button
                            onClick={() => openInvoice(bill)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Buka / Cetak Invoice"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(bill)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            title="Edit Tagihan"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(bill)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                            title="Hapus Tagihan"
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

      {/* Modal Form Buat / Edit Tagihan */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingBill ? 'Edit Tagihan Sewa' : 'Buat Tagihan Sewa Baru'}
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
                  Pilih Penghuni Kos <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.tenantId}
                  onChange={(e) => handleTenantSelectInForm(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white ${
                    formErrors.tenantId ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  }`}
                >
                  <option value="">-- Pilih Penghuni --</option>
                  {tenants.map((t) => {
                    const r = rooms.find((rm) => rm.id === t.roomId);
                    const p = properties.find((pr) => pr.id === t.propertyId);
                    return (
                      <option key={t.id} value={t.id}>
                        {t.fullName} ({p?.name} - Kamar {r?.roomNumber})
                      </option>
                    );
                  })}
                </select>
                {formErrors.tenantId && (
                  <p className="text-xs text-rose-500 mt-1">{formErrors.tenantId}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Periode Tagihan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: September 2026"
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  />
                  {formErrors.period && (
                    <p className="text-xs text-rose-500 mt-1">{formErrors.period}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Tagihan
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as BillStatus })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                  >
                    <option value="Belum Dibayar">Belum Dibayar</option>
                    <option value="Lunas">Lunas</option>
                    <option value="Terlambat">Terlambat</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Terbit Tagihan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.billDate}
                    onChange={(e) => setFormData({ ...formData, billDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Jatuh Tempo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Financial Calculation Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Kalkulasi Nominal Tagihan
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Sewa Kamar (Rp)
                    </label>
                    <input
                      type="number"
                      step="50000"
                      value={formData.rentAmount}
                      onChange={(e) =>
                        setFormData({ ...formData, rentAmount: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Biaya Tambahan (Rp)
                    </label>
                    <input
                      type="number"
                      step="10000"
                      value={formData.additionalFees}
                      onChange={(e) =>
                        setFormData({ ...formData, additionalFees: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Diskon Potongan (Rp)
                    </label>
                    <input
                      type="number"
                      step="10000"
                      value={formData.discount}
                      onChange={(e) =>
                        setFormData({ ...formData, discount: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono text-rose-600"
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Keterangan biaya tambahan (contoh: Iuran listrik AC, parkir mobil, laundry)"
                    value={formData.additionalFeesNotes}
                    onChange={(e) =>
                      setFormData({ ...formData, additionalFeesNotes: e.target.value })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">TOTAL TAGIHAN:</span>
                  <span className="text-base font-extrabold text-indigo-600 font-mono">
                    {formatRupiah(calculatedTotal)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Pada Invoice
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan tambahan yang akan dicantumkan pada lembar tagihan..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
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
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold shadow-sm transition-all"
                >
                  {editingBill ? 'Simpan Perubahan' : 'Terbitkan Tagihan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pencatatan Pembayaran Cepat */}
      {paymentModalOpen && billToPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Catat Pembayaran Tagihan</h3>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="mt-4 space-y-3.5">
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs space-y-1">
                <p>
                  <strong>No. Invoice:</strong>{' '}
                  <span className="font-mono text-indigo-700">{billToPay.invoiceNumber}</span>
                </p>
                <p>
                  <strong>Penghuni:</strong>{' '}
                  {tenants.find((t) => t.id === billToPay.tenantId)?.fullName}
                </p>
                <p>
                  <strong>Total Tagihan:</strong>{' '}
                  <span className="font-bold text-slate-900">
                    {formatRupiah(billToPay.totalAmount)}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Pembayaran
                </label>
                <input
                  type="date"
                  value={paymentData.paymentDate}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, paymentDate: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nominal Pembayaran (Rp)
                </label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, amount: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Metode Pembayaran
                </label>
                <select
                  value={paymentData.method}
                  onChange={(e) =>
                    setPaymentData({
                      ...paymentData,
                      method: e.target.value as PaymentMethod,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none bg-white font-medium"
                >
                  <option value="Transfer Bank">Transfer Bank</option>
                  <option value="Cash">Cash / Tunai</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Transaksi
                </label>
                <input
                  type="text"
                  placeholder="Ref m-banking, nama pengirim, dll"
                  value={paymentData.notes}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Simpan Pembayaran</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
