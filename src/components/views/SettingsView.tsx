import React, { useState } from 'react';
import { useKos } from '../../context/KosContext';
import {
  Settings as SettingsIcon,
  Building2,
  CreditCard,
  Database,
  Save,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Phone,
  User,
  ShieldCheck,
  FileText,
  Tags,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    addExpenseCategory,
    deleteExpenseCategory,
    resetToInitialData,
    openConfirmDialog,
    showToast,
  } = useKos();

  // Local state initialized with current settings
  const [formData, setFormData] = useState({
    businessName: settings.business.businessName || 'KOS MANAGEMENT',
    kosName: settings.business.kosName || 'Kost Singgah Nyaman',
    ownerName: settings.business.ownerName || 'Bapak Hendra Pratama',
    ownerPhone: settings.business.ownerPhone || '081803716514',
    whatsappNumber: settings.business.whatsappNumber || settings.business.ownerPhone || '081803716514',
    address: settings.business.address || 'Jl. Kaliurang KM 5.2, Pogung Baru',
    city: settings.business.city || 'Yogyakarta',
    email: settings.business.email || 'pengelola@kosmanagement.id',
    logoText: settings.business.logoText || 'KM',
    description: settings.business.description || 'Hunian kos eksklusif dan nyaman dekat kampus dan perkantoran.',

    // Payment Info
    bankName: settings.payment.bankName || 'BCA (Bank Central Asia)',
    accountNumber: settings.payment.accountNumber || '8610928374',
    accountHolder: settings.payment.accountHolder || 'Hendra Pratama',
    additionalBankInfo: settings.payment.additionalBankInfo || 'Mandiri: 1370019283741 a/n Hendra Pratama | QRIS / GoPay / OVO: 081803716514',
    paymentNotes: settings.payment.notes || 'Harap sertakan nama penghuni dan nomor kamar saat konfirmasi transfer via WhatsApp.',

    // Invoice Template
    invoiceTitle: settings.invoiceTemplate?.invoiceTitle || 'INVOICE SEWA KOS',
    paymentInfoTitle: settings.invoiceTemplate?.paymentInfoTitle || 'Informasi Rekening Pembayaran',
    invoiceNotes: settings.invoiceTemplate?.notes || 'Pembayaran sewa jatuh tempo maksimal tanggal 5 setiap bulannya. Keterlambatan dapat dikenakan denda sesuai kesepakatan.',
    invoiceFooterNote: settings.invoiceTemplate?.footerNote || 'Terima kasih atas kerja sama dan kepercayaan Anda menempati hunian kami.',
  });

  const [newCatInput, setNewCatInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      business: {
        businessName: formData.businessName.trim() || 'KOS MANAGEMENT',
        kosName: formData.kosName.trim(),
        ownerName: formData.ownerName.trim() || 'Pemilik Kos',
        ownerPhone: formData.ownerPhone.trim() || '081803716514',
        whatsappNumber: formData.whatsappNumber.trim() || formData.ownerPhone.trim() || '081803716514',
        address: formData.address.trim(),
        city: formData.city.trim(),
        email: formData.email.trim(),
        logoText: formData.logoText.trim() || 'KM',
        description: formData.description.trim(),
      },
      payment: {
        bankName: formData.bankName.trim() || 'BCA',
        accountNumber: formData.accountNumber.trim(),
        accountHolder: formData.accountHolder.trim(),
        additionalBankInfo: formData.additionalBankInfo.trim(),
        notes: formData.paymentNotes.trim(),
      },
      invoiceTemplate: {
        invoiceTitle: formData.invoiceTitle.trim() || 'INVOICE SEWA KOS',
        paymentInfoTitle: formData.paymentInfoTitle.trim() || 'Informasi Rekening Pembayaran',
        notes: formData.invoiceNotes.trim(),
        footerNote: formData.invoiceFooterNote.trim(),
      },
    });

    setSavedSuccess(true);
    showToast('Pengaturan identitas dan aplikasi berhasil disimpan!', 'success');
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatInput.trim();
    if (!trimmed) return;
    addExpenseCategory(trimmed);
    setNewCatInput('');
    showToast(`Kategori "${trimmed}" berhasil ditambahkan`, 'success');
  };

  // Backup database to JSON file
  const handleExportJSON = () => {
    const backupData = localStorage.getItem('kos_management_database_v1');
    if (!backupData) {
      showToast('Tidak ada data yang dapat dibackup', 'error');
      return;
    }

    const blob = new Blob([backupData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_kos_management_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Database berhasil diexport ke file JSON', 'success');
  };

  // Restore database from JSON file
  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.properties && parsed.rooms && parsed.tenants && parsed.bills) {
          localStorage.setItem('kos_management_database_v1', content);
          showToast('Data berhasil dipulihkan! Memuat ulang...', 'success');
          setTimeout(() => {
            window.location.reload();
          }, 800);
        } else {
          showToast('Format file backup tidak valid.', 'error');
        }
      } catch (err) {
        showToast('Gagal membaca file backup JSON.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    openConfirmDialog(
      'Reset Data ke Demo Awal',
      'Tindakan ini akan mengembalikan semua data properti, kamar, penghuni, tagihan, dan pengeluaran ke data awal percontohan.',
      () => resetToInitialData()
    );
  };

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Pengaturan Aplikasi & Identitas Usaha
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Owner memiliki kendali penuh atas identitas usaha, kontak WhatsApp, rekening bank, template invoice, dan kategori biaya
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. IDENTITAS BISNIS KOS */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                1. Identitas Usaha & Kontak Pengelola
              </h3>
              <p className="text-xs text-slate-500">
                Data ini dicantumkan pada Invoice resmi dan template penagihan WhatsApp
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Kos / Brand Hunian <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.kosName}
                onChange={(e) => setFormData({ ...formData, kosName: e.target.value })}
                placeholder="Contoh: Kost Singgah Nyaman"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Usaha / Sistem
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="KOS MANAGEMENT"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Pemilik / Admin <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                placeholder="Nama Pengelola"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor WhatsApp Pengelola (Format Indonesia) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.whatsappNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    whatsappNumber: e.target.value,
                    ownerPhone: e.target.value,
                  })
                }
                placeholder="081803716514"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Nomor ini digunakan sebagai pengirim dan kontak konfirmasi transfer.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kota Domisili
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Yogyakarta, Jakarta, Bandung..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Inisial Logo (Avatar Header)
              </label>
              <input
                type="text"
                maxLength={4}
                value={formData.logoText}
                onChange={(e) => setFormData({ ...formData, logoText: e.target.value })}
                placeholder="KM"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none uppercase font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Lengkap Kantor / Kos Utama
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Jl. Kaliurang KM 5.2, Pogung Baru..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deskripsi Singkat Usaha Kos
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Deskripsi hunian atau aturan umum..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* 2. INFORMASI BANK & REKENING */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                2. Informasi Rekening Bank Penerima Sewa
              </h3>
              <p className="text-xs text-slate-500">
                Nomor rekening ini akan disertakan pada lembar Invoice dan pesan tagih WhatsApp
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Bank Utama <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="BCA, Bank Mandiri, BRI, BNI..."
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Rekening <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="8610928374"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Atas Nama Pemilik Rekening <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Nama pemilik rekening"
                value={formData.accountHolder}
                onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rekening / E-Wallet Tambahan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Mandiri: 1370019283741 a/n Hendra | QRIS/GoPay: 081803716514"
              value={formData.additionalBankInfo}
              onChange={(e) => setFormData({ ...formData, additionalBankInfo: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan / Petunjuk Pembayaran Uang Sewa
            </label>
            <input
              type="text"
              placeholder="Contoh: Harap sertakan nomor kamar saat transfer dan konfirmasi via WA."
              value={formData.paymentNotes}
              onChange={(e) => setFormData({ ...formData, paymentNotes: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* 3. TEMPLATE INVOICE */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                3. Template Invoice & Lembar Tagihan
              </h3>
              <p className="text-xs text-slate-500">
                Kustomisasi teks judul, catatan, dan ucapan penutup pada lembar invoice cetak/PDF
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Judul Dokumen Invoice
              </label>
              <input
                type="text"
                value={formData.invoiceTitle}
                onChange={(e) => setFormData({ ...formData, invoiceTitle: e.target.value })}
                placeholder="INVOICE SEWA KOS"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Judul Bagian Informasi Rekening
              </label>
              <input
                type="text"
                value={formData.paymentInfoTitle}
                onChange={(e) => setFormData({ ...formData, paymentInfoTitle: e.target.value })}
                placeholder="Informasi Rekening Pembayaran"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Syarat / Ketentuan di Lembar Invoice
            </label>
            <textarea
              rows={2}
              value={formData.invoiceNotes}
              onChange={(e) => setFormData({ ...formData, invoiceNotes: e.target.value })}
              placeholder="Contoh: Pembayaran sewa jatuh tempo maksimal tanggal 5 setiap bulannya..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Footer / Ucapan Penutup Invoice
            </label>
            <input
              type="text"
              value={formData.invoiceFooterNote}
              onChange={(e) => setFormData({ ...formData, invoiceFooterNote: e.target.value })}
              placeholder="Contoh: Terima kasih atas kerja sama dan kepercayaan Anda menempati hunian kami."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* 4. KATEGORI PENGELUARAN DINAMIS */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Tags className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                4. Kategori Pengeluaran Operasional (Dinamis)
              </h3>
              <p className="text-xs text-slate-500">
                Kelola kategori pengeluaran yang dapat dipilih pada formulir biaya operasional
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(settings.expenseCategories || []).map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800"
              >
                <span>{cat}</span>
                <button
                  type="button"
                  onClick={() => deleteExpenseCategory(cat)}
                  className="text-slate-400 hover:text-rose-600 p-0.5"
                  title="Hapus kategori"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newCatInput}
              onChange={(e) => setNewCatInput(e.target.value)}
              placeholder="Tambah kategori baru (misal: Pajak PBB, Keamanan, Sampah)..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-colors shadow-xs"
            >
              + Tambah
            </button>
          </div>
        </div>

        {/* Action Save Button */}
        <div className="flex items-center justify-between pt-2">
          <div>
            {savedSuccess && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                Semua pengaturan berhasil disimpan ke sistem!
              </span>
            )}
          </div>

          <button
            id="btn-save-settings"
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Semua Pengaturan</span>
          </button>
        </div>
      </form>

      {/* 5. BACKUP, RESTORE & RESET SECTION */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 mt-8">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Database className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              5. Penyimpanan & Cadangan Data (Backup & Restore)
            </h3>
            <p className="text-xs text-slate-500">
              Data tersimpan aman di browser Anda. Cadangkan ke file JSON atau pulihkan data kapan saja
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Backup */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-800">Backup Data (JSON)</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Download seluruh data properti, kamar, penghuni, tagihan, dan keuangan ke file komputer.
              </p>
            </div>
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Backup JSON</span>
            </button>
          </div>

          {/* Restore */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-800">Restore Data</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Unggah file backup JSON yang pernah Anda simpan sebelumnya ke dalam sistem.
              </p>
            </div>
            <label className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer transition-colors shadow-2xs">
              <Upload className="w-3.5 h-3.5" />
              <span>Pilih File Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
          </div>

          {/* Reset Demo */}
          <div className="p-4 rounded-2xl border border-rose-100 bg-rose-50/50 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-rose-800">Reset ke Data Sample</h4>
              <p className="text-[11px] text-rose-600 mt-0.5">
                Kembalikan semua entri ke data contoh percontohan sistem.
              </p>
            </div>
            <button
              onClick={handleResetData}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-xs font-bold text-rose-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data Demo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
