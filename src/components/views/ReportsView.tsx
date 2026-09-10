import React, { useState, useMemo } from 'react';
import { useKos } from '../../context/KosContext';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Calendar,
  Building2,
  PieChart as PieIcon,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  FileText,
  Filter,
  Receipt,
  BedDouble,
  Users,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  formatRupiah,
  formatDateIndo,
} from '../../utils/formatters';
import { exportToExcel, exportToPDF } from '../../utils/exportEngine';

type PeriodMode = 'weekly' | 'monthly' | 'yearly' | 'custom';

export const ReportsView: React.FC = () => {
  const { payments, expenses, properties, bills, rooms, settings } = useKos();

  const currentYear = new Date().getFullYear();
  const currentMonthIdx = new Date().getMonth();

  // Period state
  const [periodMode, setPeriodMode] = useState<PeriodMode>('monthly');
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthIdx); // 0-11
  const [selectedProperty, setSelectedProperty] = useState<string>('all');

  // Custom date range state
  const todayStr = new Date().toISOString().split('T')[0];
  const startOfMonthStr = `${currentYear}-${(currentMonthIdx + 1).toString().padStart(2, '0')}-01`;
  const [customStartDate, setCustomStartDate] = useState<string>(startOfMonthStr);
  const [customEndDate, setCustomEndDate] = useState<string>(todayStr);

  // Weekly selector (picks current date and calculates week start & end)
  const [weeklyReferenceDate, setWeeklyReferenceDate] = useState<string>(todayStr);

  // Table active sub-tab
  const [ledgerTab, setLedgerTab] = useState<'all' | 'income' | 'expense' | 'bills'>('all');

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Calculate start and end date boundary based on periodMode
  const { dateRangeStart, dateRangeEnd, periodLabel } = useMemo(() => {
    if (periodMode === 'weekly') {
      const ref = new Date(weeklyReferenceDate);
      const day = ref.getDay(); // 0 is Sunday
      // Let's set Monday as start of week
      const diffToMonday = ref.getDate() - (day === 0 ? 6 : day - 1);
      const monday = new Date(ref);
      monday.setDate(diffToMonday);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const startStr = monday.toISOString().split('T')[0];
      const endStr = sunday.toISOString().split('T')[0];
      return {
        dateRangeStart: startStr,
        dateRangeEnd: endStr,
        periodLabel: `Minggu (${formatDateIndo(startStr)} - ${formatDateIndo(endStr)})`,
      };
    } else if (periodMode === 'monthly') {
      const startStr = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-01`;
      const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      const endStr = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-${lastDay}`;
      return {
        dateRangeStart: startStr,
        dateRangeEnd: endStr,
        periodLabel: `Bulan ${monthNames[selectedMonth]} ${selectedYear}`,
      };
    } else if (periodMode === 'yearly') {
      const startStr = `${selectedYear}-01-01`;
      const endStr = `${selectedYear}-12-31`;
      return {
        dateRangeStart: startStr,
        dateRangeEnd: endStr,
        periodLabel: `Tahun ${selectedYear}`,
      };
    } else {
      return {
        dateRangeStart: customStartDate,
        dateRangeEnd: customEndDate,
        periodLabel: `Kustom (${formatDateIndo(customStartDate)} s/d ${formatDateIndo(customEndDate)})`,
      };
    }
  }, [
    periodMode,
    weeklyReferenceDate,
    selectedYear,
    selectedMonth,
    customStartDate,
    customEndDate,
  ]);

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchDate = p.paymentDate >= dateRangeStart && p.paymentDate <= dateRangeEnd;
      const matchProp = selectedProperty === 'all' || p.propertyId === selectedProperty;
      return matchDate && matchProp;
    });
  }, [payments, dateRangeStart, dateRangeEnd, selectedProperty]);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchDate = e.date >= dateRangeStart && e.date <= dateRangeEnd;
      const matchProp = selectedProperty === 'all' || e.propertyId === selectedProperty;
      return matchDate && matchProp;
    });
  }, [expenses, dateRangeStart, dateRangeEnd, selectedProperty]);

  // Filtered Bills created in this period
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const matchDate = b.billDate >= dateRangeStart && b.billDate <= dateRangeEnd;
      const matchProp = selectedProperty === 'all' || b.propertyId === selectedProperty;
      return matchDate && matchProp;
    });
  }, [bills, dateRangeStart, dateRangeEnd, selectedProperty]);

  // Financial aggregates
  const totalIncome = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0';

  const totalBillsAmount = filteredBills.reduce((sum, b) => sum + b.totalAmount, 0);
  const unpaidBillsInPeriod = filteredBills.filter(
    (b) => b.status === 'Belum Dibayar' || b.status === 'Terlambat'
  );
  const unpaidAmountInPeriod = unpaidBillsInPeriod.reduce((sum, b) => sum + b.totalAmount, 0);

  // Category breakdown for expenses
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredExpenses]);

  // Monthly breakdown for Yearly view
  const yearlyMonthlyData = useMemo(() => {
    return monthNames.map((name, idx) => {
      const start = `${selectedYear}-${(idx + 1).toString().padStart(2, '0')}-01`;
      const lastDay = new Date(selectedYear, idx + 1, 0).getDate();
      const end = `${selectedYear}-${(idx + 1).toString().padStart(2, '0')}-${lastDay}`;

      const inc = payments
        .filter(
          (p) =>
            p.paymentDate >= start &&
            p.paymentDate <= end &&
            (selectedProperty === 'all' || p.propertyId === selectedProperty)
        )
        .reduce((sum, p) => sum + p.amount, 0);

      const exp = expenses
        .filter(
          (e) =>
            e.date >= start &&
            e.date <= end &&
            (selectedProperty === 'all' || e.propertyId === selectedProperty)
        )
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        month: name.slice(0, 3),
        monthFull: name,
        income: inc,
        expense: exp,
        profit: inc - exp,
      };
    });
  }, [monthNames, selectedYear, payments, expenses, selectedProperty]);

  const maxYearlyBarVal = useMemo(() => {
    return Math.max(
      ...yearlyMonthlyData.map((d) => Math.max(d.income, d.expense)),
      1000000
    );
  }, [yearlyMonthlyData]);

  // Unified ledger list for table display
  const ledgerEntries = useMemo(() => {
    const items: {
      id: string;
      date: string;
      type: 'income' | 'expense' | 'bill';
      description: string;
      refNumber?: string;
      propertyName: string;
      categoryOrMethod: string;
      amount: number;
    }[] = [];

    if (ledgerTab === 'all' || ledgerTab === 'income') {
      filteredPayments.forEach((p) => {
        const prop = properties.find((pr) => pr.id === p.propertyId);
        items.push({
          id: p.id,
          date: p.paymentDate,
          type: 'income',
          description: `Pembayaran Sewa (${p.tenantName || 'Penghuni'})`,
          refNumber: p.invoiceNumber,
          propertyName: prop?.name || 'Kos',
          categoryOrMethod: p.method,
          amount: p.amount,
        });
      });
    }

    if (ledgerTab === 'all' || ledgerTab === 'expense') {
      filteredExpenses.forEach((e) => {
        const prop = properties.find((pr) => pr.id === e.propertyId);
        items.push({
          id: e.id,
          date: e.date,
          type: 'expense',
          description: e.description,
          refNumber: '-',
          propertyName: prop?.name || 'Semua',
          categoryOrMethod: e.category,
          amount: e.amount,
        });
      });
    }

    if (ledgerTab === 'bills') {
      filteredBills.forEach((b) => {
        const prop = properties.find((pr) => pr.id === b.propertyId);
        items.push({
          id: b.id,
          date: b.billDate,
          type: 'bill',
          description: `Tagihan Periode ${b.period}`,
          refNumber: b.invoiceNumber,
          propertyName: prop?.name || 'Kos',
          categoryOrMethod: b.status,
          amount: b.totalAmount,
        });
      });
    }

    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [ledgerTab, filteredPayments, filteredExpenses, filteredBills, properties]);

  // EXPORT TO EXCEL
  const handleExportExcel = () => {
    const filename = `Laporan_Keuangan_${periodMode}_${dateRangeStart}_sd_${dateRangeEnd}`;
    const headers = ['No', 'Tipe', 'Tanggal', 'No. Ref / Invoice', 'Keterangan', 'Properti', 'Kategori / Metode', 'Nominal'];

    const rows = ledgerEntries.map((item, index) => [
      index + 1,
      item.type === 'income' ? 'Pemasukan' : item.type === 'expense' ? 'Pengeluaran' : 'Tagihan',
      item.date,
      item.refNumber || '-',
      item.description,
      item.propertyName,
      item.categoryOrMethod,
      item.amount,
    ]);

    // Summary row
    rows.push([]);
    rows.push(['', 'TOTAL PEMASUKAN', '', '', '', '', '', totalIncome]);
    rows.push(['', 'TOTAL PENGELUARAN', '', '', '', '', '', totalExpense]);
    rows.push(['', 'LABA BERSIH', '', '', '', '', '', netProfit]);

    exportToExcel({
      filename,
      title: `LAPORAN KEUANGAN (${periodLabel})`,
      subtitle: `Total Pemasukan: ${formatRupiah(totalIncome)} | Pengeluaran: ${formatRupiah(totalExpense)} | Laba Bersih: ${formatRupiah(netProfit)}`,
      businessName: settings.business.businessName,
      headers,
      rows,
    });
  };

  // EXPORT TO PDF
  const handleExportPDF = () => {
    const filename = `Laporan_Keuangan_${periodMode}_${dateRangeStart}`;
    const headers = ['No', 'Tipe', 'Tanggal', 'No. Invoice', 'Keterangan', 'Properti', 'Kategori', 'Nominal'];

    const rows = ledgerEntries.map((item, index) => [
      index + 1,
      item.type === 'income' ? 'Pemasukan' : item.type === 'expense' ? 'Pengeluaran' : 'Tagihan',
      formatDateIndo(item.date),
      item.refNumber || '-',
      item.description,
      item.propertyName,
      item.categoryOrMethod,
      formatRupiah(item.amount),
    ]);

    exportToPDF({
      filename,
      title: `LAPORAN KEUANGAN - ${periodLabel.toUpperCase()}`,
      subtitle: `Total Pemasukan: ${formatRupiah(totalIncome)} | Pengeluaran: ${formatRupiah(totalExpense)} | Laba Bersih: ${formatRupiah(netProfit)} (Margin: ${profitMargin}%)`,
      businessName: settings.business.businessName,
      address: `${settings.business.address}, ${settings.business.city}`,
      ownerName: settings.business.ownerName,
      ownerPhone: settings.business.whatsappNumber,
      orientation: 'landscape',
      headers,
      rows,
      footerNote: `Dicetak resmi dari ${settings.business.businessName} - WhatsApp Pengelola: ${settings.business.whatsappNumber}`,
    });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. HEADER & PERIOD SELECTOR TABS */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
              Laporan Keuangan & Laba Rugi
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Pantau arus kas masuk, pengeluaran operasional, dan laba bersih dengan fleksibilitas periode.
            </p>
          </div>

          {/* Export Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-export-excel-report"
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel</span>
            </button>

            <button
              id="btn-export-pdf-report"
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Period Mode Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
            Periode:
          </span>
          {(
            [
              { id: 'weekly', label: 'Mingguan' },
              { id: 'monthly', label: 'Bulanan' },
              { id: 'yearly', label: 'Tahunan' },
              { id: 'custom', label: 'Kustom Tanggal' },
            ] as { id: PeriodMode; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              id={`tab-period-${tab.id}`}
              type="button"
              onClick={() => setPeriodMode(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                periodMode === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Period Interactive Filter Controls */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-wrap items-center gap-4 text-xs">
          {/* Properti Filter */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600">Properti:</span>
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-medium text-slate-700 outline-none shadow-2xs"
            >
              <option value="all">Semua Properti ({properties.length})</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Conditional filter inputs */}
          {periodMode === 'weekly' && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">Pilih Tanggal Acuan Minggu:</span>
              <input
                type="date"
                value={weeklyReferenceDate}
                onChange={(e) => setWeeklyReferenceDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-medium text-slate-800 outline-none shadow-2xs"
              />
            </div>
          )}

          {periodMode === 'monthly' && (
            <>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600">Bulan:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-medium text-slate-700 outline-none shadow-2xs"
                >
                  {monthNames.map((name, idx) => (
                    <option key={name} value={idx}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600">Tahun:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-medium text-slate-700 outline-none shadow-2xs"
                >
                  {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {periodMode === 'yearly' && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">Tahun Laporan:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-medium text-slate-700 outline-none shadow-2xs"
              >
                {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}

          {periodMode === 'custom' && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600">Dari:</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-medium text-slate-800 outline-none shadow-2xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600">Sampai:</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-medium text-slate-800 outline-none shadow-2xs"
                />
              </div>
            </div>
          )}

          <div className="ml-auto text-slate-500 font-medium">
            Periode Aktif: <strong className="text-slate-800">{periodLabel}</strong>
          </div>
        </div>
      </div>

      {/* 2. SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pemasukan */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Pemasukan
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight font-mono">
            {formatRupiah(totalIncome)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {filteredPayments.length} transaksi pembayaran sewa
          </p>
        </div>

        {/* Total Pengeluaran */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Pengeluaran
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight font-mono">
            {formatRupiah(totalExpense)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {filteredExpenses.length} pos operasional tercatat
          </p>
        </div>

        {/* Laba Bersih */}
        <div
          className={`rounded-3xl p-5 border shadow-xs ${
            netProfit >= 0
              ? 'bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-indigo-800'
              : 'bg-rose-900 text-white border-rose-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider">
              Laba Bersih (Net Profit)
            </span>
            <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center">
              <DollarSign className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
            {formatRupiah(netProfit)}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                netProfit >= 0 ? 'bg-emerald-400/20 text-emerald-300' : 'bg-rose-400/20 text-rose-300'
              }`}
            >
              Margin: {profitMargin}%
            </span>
            <span className="text-xs text-slate-300">Pemasukan - Pengeluaran</span>
          </div>
        </div>

        {/* Tagihan Dibuat & Belum Lunas */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Piutang Sewa
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Receipt className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight font-mono">
            {formatRupiah(unpaidAmountInPeriod)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {unpaidBillsInPeriod.length} tagihan belum dibayar
          </p>
        </div>
      </div>

      {/* 3. CHARTS / VISUALIZATION & CATEGORY BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart Pemasukan vs Pengeluaran per Bulan */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Tren Pemasukan vs Pengeluaran ({selectedYear})
              </h3>
              <p className="text-xs text-slate-500">
                Perbandingan arus kas masuk dan biaya operasional bulanan
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
                Pemasukan
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-rose-400"></span>
                Pengeluaran
              </span>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <div className="h-60 flex items-end justify-between gap-1 sm:gap-2 px-2 border-b border-slate-100 pb-2">
              {yearlyMonthlyData.map((d, i) => {
                const incH = Math.round((d.income / maxYearlyBarVal) * 100);
                const expH = Math.round((d.expense / maxYearlyBarVal) * 100);
                const isSelectedMonth = periodMode === 'monthly' && selectedMonth === i;

                return (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-14 bg-slate-900 text-white text-[10px] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap shadow-lg">
                      <p className="font-bold">{d.monthFull} {selectedYear}</p>
                      <p className="text-emerald-300">Masuk: {formatRupiah(d.income)}</p>
                      <p className="text-rose-300">Keluar: {formatRupiah(d.expense)}</p>
                      <p className="font-semibold">Laba: {formatRupiah(d.profit)}</p>
                    </div>

                    <div className="w-full flex items-end justify-center gap-1 h-44">
                      {/* Income bar */}
                      <div
                        className="w-full max-w-[14px] bg-emerald-500 rounded-t-sm transition-all duration-300 group-hover:bg-emerald-600"
                        style={{ height: `${Math.max(incH, 3)}%` }}
                      />
                      {/* Expense bar */}
                      <div
                        className="w-full max-w-[14px] bg-rose-400 rounded-t-sm transition-all duration-300 group-hover:bg-rose-500"
                        style={{ height: `${Math.max(expH, 3)}%` }}
                      />
                    </div>

                    <span
                      className={`text-[10px] sm:text-xs font-semibold ${
                        isSelectedMonth ? 'text-indigo-600 font-bold' : 'text-slate-500'
                      }`}
                    >
                      {d.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Breakdown Pengeluaran per Kategori */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Pengeluaran per Kategori
            </h3>
            <p className="text-xs text-slate-500">
              Distribusi biaya pada periode {periodLabel}
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {categoryBreakdown.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Tidak ada data pengeluaran pada periode ini.
              </div>
            ) : (
              categoryBreakdown.map(([cat, amount]) => {
                const pct = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{cat}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">{pct}%</span>
                        <span className="font-bold font-mono text-slate-900">
                          {formatRupiah(amount)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 4. DETAIL BUKU TRANSAKSI (LEDGER TABLE) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Buku Rincian Transaksi
            </h3>
            <p className="text-xs text-slate-500">
              Daftar seluruh mutasi kas dan tagihan dalam periode terpilih
            </p>
          </div>

          {/* Table filter tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setLedgerTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                ledgerTab === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({filteredPayments.length + filteredExpenses.length})
            </button>
            <button
              onClick={() => setLedgerTab('income')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                ledgerTab === 'income'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pemasukan ({filteredPayments.length})
            </button>
            <button
              onClick={() => setLedgerTab('expense')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                ledgerTab === 'expense'
                  ? 'bg-white text-rose-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pengeluaran ({filteredExpenses.length})
            </button>
            <button
              onClick={() => setLedgerTab('bills')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                ledgerTab === 'bills'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tagihan ({filteredBills.length})
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/80">
              <tr>
                <th className="px-5 py-3">Tipe</th>
                <th className="px-5 py-3">Tanggal</th>
                <th className="px-5 py-3">No. Invoice / Ref</th>
                <th className="px-5 py-3">Keterangan</th>
                <th className="px-5 py-3">Properti</th>
                <th className="px-5 py-3">Kategori / Metode</th>
                <th className="px-5 py-3 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ledgerEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    Tidak ada transaksi pada filter dan periode ini.
                  </td>
                </tr>
              ) : (
                ledgerEntries.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {item.type === 'income' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <TrendingUp className="w-3 h-3" /> Pemasukan
                        </span>
                      )}
                      {item.type === 'expense' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                          <TrendingDown className="w-3 h-3" /> Pengeluaran
                        </span>
                      )}
                      {item.type === 'bill' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Receipt className="w-3 h-3" /> Tagihan
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-medium text-slate-600">
                      {formatDateIndo(item.date)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-mono font-bold text-slate-800">
                      {item.refNumber}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-900 max-w-xs truncate">
                      {item.description}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-600">
                      {item.propertyName}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-600">
                      {item.categoryOrMethod}
                    </td>
                    <td
                      className={`px-5 py-3.5 whitespace-nowrap text-right font-mono font-black text-sm ${
                        item.type === 'income'
                          ? 'text-emerald-600'
                          : item.type === 'expense'
                          ? 'text-rose-600'
                          : 'text-slate-900'
                      }`}
                    >
                      {item.type === 'expense' ? `-${formatRupiah(item.amount)}` : formatRupiah(item.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Table Footer */}
            <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-200">
              <tr>
                <td colSpan={6} className="px-5 py-3 text-right uppercase tracking-wider text-[11px] text-slate-600">
                  Laba Bersih Periode Ini:
                </td>
                <td className="px-5 py-3 text-right font-mono font-black text-base text-indigo-600">
                  {formatRupiah(netProfit)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
