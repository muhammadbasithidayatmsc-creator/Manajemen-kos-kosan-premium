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
  ShieldCheck,
  UserCheck,
  ArrowLeftRight,
} from 'lucide-react';
import { formatDateIndo } from '../utils/formatters';

interface NavbarProps {
  onOpenMobileMenu?: () => void;
  onQuickAction?: (action: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu, onQuickAction }) => {
  const { activeMenu, setActiveMenu, settings, currentUser, switchRole } = useKos();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isOwner = currentUser.role === 'OWNER';

  const getPageTitle = () => {
    switch (activeMenu) {
      case 'dashboard':
        return {
          title: isOwner ? 'Dashboard Owner' : 'Dashboard Operasional Admin',
          desc: isOwner
            ? 'Ringkasan komprehensif performa kos, laba bersih & grafik arus kas'
            : 'Fokus operasional harian: ketersediaan kamar, tagihan, & aksi cepat',
        };
      case 'properties':
        return { title: 'Kelola Properti Kos', desc: 'Daftar cabang bangunan & fasilitas properti' };
      case 'rooms':
        return { title: 'Manajemen Kamar', desc: 'Status ketersediaan, tarif sewa, dan okupansi' };
      case 'tenants':
        return { title: 'Data Penghuni Kos', desc: 'Identitas penyewa, riwayat kamar, kontak WA, dan ekspor' };
      case 'bills':
        return { title: 'Tagihan Sewa', desc: 'Penerbitan tagihan, status pembayaran, invoice & WhatsApp' };
      case 'payments':
        return { title: 'Pencatatan Pembayaran', desc: 'Riwayat uang sewa masuk, bukti bayar & rekonsiliasi' };
      case 'expenses':
        return { title: 'Pengeluaran Usaha', desc: 'Biaya operasional, listrik, air, perawatan & kategori' };
      case 'reports':
        return { title: 'Laporan Keuangan & Laba/Rugi', desc: 'Analisis mingguan, bulanan, tahunan, export PDF & Excel' };
      case 'invoice':
        return { title: 'Invoice & Surat Tagihan', desc: 'Format cetak resmi & kirim ke WhatsApp' };
      case 'settings':
        return { title: 'Pengaturan Sistem', desc: isOwner ? 'Identitas usaha, rekening, template & kelola admin' : 'Informasi operasional sistem kos' };
      default:
        return { title: 'KOS MANAGEMENT', desc: 'Sistem Manajemen Kos' };
    }
  };

  const pageInfo = getPageTitle();
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
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
          <div className="flex items-center gap-2">
            <h2 id="navbar-page-title" className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {pageInfo.title}
            </h2>
            <span
              className={`hidden sm:inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                isOwner
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-sky-50 text-sky-700 border-sky-200'
              }`}
            >
              {isOwner ? <ShieldCheck className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
              {currentUser.role}
            </span>
          </div>
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
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all"
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
                  Operasional Cepat
                </div>

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

        {/* Profile Avatar & Quick Role Switcher */}
        <div className="relative">
          <button
            id="btn-user-profile-menu"
            type="button"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 border border-slate-200/80 transition-colors text-left"
          >
            {settings.business.logoUrl ? (
              <img
                src={settings.business.logoUrl}
                alt={currentUser.name}
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 shrink-0 shadow-2xs"
              />
            ) : (
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-xs shrink-0 ${
                  isOwner ? 'bg-amber-600' : 'bg-sky-600'
                }`}
              >
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="hidden xl:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-500 leading-tight font-medium">
                {currentUser.role}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {profileDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setProfileDropdownOpen(false)}
              />
              <div
                id="profile-dropdown-menu"
                className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-30 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2.5">
                  {settings.business.logoUrl ? (
                    <img
                      src={settings.business.logoUrl}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 shrink-0 shadow-xs"
                    />
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-xs shrink-0 ${
                        isOwner ? 'bg-amber-600' : 'bg-sky-600'
                      }`}
                    >
                      {currentUser.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    <span
                      className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isOwner
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      Role: {currentUser.role}
                    </span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    id="btn-nav-switch-role-item"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      switchRole(isOwner ? 'ADMIN' : 'OWNER');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 rounded-xl transition-colors my-1"
                  >
                    <span className="flex items-center gap-2">
                      <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-600" />
                      Ganti ke {isOwner ? 'Admin (Operasional)' : 'Owner (Full Access)'}
                    </span>
                  </button>

                  <button
                    id="btn-nav-to-settings-item"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setActiveMenu('settings');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <SettingsIcon className="w-4 h-4 text-slate-400" />
                    <span>Pengaturan Aplikasi</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
