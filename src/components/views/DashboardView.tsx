import React, { useMemo, useState } from 'react';
import { useKos } from '../../context/KosContext';
import { Room, RoomStatus } from '../../types';
import {
  Building2,
  BedDouble,
  Users,
  Receipt,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  MessageCircle,
  FileText,
  ChevronRight,
  AlertCircle,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  UserPlus,
  CreditCard,
  BarChart3,
  Search,
  Filter,
  Wrench,
  Bookmark,
  ShieldAlert,
} from 'lucide-react';
import {
  formatRupiah,
  formatDateIndo,
  generateWhatsappBillingUrl,
} from '../../utils/formatters';

interface DashboardViewProps {
  onQuickAction?: (
    action: 'add-bill' | 'add-payment' | 'add-expense' | 'add-tenant' | 'add-room' | 'add-property'
  ) => void;
  onOpenNewBill?: () => void;
  onOpenNewPayment?: () => void;
  onOpenNewExpense?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onQuickAction,
  onOpenNewBill,
  onOpenNewPayment,
  onOpenNewExpense,
}) => {
  const {
    properties,
    rooms,
    tenants,
    bills,
    payments,
    expenses,
    settings,
    setActiveMenu,
    openInvoice,
  } = useKos();

  // State for Visual Rooms section
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | RoomStatus>('all');
  const [roomSearchQuery, setRoomSearchQuery] = useState('');

  // Formatted today date in Indonesian (e.g., "Rabu, 9 September 2026")
  const todayFormatted = useMemo(() => {
    const now = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];
    const dayName = days[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    return `${dayName}, ${day} ${month} ${year}`;
  }, []);

  // Current Month String (YYYY-MM)
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIdx = now.getMonth();
  const currentMonthPrefix = `${currentYear}-${(currentMonthIdx + 1)
    .toString()
    .padStart(2, '0')}`;

  // KPI Statistics Calculation
  const stats = useMemo(() => {
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter((r) => r.status === 'Terisi').length;
    const emptyRooms = rooms.filter((r) => r.status === 'Kosong').length;
    const bookingRooms = rooms.filter((r) => r.status === 'Booking').length;
    const maintenanceRooms = rooms.filter((r) => r.status === 'Maintenance').length;

    const totalTenants = tenants.filter((t) => t.status === 'Aktif').length;

    // Monthly Income: Sum of recorded payments in the current month
    const totalIncomeThisMonth = payments
      .filter((p) => p.paymentDate.startsWith(currentMonthPrefix))
      .reduce((sum, p) => sum + p.amount, 0);

    // Monthly Expense: Sum of expenses recorded in current month
    const totalExpenseThisMonth = expenses
      .filter((e) => e.date.startsWith(currentMonthPrefix))
      .reduce((sum, e) => sum + e.amount, 0);

    // Net Profit
    const netProfitThisMonth = totalIncomeThisMonth - totalExpenseThisMonth;

    // Unpaid & Overdue Bills
    const unpaidBills = bills.filter(
      (b) => b.status === 'Belum Dibayar' || b.status === 'Terlambat'
    );
    const overdueBills = bills.filter((b) => b.status === 'Terlambat');
    const unpaidAmount = unpaidBills.reduce((sum, b) => sum + b.totalAmount, 0);

    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    return {
      totalRooms,
      occupiedRooms,
      emptyRooms,
      bookingRooms,
      maintenanceRooms,
      totalTenants,
      unpaidBillsCount: unpaidBills.length,
      overdueBillsCount: overdueBills.length,
      unpaidAmount,
      totalIncomeThisMonth,
      totalExpenseThisMonth,
      netProfitThisMonth,
      occupancyRate,
    };
  }, [rooms, tenants, bills, payments, expenses, currentMonthPrefix]);

  // Visual Room Matrix Filtered Items
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchProp =
        selectedPropertyFilter === 'all' || room.propertyId === selectedPropertyFilter;
      const matchStatus =
        selectedStatusFilter === 'all' || room.status === selectedStatusFilter;
      const matchSearch =
        roomSearchQuery.trim() === '' ||
        room.roomNumber.toLowerCase().includes(roomSearchQuery.toLowerCase()) ||
        room.type.toLowerCase().includes(roomSearchQuery.toLowerCase());
      return matchProp && matchStatus && matchSearch;
    });
  }, [rooms, selectedPropertyFilter, selectedStatusFilter, roomSearchQuery]);

  // Monthly breakdown for financial chart (last 6 months)
  const monthlyChartData = useMemo(() => {
    const monthsData: {
      key: string;
      label: string;
      income: number;
      expense: number;
      profit: number;
    }[] = [];

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'Mei',
      'Jun',
      'Jul',
      'Agu',
      'Sep',
      'Okt',
      'Nov',
      'Des',
    ];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonthIdx - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const prefix = `${y}-${(m + 1).toString().padStart(2, '0')}`;
      const label = `${monthNames[m]} ${y !== currentYear ? y.toString().slice(2) : ''}`;

      const monthIncome = payments
        .filter((p) => p.paymentDate.startsWith(prefix))
        .reduce((sum, p) => sum + p.amount, 0);

      const monthExpense = expenses
        .filter((e) => e.date.startsWith(prefix))
        .reduce((sum, e) => sum + e.amount, 0);

      monthsData.push({
        key: prefix,
        label,
        income: monthIncome,
        expense: monthExpense,
        profit: monthIncome - monthExpense,
      });
    }

    const maxVal = Math.max(
      ...monthsData.map((d) => Math.max(d.income, d.expense)),
      2000000
    );

    return { monthsData, maxVal };
  }, [payments, expenses, currentYear, currentMonthIdx]);

  // Recent 5 bills
  const recentBills = useMemo(() => {
    return [...bills]
      .sort((a, b) => new Date(b.billDate).getTime() - new Date(a.billDate).getTime())
      .slice(0, 5);
  }, [bills]);

  return (
    <div className="space-y-6 pb-16">
      {/* 1. HERO / WELCOME SECTION (PREMIUM MODERN) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        {/* Subtle Decorative Ambient Background */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-300 text-xs font-semibold backdrop-blur-md border border-white/10">
              <Calendar className="w-3.5 h-3.5 text-indigo-300" />
              <span>{todayFormatted}</span>
              <span className="text-white/40">•</span>
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Sistem Aktif
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Selamat datang kembali 👋
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Kelola bisnis kos Anda dengan lebih mudah. Pantau status kamar, tagihan sewa, dan laba bersih secara real-time.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <strong className="text-slate-200">{properties.length}</strong> Properti
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <BedDouble className="w-4 h-4 text-indigo-400" />
                <strong className="text-slate-200">{stats.totalRooms}</strong> Kamar
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-400" />
                <strong className="text-slate-200">{stats.totalTenants}</strong> Penghuni Aktif
              </span>
            </div>
          </div>

          {/* Quick Header Summary Pill */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                Okupansi Kamar
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {stats.occupancyRate}%
                </span>
                <span className="text-xs text-emerald-400 font-semibold">
                  ({stats.occupiedRooms} dari {stats.totalRooms} Terisi)
                </span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.occupancyRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. KPI CARDS (PREMIUM METRIC CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Kamar */}
        <div
          onClick={() => setActiveMenu('rooms')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Kamar
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-indigo-50 text-slate-700 group-hover:text-indigo-600 flex items-center justify-center transition-colors">
              <Building2 className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
            {stats.totalRooms}
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span>Unit di {properties.length} properti</span>
          </p>
        </div>

        {/* Kamar Terisi */}
        <div
          onClick={() => {
            setSelectedStatusFilter('Terisi');
            const el = document.getElementById('visual-rooms-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Kamar Terisi
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center transition-colors">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight font-mono">
            {stats.occupiedRooms}
          </div>
          <p className="text-xs text-emerald-700 font-medium mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>🟢 {stats.occupancyRate}% Okupansi</span>
          </p>
        </div>

        {/* Kamar Kosong */}
        <div
          onClick={() => {
            setSelectedStatusFilter('Kosong');
            const el = document.getElementById('visual-rooms-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Kamar Kosong
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center transition-colors">
              <BedDouble className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight font-mono">
            {stats.emptyRooms}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span>⚪ Siap disewakan</span>
          </p>
        </div>

        {/* Pendapatan Bulan Ini */}
        <div
          onClick={() => setActiveMenu('payments')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Pendapatan
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center transition-colors">
              <ArrowUpRight className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {formatRupiah(stats.totalIncomeThisMonth)}
          </div>
          <p className="text-xs text-slate-500 mt-1 truncate">
            Pemasukan sewa bulan ini
          </p>
        </div>

        {/* Pengeluaran */}
        <div
          onClick={() => setActiveMenu('expenses')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Pengeluaran
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center transition-colors">
              <ArrowDownRight className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {formatRupiah(stats.totalExpenseThisMonth)}
          </div>
          <p className="text-xs text-slate-500 mt-1 truncate">
            Biaya operasional & kos
          </p>
        </div>

        {/* Laba Bersih */}
        <div
          onClick={() => setActiveMenu('reports')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Laba Bersih
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                stats.netProfitThisMonth >= 0
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'bg-amber-50 text-amber-600'
              }`}
            >
              <DollarSign className="w-4.5 h-4.5" />
            </div>
          </div>
          <div
            className={`text-lg sm:text-xl font-black tracking-tight ${
              stats.netProfitThisMonth >= 0 ? 'text-indigo-600' : 'text-rose-600'
            }`}
          >
            {formatRupiah(stats.netProfitThisMonth)}
          </div>
          <p className="text-xs text-slate-500 mt-1 truncate">
            Pemasukan - pengeluaran
          </p>
        </div>
      </div>

      {/* Overdue/Unpaid Alert Banner (If Any) */}
      {stats.unpaidBillsCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold">
                Terdapat {stats.unpaidBillsCount} tagihan sewa belum lunas (Total {formatRupiah(stats.unpaidAmount)})
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                {stats.overdueBillsCount > 0
                  ? `${stats.overdueBillsCount} tagihan telah melewati tanggal jatuh tempo.`
                  : 'Kirim pengingat WhatsApp dengan satu klik ke nomor penghuni.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveMenu('bills')}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Kelola Tagihan</span>
          </button>
        </div>
      )}

      {/* 3. QUICK ACTION BAR (SECTION I) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-indigo-600" />
              Quick Action
            </h3>
            <p className="text-xs text-slate-500">
              Akses cepat ke aksi operasional terpenting pengelola kos
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Tambah Penghuni */}
          <button
            id="quick-add-tenant"
            onClick={() => onQuickAction?.('add-tenant')}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/80 border border-slate-200/70 hover:border-indigo-200 text-left transition-all group flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-xl bg-white group-hover:bg-indigo-600 text-slate-700 group-hover:text-white flex items-center justify-center shadow-xs transition-colors mb-3">
              <UserPlus className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-900 block">
                Tambah Penghuni
              </span>
              <span className="text-[11px] text-slate-500">Registrasi data baru</span>
            </div>
          </button>

          {/* Tambah Kamar */}
          <button
            id="quick-add-room"
            onClick={() => onQuickAction?.('add-room')}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/80 border border-slate-200/70 hover:border-indigo-200 text-left transition-all group flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-xl bg-white group-hover:bg-indigo-600 text-slate-700 group-hover:text-white flex items-center justify-center shadow-xs transition-colors mb-3">
              <BedDouble className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-900 block">
                Tambah Kamar
              </span>
              <span className="text-[11px] text-slate-500">Input unit baru</span>
            </div>
          </button>

          {/* Buat Tagihan */}
          <button
            id="quick-add-bill"
            onClick={() => onQuickAction?.('add-bill') || onOpenNewBill?.()}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/80 border border-slate-200/70 hover:border-indigo-200 text-left transition-all group flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-xl bg-white group-hover:bg-indigo-600 text-slate-700 group-hover:text-white flex items-center justify-center shadow-xs transition-colors mb-3">
              <Receipt className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-900 block">
                Buat Tagihan
              </span>
              <span className="text-[11px] text-slate-500">Terbitkan invoice sewa</span>
            </div>
          </button>

          {/* Catat Pembayaran */}
          <button
            id="quick-record-payment"
            onClick={() => onQuickAction?.('add-payment') || onOpenNewPayment?.()}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/80 border border-slate-200/70 hover:border-emerald-200 text-left transition-all group flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-xl bg-white group-hover:bg-emerald-600 text-slate-700 group-hover:text-white flex items-center justify-center shadow-xs transition-colors mb-3">
              <CreditCard className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-900 block">
                Catat Pembayaran
              </span>
              <span className="text-[11px] text-slate-500">Input pelunasan sewa</span>
            </div>
          </button>

          {/* Catat Pengeluaran */}
          <button
            id="quick-record-expense"
            onClick={() => onQuickAction?.('add-expense') || onOpenNewExpense?.()}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-rose-50/80 border border-slate-200/70 hover:border-rose-200 text-left transition-all group flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-xl bg-white group-hover:bg-rose-600 text-slate-700 group-hover:text-white flex items-center justify-center shadow-xs transition-colors mb-3">
              <TrendingDown className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-rose-900 block">
                Catat Pengeluaran
              </span>
              <span className="text-[11px] text-slate-500">Biaya operasional kos</span>
            </div>
          </button>

          {/* Lihat Laporan */}
          <button
            id="quick-view-reports"
            onClick={() => setActiveMenu('reports')}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/80 border border-slate-200/70 hover:border-indigo-200 text-left transition-all group flex flex-col justify-between"
          >
            <div className="w-9 h-9 rounded-xl bg-white group-hover:bg-indigo-600 text-slate-700 group-hover:text-white flex items-center justify-center shadow-xs transition-colors mb-3">
              <BarChart3 className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-900 block">
                Lihat Laporan
              </span>
              <span className="text-[11px] text-slate-500">Laba rugi & keuangan</span>
            </div>
          </button>
        </div>
      </div>

      {/* 4. STATUS KAMAR VISUAL (SECTION E: MATRIX / GRID KAMAR) */}
      <div id="visual-rooms-section" className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Status Kamar Visual
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                {filteredRooms.length} Kamar
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Tampilan visual status hunian seluruh unit kos secara langsung
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search room number */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kamar..."
                value={roomSearchQuery}
                onChange={(e) => setRoomSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none w-36 focus:w-48 transition-all"
              />
            </div>

            {/* Property Selector */}
            <select
              value={selectedPropertyFilter}
              onChange={(e) => setSelectedPropertyFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 outline-none"
            >
              <option value="all">Semua Properti ({properties.length})</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setActiveMenu('rooms')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 pl-2"
            >
              <span>Kelola Detail</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Filter Badges (Pills) */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <button
            onClick={() => setSelectedStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedStatusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({rooms.length})
          </button>
          <button
            onClick={() => setSelectedStatusFilter('Terisi')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
              selectedStatusFilter === 'Terisi'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <span>🟢</span> Terisi ({stats.occupiedRooms})
          </button>
          <button
            onClick={() => setSelectedStatusFilter('Kosong')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
              selectedStatusFilter === 'Kosong'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>⚪</span> Kosong ({stats.emptyRooms})
          </button>
          <button
            onClick={() => setSelectedStatusFilter('Booking')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
              selectedStatusFilter === 'Booking'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <span>🟡</span> Booking ({stats.bookingRooms})
          </button>
          <button
            onClick={() => setSelectedStatusFilter('Maintenance')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 ${
              selectedStatusFilter === 'Maintenance'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <span>🔴</span> Maintenance ({stats.maintenanceRooms})
          </button>
        </div>

        {/* Visual Room Grid */}
        {filteredRooms.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200">
            <BedDouble className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">Tidak ada kamar pada filter ini</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Coba ganti filter status atau tambahkan kamar baru.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
            {filteredRooms.map((room) => {
              const property = properties.find((p) => p.id === room.propertyId);
              const activeTenant = tenants.find(
                (t) => t.roomId === room.id && t.status === 'Aktif'
              );

              // Status styling
              let statusBorder = 'border-slate-200';
              let statusBadge = (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  ⚪ KOSONG
                </span>
              );

              if (room.status === 'Terisi') {
                statusBorder = 'border-emerald-200/90 hover:border-emerald-400';
                statusBadge = (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    🟢 TERISI
                  </span>
                );
              } else if (room.status === 'Booking') {
                statusBorder = 'border-amber-200/90 hover:border-amber-400';
                statusBadge = (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    🟡 BOOKING
                  </span>
                );
              } else if (room.status === 'Maintenance') {
                statusBorder = 'border-rose-200/90 hover:border-rose-400';
                statusBadge = (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    🔴 MAINTENANCE
                  </span>
                );
              }

              return (
                <div
                  key={room.id}
                  className={`bg-white rounded-2xl p-4 border ${statusBorder} shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative`}
                >
                  <div>
                    {/* Top Row: Room Number & Status */}
                    <div className="flex items-start justify-between gap-1 mb-2">
                      <div>
                        <h4 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          Kamar {room.roomNumber}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-medium block truncate max-w-[130px]">
                          {property?.name || 'Kos'} • {room.type}
                        </span>
                      </div>
                      {statusBadge}
                    </div>

                    {/* Price */}
                    <div className="my-2.5 py-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-baseline justify-between">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Sewa:
                      </span>
                      <span className="text-xs font-black text-slate-900 font-mono">
                        {formatRupiah(room.monthlyPrice)}
                      </span>
                    </div>

                    {/* Tenant Info if Occupied */}
                    {activeTenant ? (
                      <div className="p-2 rounded-xl bg-indigo-50/60 border border-indigo-100/70 text-[11px]">
                        <span className="text-slate-500 block text-[10px]">Penghuni:</span>
                        <strong className="text-slate-900 block truncate">
                          {activeTenant.fullName}
                        </strong>
                        <span className="text-indigo-600 font-mono text-[10px]">
                          Jatuh tempo tgl {activeTenant.dueDateDay}
                        </span>
                      </div>
                    ) : room.status === 'Kosong' ? (
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center text-[11px] text-slate-400">
                        Siap dihuni
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 truncate">
                        {room.notes || 'Catatan unit'}
                      </div>
                    )}
                  </div>

                  {/* Quick Card Action */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    {room.status === 'Kosong' ? (
                      <button
                        onClick={() => onQuickAction?.('add-tenant')}
                        className="w-full py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors flex items-center justify-center gap-1"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>+ Isi Penghuni</span>
                      </button>
                    ) : activeTenant ? (
                      <button
                        onClick={() => onQuickAction?.('add-bill')}
                        className="w-full py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] transition-colors flex items-center justify-center gap-1"
                      >
                        <Receipt className="w-3 h-3" />
                        <span>Tagihan Sewa</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveMenu('rooms')}
                        className="w-full py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
                      >
                        Kelola Kamar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. CHARTS & RECENT BILLS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pemasukan vs Pengeluaran 6 Bulan Terakhir */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4.5 h-4.5 text-indigo-600" />
                Tren Keuangan (6 Bulan Terakhir)
              </h3>
              <p className="text-xs text-slate-500">
                Perbandingan pemasukan sewa vs pengeluaran operasional usaha kos
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-xs bg-indigo-600"></span>
                Pemasukan
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-xs bg-rose-400"></span>
                Pengeluaran
              </span>
            </div>
          </div>

          {/* Monthly Bar Chart */}
          <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 pt-6 border-b border-slate-100 pb-2">
            {monthlyChartData.monthsData.map((d) => {
              const incomeHeight = Math.max(
                6,
                Math.round((d.income / monthlyChartData.maxVal) * 100)
              );
              const expenseHeight = Math.max(
                4,
                Math.round((d.expense / monthlyChartData.maxVal) * 100)
              );

              return (
                <div
                  key={d.key}
                  className="flex-1 flex flex-col items-center gap-2 group h-full justify-end"
                >
                  <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-44 px-0.5">
                    {/* Income Bar */}
                    <div
                      className="w-full max-w-[22px] bg-indigo-600 hover:bg-indigo-700 rounded-t-md transition-all relative cursor-pointer"
                      style={{ height: `${incomeHeight}%` }}
                      title={`Pemasukan: ${formatRupiah(d.income)}`}
                    />
                    {/* Expense Bar */}
                    <div
                      className="w-full max-w-[22px] bg-rose-400 hover:bg-rose-500 rounded-t-md transition-all relative cursor-pointer"
                      style={{ height: `${expenseHeight}%` }}
                      title={`Pengeluaran: ${formatRupiah(d.expense)}`}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 group-hover:text-indigo-600 transition-colors">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex items-center justify-between text-xs text-slate-500">
            <span>
              Laba Bersih Bulan Ini:{' '}
              <strong
                className={
                  stats.netProfitThisMonth >= 0
                    ? 'text-indigo-600 font-bold'
                    : 'text-rose-600 font-bold'
                }
              >
                {formatRupiah(stats.netProfitThisMonth)}
              </strong>
            </span>
            <button
              onClick={() => setActiveMenu('reports')}
              className="text-indigo-600 hover:text-indigo-700 font-semibold inline-flex items-center gap-1"
            >
              Lihat Laporan Lengkap <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Ringkasan Okupansi & Distribusi Properti */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Distribusi Status</h3>
                <p className="text-xs text-slate-500">Status seluruh unit kamar saat ini</p>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-slate-100 font-bold text-xs text-slate-700">
                {stats.occupancyRate}% Terisi
              </div>
            </div>

            {/* Visual Stacked Progress Bar */}
            <div className="h-3 w-full rounded-full bg-slate-100 flex overflow-hidden mb-6">
              {stats.totalRooms > 0 ? (
                <>
                  <div
                    style={{
                      width: `${(stats.occupiedRooms / stats.totalRooms) * 100}%`,
                    }}
                    className="bg-emerald-500 h-full"
                    title={`Terisi: ${stats.occupiedRooms}`}
                  />
                  <div
                    style={{
                      width: `${(stats.emptyRooms / stats.totalRooms) * 100}%`,
                    }}
                    className="bg-slate-300 h-full"
                    title={`Kosong: ${stats.emptyRooms}`}
                  />
                  <div
                    style={{
                      width: `${(stats.bookingRooms / stats.totalRooms) * 100}%`,
                    }}
                    className="bg-amber-400 h-full"
                    title={`Booking: ${stats.bookingRooms}`}
                  />
                  <div
                    style={{
                      width: `${(stats.maintenanceRooms / stats.totalRooms) * 100}%`,
                    }}
                    className="bg-rose-400 h-full"
                    title={`Maintenance: ${stats.maintenanceRooms}`}
                  />
                </>
              ) : (
                <div className="w-full bg-slate-200 h-full" />
              )}
            </div>

            {/* List Breakdown */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-semibold text-slate-700">Kamar Terisi</span>
                </div>
                <span className="text-xs font-bold text-emerald-700">
                  {stats.occupiedRooms} Unit
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                  <span className="text-xs font-semibold text-slate-700">Kamar Kosong</span>
                </div>
                <span className="text-xs font-bold text-slate-800">{stats.emptyRooms} Unit</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/50 border border-amber-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span className="text-xs font-semibold text-slate-700">Dalam Booking</span>
                </div>
                <span className="text-xs font-bold text-amber-800">{stats.bookingRooms} Unit</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/50 border border-rose-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                  <span className="text-xs font-semibold text-slate-700">Perbaikan / Maintenance</span>
                </div>
                <span className="text-xs font-bold text-rose-800">
                  {stats.maintenanceRooms} Unit
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveMenu('rooms')}
            className="w-full mt-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <BedDouble className="w-4 h-4 text-slate-500" />
            <span>Kelola Status & Harga Kamar</span>
          </button>
        </div>
      </div>

      {/* 6. TAGIHAN TERBARU & PENAGIHAN WHATSAPP */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Receipt className="w-4.5 h-4.5 text-indigo-600" />
              Tagihan Terbaru
            </h3>
            <p className="text-xs text-slate-500">
              Daftar tagihan sewa terbaru beserta tombol kirim invoice resmi via WhatsApp
            </p>
          </div>

          <button
            id="btn-dash-view-all-bills"
            onClick={() => setActiveMenu('bills')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Lihat Semua ({bills.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {recentBills.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">
            Belum ada tagihan sewa yang diterbitkan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">No. Invoice</th>
                  <th className="py-3.5 px-4">Penghuni & Kamar</th>
                  <th className="py-3.5 px-4">Periode</th>
                  <th className="py-3.5 px-4">Nominal</th>
                  <th className="py-3.5 px-4">Jatuh Tempo</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentBills.map((bill) => {
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
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{bill.period}</td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        {formatRupiah(bill.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {formatDateIndo(bill.dueDate)}
                      </td>
                      <td className="py-3.5 px-4">
                        {bill.status === 'Lunas' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Lunas
                          </span>
                        )}
                        {bill.status === 'Belum Dibayar' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            Belum Dibayar
                          </span>
                        )}
                        {bill.status === 'Terlambat' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertCircle className="w-3 h-3" />
                            Terlambat
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Tagih WhatsApp button */}
                          {tenant && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs"
                              title="Tagih via WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Tagih WA</span>
                            </a>
                          )}

                          {/* Lihat Invoice */}
                          <button
                            onClick={() => openInvoice(bill)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                            title="Buka Invoice"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Invoice</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
