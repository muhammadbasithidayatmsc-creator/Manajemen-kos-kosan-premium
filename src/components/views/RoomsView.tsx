import React, { useState, useEffect } from 'react';
import { useKos } from '../../context/KosContext';
import { Room, RoomStatus } from '../../types';
import {
  BedDouble,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Wrench,
  Building2,
  X,
  UserPlus,
  Tag,
  LayoutGrid,
  Table as TableIcon,
  Receipt,
  MessageCircle,
} from 'lucide-react';
import {
  formatRupiah,
  cleanWhatsappNumber,
} from '../../utils/formatters';

interface RoomsViewProps {
  onAssignTenantToRoom?: (roomId: string, propertyId: string) => void;
  autoOpenAddModal?: boolean;
  onClearAutoOpenModal?: () => void;
}

export const RoomsView: React.FC<RoomsViewProps> = ({
  onAssignTenantToRoom,
  autoOpenAddModal,
  onClearAutoOpenModal,
}) => {
  const {
    rooms,
    properties,
    tenants,
    addRoom,
    updateRoom,
    deleteRoom,
    openConfirmDialog,
  } = useKos();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | RoomStatus>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    propertyId: '',
    roomNumber: '',
    type: 'Standard AC',
    monthlyPrice: 1000000,
    status: 'Kosong' as RoomStatus,
    facilitiesString: 'AC, WiFi, Kasur Springbed, Kamar Mandi Dalam',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setFormData({
      propertyId: properties[0]?.id || '',
      roomNumber: '',
      type: 'Standard AC',
      monthlyPrice: 1200000,
      status: 'Kosong',
      facilitiesString: 'AC, WiFi, Kasur Springbed, Kamar Mandi Dalam',
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

  const handleOpenEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      propertyId: room.propertyId,
      roomNumber: room.roomNumber,
      type: room.type,
      monthlyPrice: room.monthlyPrice,
      status: room.status,
      facilitiesString: (room.facilities || []).join(', '),
      notes: room.notes || '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleDelete = (room: Room) => {
    const activeTenant = tenants.find(
      (t) => t.roomId === room.id && t.status === 'Aktif'
    );
    if (activeTenant) {
      alert(`Kamar "${room.roomNumber}" masih ditempati oleh penghuni ${activeTenant.fullName}. Kosongkan penghuni terlebih dahulu sebelum menghapus kamar.`);
      return;
    }

    openConfirmDialog(
      'Hapus Kamar',
      `Apakah Anda yakin ingin menghapus Kamar "${room.roomNumber}"? Tindakan ini permanen.`,
      () => deleteRoom(room.id)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formData.propertyId) errors.propertyId = 'Pilih properti';
    if (!formData.roomNumber.trim()) errors.roomNumber = 'Nomor kamar wajib diisi';
    if (formData.monthlyPrice <= 0 || isNaN(formData.monthlyPrice)) {
      errors.monthlyPrice = 'Harga sewa harus lebih dari 0';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const facilities = formData.facilitiesString
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    const roomPayload = {
      propertyId: formData.propertyId,
      roomNumber: formData.roomNumber.trim(),
      type: formData.type.trim(),
      monthlyPrice: Number(formData.monthlyPrice),
      status: formData.status,
      facilities,
      notes: formData.notes.trim(),
    };

    if (editingRoom) {
      updateRoom(editingRoom.id, roomPayload);
    } else {
      addRoom(roomPayload);
    }
    setModalOpen(false);
  };

  const filteredRooms = rooms.filter((room) => {
    const matchProperty =
      selectedPropertyFilter === 'all' || room.propertyId === selectedPropertyFilter;
    const matchStatus =
      selectedStatusFilter === 'all' || room.status === selectedStatusFilter;
    const matchSearch =
      room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.type.toLowerCase().includes(searchQuery.toLowerCase());

    return matchProperty && matchStatus && matchSearch;
  });

  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case 'Terisi':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span>🟢</span>
            <span>TERISI</span>
          </span>
        );
      case 'Kosong':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <span>⚪</span>
            <span>KOSONG</span>
          </span>
        );
      case 'Booking':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span>🟡</span>
            <span>BOOKING</span>
          </span>
        );
      case 'Maintenance':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span>🔴</span>
            <span>MAINTENANCE</span>
          </span>
        );
    }
  };

  const totalOccupied = rooms.filter((r) => r.status === 'Terisi').length;
  const totalEmpty = rooms.filter((r) => r.status === 'Kosong').length;
  const totalBooking = rooms.filter((r) => r.status === 'Booking').length;
  const totalMaintenance = rooms.filter((r) => r.status === 'Maintenance').length;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Status & Manajemen Kamar
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola data seluruh unit, status hunian visual, dan harga sewa kamar
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tampilan Grid Visual"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden md:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tampilan Tabel"
            >
              <TableIcon className="w-4 h-4" />
              <span className="hidden md:inline">Tabel</span>
            </button>
          </div>

          <button
            id="btn-add-room"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Kamar</span>
          </button>
        </div>
      </div>

      {/* Quick Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedStatusFilter('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedStatusFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Semua ({rooms.length})
        </button>
        <button
          onClick={() => setSelectedStatusFilter('Terisi')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
            selectedStatusFilter === 'Terisi'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          <span>🟢</span> Terisi ({totalOccupied})
        </button>
        <button
          onClick={() => setSelectedStatusFilter('Kosong')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
            selectedStatusFilter === 'Kosong'
              ? 'bg-slate-700 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
          }`}
        >
          <span>⚪</span> Kosong ({totalEmpty})
        </button>
        <button
          onClick={() => setSelectedStatusFilter('Booking')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
            selectedStatusFilter === 'Booking'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
          }`}
        >
          <span>🟡</span> Booking ({totalBooking})
        </button>
        <button
          onClick={() => setSelectedStatusFilter('Maintenance')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
            selectedStatusFilter === 'Maintenance'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
          }`}
        >
          <span>🔴</span> Maintenance ({totalMaintenance})
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="flex-1 w-full flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            id="search-room-input"
            type="text"
            placeholder="Cari nomor kamar atau tipe (misal: A01, Deluxe)..."
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
            id="filter-room-property"
            value={selectedPropertyFilter}
            onChange={(e) => setSelectedPropertyFilter(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 outline-none"
          >
            <option value="all">Semua Properti ({properties.length})</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rooms Display */}
      {filteredRooms.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
          <BedDouble className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Tidak ada kamar ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery || selectedPropertyFilter !== 'all' || selectedStatusFilter !== 'all'
              ? 'Coba ubah filter atau kata kunci pencarian.'
              : 'Tambahkan kamar pada properti yang tersedia.'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tambah Kamar Sekarang</span>
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* VISUAL ROOM CARD / GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRooms.map((room) => {
            const property = properties.find((p) => p.id === room.propertyId);
            const activeTenant = tenants.find(
              (t) => t.roomId === room.id && t.status === 'Aktif'
            );

            let cardBorder = 'border-slate-200';
            if (room.status === 'Terisi') cardBorder = 'border-emerald-200 hover:border-emerald-400';
            if (room.status === 'Booking') cardBorder = 'border-amber-200 hover:border-amber-400';
            if (room.status === 'Maintenance') cardBorder = 'border-rose-200 hover:border-rose-400';

            return (
              <div
                key={room.id}
                className={`bg-white rounded-3xl border ${cardBorder} shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div>
                      <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider block">
                        {property?.name || 'Properti'}
                      </span>
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                        KAMAR {room.roomNumber}
                      </h3>
                      <span className="text-xs text-slate-500 font-medium">{room.type}</span>
                    </div>

                    {getStatusBadge(room.status)}
                  </div>

                  {/* Monthly Rent Price Display */}
                  <div className="mt-3 py-2.5 px-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-baseline justify-between">
                    <span className="text-xs text-slate-500 font-medium">Harga Sewa:</span>
                    <div className="text-right">
                      <span className="text-base font-black text-slate-900 font-mono">
                        {formatRupiah(room.monthlyPrice)}
                      </span>
                      <span className="text-[11px] text-slate-500"> / bln</span>
                    </div>
                  </div>

                  {/* Tenant info if occupied */}
                  {activeTenant ? (
                    <div className="mt-3 p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100/80 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-indigo-700 font-bold">Penghuni:</span>
                        <span className="text-[10px] text-indigo-600 font-mono font-semibold">
                          Jatuh tempo tgl {activeTenant.dueDateDay}
                        </span>
                      </div>
                      <p className="font-bold text-slate-900 truncate mt-0.5">
                        {activeTenant.fullName}
                      </p>
                      <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                        WA: {activeTenant.whatsappNumber}
                      </p>
                    </div>
                  ) : room.status === 'Kosong' ? (
                    <div className="mt-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500">
                      ⚪ Kamar siap disewakan
                    </div>
                  ) : (
                    <div className="mt-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                      {room.notes || 'Catatan status unit'}
                    </div>
                  )}

                  {/* Facilities tags */}
                  {room.facilities && room.facilities.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {room.facilities.slice(0, 3).map((fac, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
                        >
                          {fac}
                        </span>
                      ))}
                      {room.facilities.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 font-medium">
                          +{room.facilities.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer buttons */}
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  {room.status === 'Kosong' && onAssignTenantToRoom ? (
                    <button
                      onClick={() => onAssignTenantToRoom(room.id, room.propertyId)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Isi Penghuni</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-mono">
                      Unit #{room.roomNumber}
                    </span>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(room)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Edit Kamar & Harga"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(room)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                      title="Hapus Kamar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE MODE */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">No. Kamar</th>
                  <th className="py-3.5 px-4">Properti & Tipe</th>
                  <th className="py-3.5 px-4">Harga Sewa</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Penghuni Aktif</th>
                  <th className="py-3.5 px-4">Fasilitas</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRooms.map((room) => {
                  const property = properties.find((p) => p.id === room.propertyId);
                  const activeTenant = tenants.find(
                    (t) => t.roomId === room.id && t.status === 'Aktif'
                  );

                  return (
                    <tr key={room.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        KAMAR {room.roomNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{property?.name}</div>
                        <div className="text-xs text-slate-500">{room.type}</div>
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900 font-mono">
                        {formatRupiah(room.monthlyPrice)}
                        <span className="text-[10px] text-slate-400 font-normal"> /bln</span>
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(room.status)}</td>
                      <td className="py-3.5 px-4">
                        {activeTenant ? (
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {activeTenant.fullName}
                            </span>
                            <span className="text-[11px] text-indigo-600 font-mono">
                              Jatuh tempo tgl {activeTenant.dueDateDay}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Belum terisi</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate">
                        {(room.facilities || []).join(', ') || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(room)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit Kamar & Harga"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(room)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                            title="Hapus Kamar"
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

      {/* Modal Form Tambah / Edit Kamar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingRoom ? 'Edit Data Kamar' : 'Tambah Kamar Baru'}
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
                  Pilih Properti <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.propertyId}
                  onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white ${
                    formErrors.propertyId ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  }`}
                >
                  <option value="">-- Pilih Properti Kos --</option>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Kamar <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: A01, 102, B05"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${
                      formErrors.roomNumber ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                    }`}
                  />
                  {formErrors.roomNumber && (
                    <p className="text-xs text-rose-500 mt-1">{formErrors.roomNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipe Kamar <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Standard, Deluxe AC, VIP"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Harga Sewa Bulanan (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="50000"
                    placeholder="1200000"
                    value={formData.monthlyPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, monthlyPrice: Number(e.target.value) })
                    }
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono font-bold ${
                      formErrors.monthlyPrice ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                    }`}
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Owner dapat merubah harga sewa kapan saja
                  </span>
                  {formErrors.monthlyPrice && (
                    <p className="text-xs text-rose-500 mt-1">{formErrors.monthlyPrice}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Kamar <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as RoomStatus })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                  >
                    <option value="Kosong">⚪ Kosong (Siap Huni)</option>
                    <option value="Terisi">🟢 Terisi</option>
                    <option value="Booking">🟡 Booking</option>
                    <option value="Maintenance">🔴 Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fasilitas Kamar (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  placeholder="AC, WiFi, Kasur Springbed, Kamar Mandi Dalam, Lemari"
                  value={formData.facilitiesString}
                  onChange={(e) =>
                    setFormData({ ...formData, facilitiesString: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan / Keterangan Kamar
                </label>
                <textarea
                  rows={2}
                  placeholder="Lantai 1 dekat pintu keluar, token listrik mandiri, dll."
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
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-bold shadow-md shadow-indigo-600/20 transition-all"
                >
                  {editingRoom ? 'Simpan Perubahan' : 'Tambah Kamar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
