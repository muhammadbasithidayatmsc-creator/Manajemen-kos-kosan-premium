import React, { useState, useEffect } from 'react';
import { useKos } from '../../context/KosContext';
import { Tenant, TenantStatus } from '../../types';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  MessageCircle,
  Phone,
  Calendar,
  Building2,
  BedDouble,
  Receipt,
  Eye,
  X,
  CreditCard,
  AlertCircle,
  FileText,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import {
  formatRupiah,
  formatDateIndo,
  cleanWhatsappNumber,
} from '../../utils/formatters';
import { exportToExcel, exportToPDF } from '../../utils/exportEngine';

interface TenantsViewProps {
  onQuickCreateBillForTenant?: (tenant: Tenant) => void;
  autoOpenAddModal?: boolean;
  onClearAutoOpenModal?: () => void;
}

export const TenantsView: React.FC<TenantsViewProps> = ({
  onQuickCreateBillForTenant,
  autoOpenAddModal,
  onClearAutoOpenModal,
}) => {
  const {
    tenants,
    properties,
    rooms,
    settings,
    addTenant,
    updateTenant,
    deleteTenant,
    openConfirmDialog,
  } = useKos();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [detailTenant, setDetailTenant] = useState<Tenant | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    whatsappNumber: '',
    nik: '',
    address: '',
    propertyId: '',
    roomId: '',
    monthlyRent: 1000000,
    entryDate: new Date().toISOString().split('T')[0],
    dueDateDay: 10,
    status: 'Aktif' as TenantStatus,
    emergencyContact: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleOpenAdd = () => {
    const defaultPropId = properties[0]?.id || '';
    // Find first empty room in this property
    const availableRoom = rooms.find(
      (r) => r.propertyId === defaultPropId && r.status === 'Kosong'
    );

    setEditingTenant(null);
    setFormData({
      fullName: '',
      whatsappNumber: '',
      nik: '',
      address: '',
      propertyId: defaultPropId,
      roomId: availableRoom?.id || '',
      monthlyRent: availableRoom ? availableRoom.monthlyPrice : 1200000,
      entryDate: new Date().toISOString().split('T')[0],
      dueDateDay: 10,
      status: 'Aktif',
      emergencyContact: '',
      notes: '',
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

  const handleOpenEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormData({
      fullName: tenant.fullName,
      whatsappNumber: tenant.whatsappNumber,
      nik: tenant.nik || '',
      address: tenant.address || '',
      propertyId: tenant.propertyId,
      roomId: tenant.roomId,
      monthlyRent: tenant.monthlyRent,
      entryDate: tenant.entryDate,
      dueDateDay: tenant.dueDateDay,
      status: tenant.status,
      emergencyContact: tenant.emergencyContact || '',
      notes: tenant.notes || '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleDelete = (tenant: Tenant) => {
    openConfirmDialog(
      'Hapus Data Penghuni',
      `Apakah Anda yakin ingin menghapus data penghuni "${tenant.fullName}"? Kamar yang ditempati akan otomatis menjadi KOSONG.`,
      () => deleteTenant(tenant.id)
    );
  };

  const handlePropertyChangeInForm = (propId: string) => {
    const availRoom = rooms.find(
      (r) => r.propertyId === propId && (r.status === 'Kosong' || r.id === formData.roomId)
    );
    setFormData((prev) => ({
      ...prev,
      propertyId: propId,
      roomId: availRoom?.id || '',
      monthlyRent: availRoom ? availRoom.monthlyPrice : prev.monthlyRent,
    }));
  };

  const handleRoomChangeInForm = (roomId: string) => {
    const selectedRoom = rooms.find((r) => r.id === roomId);
    setFormData((prev) => ({
      ...prev,
      roomId,
      monthlyRent: selectedRoom ? selectedRoom.monthlyPrice : prev.monthlyRent,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = 'Nama lengkap wajib diisi';
    if (!formData.whatsappNumber.trim()) errors.whatsappNumber = 'Nomor WhatsApp wajib diisi';
    if (!formData.propertyId) errors.propertyId = 'Pilih properti kos';
    if (!formData.roomId) errors.roomId = 'Pilih kamar kos';
    if (formData.monthlyRent <= 0 || isNaN(formData.monthlyRent)) {
      errors.monthlyRent = 'Harga sewa harus lebih besar dari 0';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      fullName: formData.fullName.trim(),
      whatsappNumber: formData.whatsappNumber.trim(),
      nik: formData.nik.trim(),
      address: formData.address.trim(),
      propertyId: formData.propertyId,
      roomId: formData.roomId,
      monthlyRent: Number(formData.monthlyRent),
      entryDate: formData.entryDate,
      dueDateDay: Number(formData.dueDateDay) || 1,
      status: formData.status,
      emergencyContact: formData.emergencyContact.trim(),
      notes: formData.notes.trim(),
    };

    if (editingTenant) {
      updateTenant(editingTenant.id, payload);
    } else {
      addTenant(payload);
    }
    setModalOpen(false);
  };

  // Rooms available for selection in modal
  const selectableRooms = rooms.filter(
    (r) =>
      r.propertyId === formData.propertyId &&
      (r.status === 'Kosong' || r.id === formData.roomId || (editingTenant && r.id === editingTenant.roomId))
  );

  const filteredTenants = tenants.filter((t) => {
    const matchSearch =
      t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.whatsappNumber.includes(searchQuery) ||
      (t.nik && t.nik.includes(searchQuery));
    const matchProp =
      selectedPropertyFilter === 'all' || t.propertyId === selectedPropertyFilter;
    const matchStatus =
      selectedStatusFilter === 'all' || t.status === selectedStatusFilter;

    return matchSearch && matchProp && matchStatus;
  });

  const handleExportExcel = () => {
    const filename = `Database_Penghuni_${new Date().getFullYear()}`;
    const headers = [
      'No',
      'Nama Lengkap',
      'WhatsApp',
      'NIK',
      'Alamat Asal',
      'Properti',
      'Kamar',
      'Harga Sewa',
      'Tgl Masuk',
      'Jatuh Tempo (Tgl)',
      'Status',
      'Kontak Darurat',
      'Catatan',
    ];
    const rows = filteredTenants.map((t, idx) => {
      const prop = properties.find((p) => p.id === t.propertyId);
      const room = rooms.find((r) => r.id === t.roomId);
      return [
        idx + 1,
        t.fullName,
        t.whatsappNumber,
        t.nik || '-',
        t.address || '-',
        prop?.name || '-',
        room?.roomNumber || '-',
        t.monthlyRent,
        t.entryDate,
        `Tiap tgl ${t.dueDateDay}`,
        t.status,
        t.emergencyContact || '-',
        t.notes || '-',
      ];
    });

    exportToExcel({
      filename,
      title: 'DATABASE PENGHUNI KOS',
      subtitle: `Total Terdaftar: ${filteredTenants.length} Penghuni`,
      businessName: settings.business.businessName,
      headers,
      rows,
    });
  };

  const handleExportPDF = () => {
    const filename = `Database_Penghuni_${new Date().getFullYear()}`;
    const headers = ['No', 'Nama Lengkap', 'WhatsApp', 'NIK', 'Properti', 'Kamar', 'Harga Sewa', 'Tgl Masuk', 'Tempo', 'Status'];
    const rows = filteredTenants.map((t, idx) => {
      const prop = properties.find((p) => p.id === t.propertyId);
      const room = rooms.find((r) => r.id === t.roomId);
      return [
        idx + 1,
        t.fullName,
        t.whatsappNumber,
        t.nik || '-',
        prop?.name || '-',
        room?.roomNumber || '-',
        formatRupiah(t.monthlyRent),
        formatDateIndo(t.entryDate),
        `Tgl ${t.dueDateDay}`,
        t.status,
      ];
    });

    exportToPDF({
      filename,
      title: 'DATABASE PENGHUNI KOS',
      subtitle: `Total: ${filteredTenants.length} Penghuni (${filteredTenants.filter((t) => t.status === 'Aktif').length} Aktif)`,
      businessName: settings.business.businessName,
      address: `${settings.business.address}, ${settings.business.city}`,
      ownerName: settings.business.ownerName,
      ownerPhone: settings.business.whatsappNumber,
      orientation: 'landscape',
      headers,
      rows,
      footerNote: `Dokumen Resmi ${settings.business.businessName} - Kontak WhatsApp: ${settings.business.whatsappNumber}`,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Data Penghuni Kos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola data identitas penyewa, riwayat kamar, dan tanggal jatuh tempo sewa
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-export-excel-tenants"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors"
            title="Export Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            id="btn-export-pdf-tenants"
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>

          <button
            id="btn-add-tenant"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Penghuni</span>
          </button>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="flex-1 w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            id="search-tenant-input"
            type="text"
            placeholder="Cari nama penghuni, nomor WA, atau NIK..."
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

        <div className="w-full md:w-auto flex items-center gap-2.5">
          <select
            id="filter-tenant-property"
            value={selectedPropertyFilter}
            onChange={(e) => setSelectedPropertyFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 outline-none"
          >
            <option value="all">Semua Properti ({properties.length})</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            id="filter-tenant-status"
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Tidak Aktif">Tidak Aktif</option>
          </select>
        </div>
      </div>

      {/* Tenants Table & Cards */}
      {filteredTenants.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Tidak ada penghuni ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'Coba gunakan kata kunci pencarian yang lain.'
              : 'Daftarkan penghuni pertama untuk menempati kamar kos Anda.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Nama Penghuni</th>
                  <th className="py-3.5 px-4">Kontak WhatsApp</th>
                  <th className="py-3.5 px-4">Properti & Kamar</th>
                  <th className="py-3.5 px-4">Harga Sewa</th>
                  <th className="py-3.5 px-4">Jatuh Tempo</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTenants.map((tenant) => {
                  const property = properties.find((p) => p.id === tenant.propertyId);
                  const room = rooms.find((r) => r.id === tenant.roomId);
                  const cleanPhone = cleanWhatsappNumber(tenant.whatsappNumber);
                  const waChatUrl = `https://wa.me/${cleanPhone}`;

                  return (
                    <tr key={tenant.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{tenant.fullName}</div>
                        {tenant.nik && (
                          <div className="text-[11px] text-slate-400 font-mono">
                            NIK: {tenant.nik}
                          </div>
                        )}
                        {tenant.createdBy && (
                          <div className="text-[10px] text-indigo-600/80 font-medium">
                            Oleh: {tenant.createdBy}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-700 font-medium">
                            {tenant.whatsappNumber}
                          </span>
                          <a
                            href={waChatUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors"
                            title="Buka WhatsApp Langsung"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {property?.name || '-'}
                        </div>
                        <div className="text-xs text-indigo-600 font-bold">
                          Kamar {room?.roomNumber || '-'} ({room?.type || 'Standard'})
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatRupiah(tenant.monthlyRent)}
                        <span className="text-[10px] text-slate-400 block font-normal">/ bln</span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="font-semibold text-slate-800">
                          Tgl {tenant.dueDateDay} tiap bulan
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Masuk: {formatDateIndo(tenant.entryDate)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            tenant.status === 'Aktif'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {tenant.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Direct WhatsApp button as requested */}
                          <a
                            href={waChatUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs"
                            title="Kirim Pesan WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </a>

                          {/* Quick Create Bill */}
                          {onQuickCreateBillForTenant && tenant.status === 'Aktif' && (
                            <button
                              onClick={() => onQuickCreateBillForTenant(tenant)}
                              className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors"
                              title="Buat Tagihan untuk Penghuni Ini"
                            >
                              <Receipt className="w-4 h-4" />
                            </button>
                          )}

                          {/* Detail */}
                          <button
                            onClick={() => setDetailTenant(tenant)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            title="Lihat Detail Penghuni"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(tenant)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            title="Edit Data"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(tenant)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                            title="Hapus Penghuni"
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

      {/* Modal Form Tambah / Edit Penghuni */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingTenant ? 'Edit Data Penghuni' : 'Tambah Penghuni Baru'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Budi Santoso"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${
                      formErrors.fullName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                    }`}
                  />
                  {formErrors.fullName && (
                    <p className="text-xs text-rose-500 mt-1">{formErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="081234567890"
                    value={formData.whatsappNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, whatsappNumber: e.target.value })
                    }
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono ${
                      formErrors.whatsappNumber
                        ? 'border-rose-400 bg-rose-50/30'
                        : 'border-slate-200'
                    }`}
                  />
                  {formErrors.whatsappNumber && (
                    <p className="text-xs text-rose-500 mt-1">{formErrors.whatsappNumber}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIK / No. KTP
                  </label>
                  <input
                    type="text"
                    placeholder="3201012304950001"
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Penghuni
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as TenantStatus })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="Aktif">Aktif (Tinggal di Kos)</option>
                    <option value="Tidak Aktif">Tidak Aktif (Pindah / Checkout)</option>
                  </select>
                </div>
              </div>

              {/* Room & Property Allocation */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Penempatan Kamar & Sewa
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Properti Kos <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.propertyId}
                      onChange={(e) => handlePropertyChangeInForm(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    >
                      <option value="">-- Pilih Properti --</option>
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Kamar Kos <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.roomId}
                      onChange={(e) => handleRoomChangeInForm(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    >
                      <option value="">-- Pilih Kamar --</option>
                      {selectableRooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          Kamar {r.roomNumber} ({r.type}) - {formatRupiah(r.monthlyPrice)} [{r.status}]
                        </option>
                      ))}
                    </select>
                    {formErrors.roomId && (
                      <p className="text-xs text-rose-500 mt-1">{formErrors.roomId}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tarif Sewa Disepakati (Rp) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="50000"
                      value={formData.monthlyRent}
                      onChange={(e) =>
                        setFormData({ ...formData, monthlyRent: Number(e.target.value) })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tanggal Masuk Kos
                    </label>
                    <input
                      type="date"
                      value={formData.entryDate}
                      onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tgl Jatuh Tempo (1 - 31)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={formData.dueDateDay}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDateDay: Number(e.target.value) })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Asal / Sesuai KTP
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Jl. Diponegoro No. 15, Surabaya"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kontak Darurat (Keluarga / Kerabat)
                </label>
                <input
                  type="text"
                  placeholder="Nama & No. HP orang tua/wali (Contoh: Ibu Siti - 081299887766)"
                  value={formData.emergencyContact}
                  onChange={(e) =>
                    setFormData({ ...formData, emergencyContact: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Tambahan / Pekerjaan / Plat Kendaraan
                </label>
                <textarea
                  rows={2}
                  placeholder="Pekerjaan, kantor, plat nomor motor/mobil, dll."
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
                  {editingTenant ? 'Simpan Perubahan' : 'Daftarkan Penghuni'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Penghuni */}
      {detailTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                  {detailTenant.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{detailTenant.fullName}</h3>
                  <p className="text-xs text-slate-500">Status: {detailTenant.status}</p>
                </div>
              </div>
              <button
                onClick={() => setDetailTenant(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                <p>
                  <strong className="text-slate-600">WhatsApp:</strong>{' '}
                  <span className="font-mono font-semibold text-slate-900">
                    {detailTenant.whatsappNumber}
                  </span>
                </p>
                <p>
                  <strong className="text-slate-600">NIK:</strong>{' '}
                  <span className="font-mono text-slate-900">{detailTenant.nik || '-'}</span>
                </p>
                <p>
                  <strong className="text-slate-600">Alamat Asal:</strong>{' '}
                  <span className="text-slate-900">{detailTenant.address || '-'}</span>
                </p>
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1.5">
                <p>
                  <strong className="text-indigo-900">Properti:</strong>{' '}
                  {properties.find((p) => p.id === detailTenant.propertyId)?.name || '-'}
                </p>
                <p>
                  <strong className="text-indigo-900">Kamar:</strong>{' '}
                  Kamar {rooms.find((r) => r.id === detailTenant.roomId)?.roomNumber || '-'}
                </p>
                <p>
                  <strong className="text-indigo-900">Tarif Sewa:</strong>{' '}
                  <span className="font-bold text-indigo-700">
                    {formatRupiah(detailTenant.monthlyRent)} / bulan
                  </span>
                </p>
                <p>
                  <strong className="text-indigo-900">Jatuh Tempo:</strong> Setiap tanggal{' '}
                  {detailTenant.dueDateDay}
                </p>
                <p>
                  <strong className="text-indigo-900">Mulai Masuk:</strong>{' '}
                  {formatDateIndo(detailTenant.entryDate)}
                </p>
              </div>

              {detailTenant.emergencyContact && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
                  <p className="font-semibold text-rose-800 mb-0.5">Kontak Darurat:</p>
                  <p className="text-rose-900">{detailTenant.emergencyContact}</p>
                </div>
              )}

              {detailTenant.notes && (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="font-semibold text-slate-700 mb-0.5">Catatan Khusus:</p>
                  <p className="text-slate-600">{detailTenant.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <a
                href={`https://wa.me/${cleanWhatsappNumber(detailTenant.whatsappNumber)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Buka WhatsApp</span>
              </a>

              <button
                onClick={() => setDetailTenant(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
