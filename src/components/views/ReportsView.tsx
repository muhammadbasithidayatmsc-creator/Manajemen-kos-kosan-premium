import React, { useState } from 'react';
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
} from 'lucide-react';
import {
  formatRupiah,
  formatDateIndo,
  exportToCSV,
} from '../../utils/formatters';

export const ReportsView: React.FC = () => {
  const { payments, expenses, properties, bills } = useKos();

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedProperty, setSelectedProperty] = useState<string>('all');

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Filter payments
  const filteredPayments = payments.filter((p) => {
    const pDate = new Date(p.paymentDate);
    const matchYear = pDate.getFullYear() === selectedYear;
    const matchMonth =
      selectedMonth === 'all' || pDate.getMonth() === parseInt(selectedMonth, 10);
    const matchProp =
      selectedProperty === 'all' || p.propertyId === selectedProperty;

    return matchYear && matchMonth && matchProp;
  });

  // Filter expenses
  const filteredExpenses = expenses.filter((e) => {
    const eDate = new Date(e.date);
    const matchYear = eDate.getFullYear() === selectedYear;
    const matchMonth =
      selectedMonth === 'all' || eDate.getMonth() === parseInt(selectedMonth, 10);
    const matchProp =
      selectedProperty === 'all' || e.propertyId === selectedProperty;

    return matchYear && matchMonth && matchProp;
  });

  const totalIncome = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0';

  // Monthly breakdown for bar visualization
  const monthlyData = monthNames.map((name, idx) => {
    const incomeThisMonth = payments
      .filter((p) => {
        const d = new Date(p.paymentDate);
        return (
          d.getFullYear() === selectedYear &&
          d.getMonth() === idx &&
          (selectedProperty === 'all' || p.propertyId === selectedProperty)
        );
      })
      .reduce((sum, p) => sum + p.amount, 0);

    const expenseThisMonth = expenses
      .filter((e) => {
        const d = new Date(e.date);
        return (
          d.getFullYear() === selectedYear &&
          d.getMonth() === idx &&
          (selectedProperty === 'all' || e.propertyId === selectedProperty)
        );
      })
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      month: name.slice(0, 3),
      monthFull: name,
      income: incomeThisMonth,
      expense: expenseThisMonth,
      profit: incomeThisMonth - expenseThisMonth,
    };
  });

  const maxBarValue = Math.max(
    ...monthlyData.map((d) => Math.max(d.income, d.expense)),
    1000000
  );

  // Category breakdown
  const categoryMap: Record<string, number> = {};
  filteredExpenses.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });

  const categoryBreakdown = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);

  const handleExportFullReport = () => {
    const headers = ['Tipe', 'Tanggal', 'Keterangan/Invoice', 'Properti', 'Kategori/Metode', 'Nominal'];
    const incomeRows = filteredPayments.map((p) => {
      const prop = properties.find((pr) => pr.id === p.propertyId);
      return [
        'Pemasukan (Sewa)',
        p.paymentDate,
        p.invoiceNumber,
        prop?.name || '-',
        p.method,
        p.amount,
      ];
    });

    const expenseRows = filteredExpenses.map((e) => {
      const prop = properties.find((pr) => pr.id === e.propertyId);
      return [
        'Pengeluaran',
        e.date,
        e.description,
        prop?.name || '-',
        e.category,
        -e.amount,
      ];
    });

    const allRows = [...incomeRows, ...expenseRows].sort(
      (a, b) => new Date(b[1] as string).getTime() - new Date(a[1] as string).getTime()
    );

    exportToCSV(`laporan_keuangan_${selectedYear}_${selectedMonth}`, headers, allRows);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Laporan Keuangan & Laba Rugi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ikhtisar pemasukan sewa, rincian biaya operasional, dan profitabilitas kos
          </p>
        </div>

        <button
          onClick={handleExportFullReport}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Laporan Lengkap (CSV)</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Filter Laporan:</span>
        </div>

        {/* Year */}
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 outline-none"
        >
          <option value={2025}>Tahun 2025</option>
          <option value={2026}>Tahun 2026</option>
          <option value={2027}>Tahun 2027</option>
        </select>

        {/* Month */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 outline-none"
        >
          <option value="all">Sepanjang Tahun ({selectedYear})</option>
          {monthNames.map((name, idx) => (
            <option key={idx} value={idx.toString()}>
              Bulan {name}
            </option>
          ))}
        </select>

        {/* Property */}
        <select
          value={selectedProperty}
          onChange={(e) => setSelectedProperty(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 outline-none"
        >
          <option value="all">Semua Properti Kos</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Income Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Pemasukan
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {formatRupiah(totalIncome)}
          </div>
          <p className="text-xs text-emerald-600 mt-2 font-medium">
            Dari {filteredPayments.length} transaksi sewa diterima
          </p>
        </div>

        {/* Expense Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Pengeluaran
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {formatRupiah(totalExpense)}
          </div>
          <p className="text-xs text-rose-600 mt-2 font-medium">
            Dari {filteredExpenses.length} catatan operasional
          </p>
        </div>

        {/* Net Profit Card */}
        <div
          className={`p-5 rounded-2xl border shadow-xs ${
            netProfit >= 0
              ? 'bg-slate-900 text-white border-slate-800'
              : 'bg-rose-900 text-white border-rose-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Laba Bersih (Net Profit)
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-md font-mono font-bold ${
                netProfit >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              Margin: {profitMargin}%
            </span>
          </div>
          <div className="text-2xl font-extrabold tracking-tight">
            {formatRupiah(netProfit)}
          </div>
          <p className="text-xs text-slate-300 mt-2">
            Pemasukan dikurangi seluruh pengeluaran operasional
          </p>
        </div>
      </div>

      {/* Monthly Chart and Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Comparison Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Grafik Pemasukan vs Pengeluaran ({selectedYear})
              </h3>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                <span className="text-slate-600">Pemasukan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-400" />
                <span className="text-slate-600">Pengeluaran</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {monthlyData.map((d, i) => {
              const incPercent = (d.income / maxBarValue) * 100;
              const expPercent = (d.expense / maxBarValue) * 100;

              return (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <span className="w-8 font-semibold text-slate-500">{d.month}</span>
                  <div className="flex-1 space-y-1">
                    {/* Income bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(incPercent, 100)}%` }}
                        title={`Pemasukan: ${formatRupiah(d.income)}`}
                      />
                    </div>
                    {/* Expense bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                      <div
                        className="bg-rose-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(expPercent, 100)}%` }}
                        title={`Pengeluaran: ${formatRupiah(d.expense)}`}
                      />
                    </div>
                  </div>
                  <div className="w-28 text-right font-mono text-[11px] text-slate-700">
                    <span className={d.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      {formatRupiah(d.profit)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <PieIcon className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900">Distribusi Biaya Operasional</h3>
            </div>

            {categoryBreakdown.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                Belum ada data pengeluaran pada periode ini.
              </p>
            ) : (
              <div className="space-y-3">
                {categoryBreakdown.map(([cat, amount]) => {
                  const percent = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">{cat}</span>
                        <span className="font-mono font-medium text-slate-900">
                          {formatRupiah(amount)} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-500 h-full rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Total Pengeluaran:</span>
            <span className="font-bold text-rose-600 font-mono">
              {formatRupiah(totalExpense)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
