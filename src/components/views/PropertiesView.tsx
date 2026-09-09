import React, { useState, useEffect } from 'react';
import { useKos } from '../../context/KosContext';
import { Property } from '../../types';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Eye,
  MapPin,
  Phone,
  BedDouble,
  Users,
  CheckCircle2,
  X,
  Search,
} from 'lucide-react';
import { formatRupiah } from '../../utils/formatters';

export interface PropertiesViewProps {
  autoOpenAddModal?: boolean;
  onClearAutoOpenModal?: () => void;
}

export const PropertiesView: React.FC<PropertiesViewProps> = ({
  autoOpenAddModal,
  onClearAutoOpenModal,
}) => {
  const {
    properties,
    rooms,
    tenants,
    addProperty,
    updateProperty,
    deleteProperty,
    openConfirmDialog,
  } = useKos();

  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [detailProperty, setDetailProperty] = useState<Property | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contactNumber: '',
    description: '',
    status: 'Aktif' as 'Aktif' | 'Nonaktif',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleOpenAdd = () => {
    setEditingProperty(null);
    setFormData({
      name: '',
      address: '',
      contactNumber: '081803716514',
      description: '',
      status: 'Aktif',
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

  const handleOpenEdit = (prop: Property) => {
    setEditingProperty(prop);
    setFormData({
      name: prop.name,
      address: prop.address,
      contactNumber: prop.contactNumber,
      description: prop.description,
      status: prop.status,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleDelete = (prop: Property) => {
    openConfirmDialog(
      'Hapus Properti',
      `Apakah Anda yakin ingin menghapus properti "${prop.name}"? Semua data kamar yang terhubung juga akan ikut terhapus.`,
      () => deleteProperty(prop.id)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Nama properti wajib diisi';
    if (!formData.address.trim()) errors.address = 'Alamat wajib diisi';
    if (!formData.contactNumber.trim()) errors.contactNumber = 'Nomor kontak wajib diisi';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingProperty) {
      updateProperty(editingProperty.id, formData);
    } else {
      addProperty(formData);
    }
    setModalOpen(false);
  };

  const filteredProperties = properties.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Daftar Properti Kos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola seluruh bangunan dan cabang kos yang Anda miliki
          </p>
        </div>

        <button
          id="btn-add-property"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Properti</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 shrink-0 ml-1" />
        <input
          id="search-property-input"
          type="text"
          placeholder="Cari berdasarkan nama properti atau alamat..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-sm outline-none bg-transparent text-slate-800 placeholder:text-slate-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Property Cards Grid */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Tidak ada properti ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'Coba gunakan kata kunci pencarian yang lain.'
              : 'Mulai dengan menambahkan properti kos pertama Anda.'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              + Tambah Properti Sekarang
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProperties.map((prop) => {
            const propRooms = rooms.filter((r) => r.propertyId === prop.id);
            const occupiedRooms = propRooms.filter((r) => r.status === 'Terisi');
            const propTenants = tenants.filter((t) => t.propertyId === prop.id && t.status === 'Aktif');

            return (
              <div
                key={prop.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        prop.status === 'Aktif'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {prop.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {prop.name}
                  </h3>

                  <div className="mt-2 space-y-1.5 text-xs text-slate-600">
                    <p className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{prop.address}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{prop.contactNumber}</span>
                    </p>
                  </div>

                  {prop.description && (
                    <p className="mt-3 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl line-clamp-2 border border-slate-100">
                      {prop.description}
                    </p>
                  )}

                  {/* Room & Tenant Counts */}
                  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-slate-50">
                      <p className="text-[11px] text-slate-500 font-medium">Total Kamar</p>
                      <p className="text-sm font-bold text-slate-800">
                        {propRooms.length} Kamar
                      </p>
                      <span className="text-[10px] text-emerald-600 font-medium">
                        {occupiedRooms.length} Terisi
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50">
                      <p className="text-[11px] text-slate-500 font-medium">Penghuni Aktif</p>
                      <p className="text-sm font-bold text-indigo-600">
                        {propTenants.length} Orang
                      </p>
                      <span className="text-[10px] text-slate-500">
                        {propRooms.length - occupiedRooms.length} Kosong
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setDetailProperty(prop)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat Detail</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(prop)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors"
                      title="Edit Properti"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(prop)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                      title="Hapus Properti"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form Tambah / Edit Properti */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingProperty ? 'Edit Properti' : 'Tambah Properti Baru'}
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
                  Nama Properti <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kos Melati, Kos Mawar 2"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                    formErrors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-xs text-rose-500 mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Lengkap <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Alamat jalan, kelurahan, kecamatan, kota..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                    formErrors.address ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  }`}
                />
                {formErrors.address && (
                  <p className="text-xs text-rose-500 mt-1">{formErrors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Kontak / WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="081803716514"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                      formErrors.contactNumber ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                    }`}
                  />
                  {formErrors.contactNumber && (
                    <p className="text-xs text-rose-500 mt-1">{formErrors.contactNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Properti
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as 'Aktif' | 'Nonaktif' })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi / Catatan Properti
                </label>
                <textarea
                  rows={2}
                  placeholder="Fasilitas umum kos, akses transportasi, aturan singkat..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  {editingProperty ? 'Simpan Perubahan' : 'Tambah Properti'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Properti */}
      {detailProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{detailProperty.name}</h3>
                  <p className="text-xs text-slate-500">{detailProperty.status}</p>
                </div>
              </div>
              <button
                onClick={() => setDetailProperty(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <p>
                  <strong className="text-slate-700">Alamat:</strong> {detailProperty.address}
                </p>
                <p>
                  <strong className="text-slate-700">Kontak:</strong>{' '}
                  <span className="font-mono">{detailProperty.contactNumber}</span>
                </p>
                {detailProperty.description && (
                  <p>
                    <strong className="text-slate-700">Keterangan:</strong>{' '}
                    {detailProperty.description}
                  </p>
                )}
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-2 flex items-center gap-2">
                  <BedDouble className="w-4 h-4 text-indigo-600" />
                  Daftar Kamar di Properti Ini
                </h4>

                {rooms.filter((r) => r.propertyId === detailProperty.id).length === 0 ? (
                  <p className="text-xs text-slate-400 py-3">Belum ada kamar yang dibuat di properti ini.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {rooms
                      .filter((r) => r.propertyId === detailProperty.id)
                      .map((room) => {
                        const tenant = tenants.find((t) => t.roomId === room.id && t.status === 'Aktif');
                        return (
                          <div
                            key={room.id}
                            className="p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-all flex items-center justify-between"
                          >
                            <div>
                              <p className="font-bold text-xs text-slate-900">
                                Kamar {room.roomNumber} ({room.type})
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {formatRupiah(room.monthlyPrice)} / bln
                              </p>
                              {tenant && (
                                <p className="text-[11px] text-indigo-600 font-medium mt-0.5">
                                  Penghuni: {tenant.fullName}
                                </p>
                              )}
                            </div>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                                room.status === 'Terisi'
                                  ? 'bg-indigo-50 text-indigo-700'
                                  : room.status === 'Kosong'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {room.status}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setDetailProperty(null)}
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
