import React, { useState } from 'react';
import { useKos } from '../context/KosContext';
import {
  Menu,
  Plus,
  Receipt,
  Users,
  CreditCard,
  TrendingDown,
  Building2,
  BedDouble,
  ChevronDown,
  Calendar,
  Settings as SettingsIcon,
} from 'lucide-react';
import { formatDateIndo } from '../utils/formatters';

interface NavbarProps {
  onOpenMobileMenu?: () => void;
  onQuickAction?: (action: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu, onQuickAction }) => {
  const { activeMenu, setActiveMenu, settings } = useKos();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getPageTitle = () => {
    switch (activeMenu) {
      case 'dashboard':
        return { title: 'Dashboard Utama', desc: 'Ringkasan performa kos & arus kas terkini' };
      case 'properties':
        return { title: 'Kelola Properti Kos', desc: 'Daftar cabang bangunan & fasilitas properti' };
      case 'rooms':
        return { title: 'Manajemen Kamar', desc: 'Status ketersediaan, tarif sewa, dan okupansi' };
      case 'tenants':
        return { title: 'Data Penghuni Kos', desc: 'Identitas penyewa, riwayat kamar, dan kontak' };
      case 'bills':
        return { title: 'Tagihan Sewa', desc: 'Penerbitan tagihan, status pembayaran, & WhatsApp' };
      case 'payments':
        return { title: 'Pencatatan Pembayaran', desc: 'Riwayat uang sewa masuk dan bukti transfer' };
      case 'expenses':
        return { title: 'Pengeluaran Usaha', desc: 'Biaya operasional, listrik, air, dan perawatan' };
      case 'reports':
        return { title: 'Laporan Keuangan & Laba/Rugi', desc: 'Analisis pemasukan, pengeluaran, dan net profit' };
      case 'invoice':
        return { title: 'Invoice & Surat Tagihan', desc: 'Format cetak resmi & kirim ke WhatsApp' };
      case 'settings':
        return { title: 'Pengaturan Sistem', desc: 'Identitas usaha, rekening bank, & template invoice' };
      default:
        return { title: 'KOS MANAGEMENT', desc: 'Sistem Manajemen Kos' };
    }
  };

  const pageInfo = getPageTitle();
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          id="btn-open-mobile-menu"
          onClick={() => onOpenMobileMenu?.()}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Buka menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 id="navbar-page-title" className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {pageInfo.title}
          </h2>
          <p className="text-xs text-slate-500 hidden sm:block">
            {pageInfo.desc}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Date badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatDateIndo(todayStr)}</span>
        </div>

        {/* Quick Action Dropdown */}
        <div className="relative">
          <button
            id="btn-quick-action-dropdown"
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Aksi Cepat</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setDropdownOpen(false)}
              />
              <div
                id="quick-actions-menu"
                className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Tambah Data Baru
                </div>

                <button
                  id="quick-add-bill"
                  onClick={() => {
                    setDropdownOpen(false);
                    onQuickAction?.('add-bill');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  <Receipt className="w-4 h-4 text-indigo-500" />
                  <span>Buat Tagihan Sewa</span>
                </button>

                <button
                  id="quick-add-payment"
                  onClick={() => {
                    setDropdownOpen(false);
                    onQuickAction?.('add-payment');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                >
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                  <span>Catat Pembayaran</span>
                </button>

                <button
                  id="quick-add-tenant"
                  onClick={() => {
                    setDropdownOpen(false);
                    onQuickAction?.('add-tenant');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                >
                  <Users className="w-4 h-4 text-sky-500" />
                  <span>Tambah Penghuni</span>
                </button>

                <button
                  id="quick-add-expense"
                  onClick={() => {
                    setDropdownOpen(false);
                    onQuickAction?.('add-expense');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                >
                  <TrendingDown className="w-4 h-4 text-rose-500" />
                  <span>Catat Pengeluaran</span>
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  id="quick-add-room"
                  onClick={() => {
                    setDropdownOpen(false);
                    onQuickAction?.('add-room');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <BedDouble className="w-4 h-4 text-slate-500" />
                  <span>Tambah Kamar</span>
                </button>

                <button
                  id="quick-add-property"
                  onClick={() => {
                    setDropdownOpen(false);
                    onQuickAction?.('add-property');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <span>Tambah Properti</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Profile Avatar & Settings Quick link */}
        <button
          id="btn-nav-to-settings"
          onClick={() => setActiveMenu('settings')}
          className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors text-left"
          title="Buka Pengaturan"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {settings.business.ownerName ? settings.business.ownerName.slice(0, 2).toUpperCase() : 'AD'}
          </div>
          <div className="hidden xl:block">
            <p className="text-xs font-bold text-slate-800 leading-tight">
              {settings.business.ownerName || 'Admin Kos'}
            </p>
            <p className="text-[10px] text-slate-500 leading-tight">Pengelola</p>
          </div>
          <SettingsIcon className="w-4 h-4 text-slate-400 hidden sm:block" />
        </button>
      </div>
    </header>
  );
};
