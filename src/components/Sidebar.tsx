import React from 'react';
import { useKos } from '../context/KosContext';
import { ActiveMenu } from '../types';
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  Users,
  Receipt,
  CreditCard,
  TrendingDown,
  BarChart3,
  FileText,
  Settings,
  X,
  Building,
  AlertCircle,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, setMobileOpen }) => {
  const { activeMenu, setActiveMenu, bills, rooms, tenants, settings } = useKos();

  // Counts for smart badges
  const unpaidBillsCount = bills.filter(
    (b) => b.status === 'Belum Dibayar' || b.status === 'Terlambat'
  ).length;
  const occupiedRoomsCount = rooms.filter((r) => r.status === 'Terisi').length;

  const menuItems: { id: ActiveMenu; label: string; icon: React.ReactNode; badge?: string | number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'properties', label: 'Properti', icon: <Building2 className="w-5 h-5" /> },
    {
      id: 'rooms',
      label: 'Kamar',
      icon: <BedDouble className="w-5 h-5" />,
      badge: `${occupiedRoomsCount}/${rooms.length}`,
      badgeColor: 'bg-slate-700/80 text-slate-300 text-[11px]',
    },
    {
      id: 'tenants',
      label: 'Penghuni',
      icon: <Users className="w-5 h-5" />,
      badge: tenants.filter((t) => t.status === 'Aktif').length || undefined,
    },
    {
      id: 'bills',
      label: 'Tagihan',
      icon: <Receipt className="w-5 h-5" />,
      badge: unpaidBillsCount > 0 ? unpaidBillsCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    { id: 'payments', label: 'Pembayaran', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'expenses', label: 'Pengeluaran', icon: <TrendingDown className="w-5 h-5" /> },
    { id: 'reports', label: 'Laporan', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'invoice', label: 'Invoice', icon: <FileText className="w-5 h-5" /> },
    { id: 'settings', label: 'Pengaturan', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleSelectMenu = (id: ActiveMenu) => {
    setActiveMenu(id);
    setMobileOpen?.(false);
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[#0F172A] text-slate-200 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 ring-1 ring-white/20 font-bold text-base tracking-wider shrink-0">
            {settings.business.logoText || 'KM'}
          </div>
          <div className="overflow-hidden">
            <h1 className="font-extrabold text-sm sm:text-base text-white truncate tracking-tight">
              {settings.business.businessName || 'KOS MANAGEMENT'}
            </h1>
            <p className="text-[11px] text-slate-400 font-medium truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Owner / Admin Panel
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          id="btn-close-mobile-sidebar"
          onClick={() => setMobileOpen?.(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Tutup menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 py-4 custom-scrollbar">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Menu Utama
        </div>
        {menuItems.map((item) => {
          const isActive = activeMenu === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => handleSelectMenu(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-xs text-slate-400 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px]">WhatsApp Admin:</span>
          <span className="font-mono text-slate-200 font-semibold text-[11px]">
            {settings.business.whatsappNumber || '081803716514'}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Status Sistem:</span>
          <span className="text-emerald-400 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Online (Lokal MVP)
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 z-30 shadow-xl">
        {navContent}
      </aside>

      {/* Mobile Drawer (Collapsible) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            id="mobile-sidebar-backdrop"
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setMobileOpen?.(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
