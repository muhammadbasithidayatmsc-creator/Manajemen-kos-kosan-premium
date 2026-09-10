import React, { useState } from 'react';
import { useKos } from '../../context/KosContext';
import { UserAccount, UserRole } from '../../types';
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
  Users,
  Shield,
  KeyRound,
  Edit2,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  UserX,
  UserCheck,
  AlertCircle,
  X,
  Mail,
  Camera,
  Image as ImageIcon,
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
    currentUser,
    isOwner,
    adminAccounts,
    addAdminAccount,
    updateAdminAccount,
    deleteAdminAccount,
    toggleAdminStatus,
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
    logoUrl: settings.business.logoUrl || '',
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

  // Admin Management Modal states
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<UserAccount | null>(null);
  const [resettingPasswordAdmin, setResettingPasswordAdmin] = useState<UserAccount | null>(null);

  // New Admin Form
  const [newAdminData, setNewAdminData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'ADMIN' as UserRole,
  });
  const [showNewAdminPassword, setShowNewAdminPassword] = useState(false);

  // Edit Admin Form
  const [editAdminData, setEditAdminData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'Aktif' as 'Aktif' | 'Nonaktif',
  });

  // Reset Password Form
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

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
        logoUrl: formData.logoUrl,
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
    showToast('success', 'Pengaturan identitas dan aplikasi berhasil disimpan!');
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  // Upload photo handler with lightweight canvas compression (< 80KB)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Harap pilih file gambar (format JPG, PNG, atau WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 400;
        let { width, height } = img;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.88);
          setFormData((prev) => ({ ...prev, logoUrl: compressed }));
          showToast('success', 'Foto profil berhasil dimuat! Klik "Simpan Semua Pengaturan" untuk memperbarui.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, logoUrl: '' }));
    showToast('info', 'Foto profil dihapus. Sistem akan menggunakan inisial.');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatInput.trim();
    if (!trimmed) return;
    addExpenseCategory(trimmed);
    setNewCatInput('');
    showToast('success', `Kategori "${trimmed}" berhasil ditambahkan`);
  };

  // Backup database to JSON file
  const handleExportJSON = () => {
    const backupData = localStorage.getItem('kos_management_database_v1');
    if (!backupData) {
      showToast('error', 'Tidak ada data yang dapat dibackup');
      return;
    }

    const blob = new Blob([backupData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_kos_management_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Database berhasil diexport ke file JSON');
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
          showToast('success', 'Data berhasil dipulihkan! Memuat ulang...');
          setTimeout(() => {
            window.location.reload();
          }, 800);
        } else {
          showToast('error', 'Format file backup tidak valid.');
        }
      } catch (err) {
        showToast('error', 'Gagal membaca file backup JSON.');
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

  // Admin Account Handlers
  const handleOpenAddAdmin = () => {
    setNewAdminData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'ADMIN',
    });
    setShowNewAdminPassword(false);
    setIsAddAdminOpen(true);
  };

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminData.name.trim() || !newAdminData.email.trim()) {
      showToast('error', 'Nama lengkap dan email akun admin wajib diisi.');
      return;
    }
    if (!newAdminData.password.trim() || newAdminData.password.length < 4) {
      showToast('error', 'Password minimal 4 karakter.');
      return;
    }
    const exists = adminAccounts.some(
      (a) => a.email.toLowerCase() === newAdminData.email.trim().toLowerCase()
    );
    if (exists) {
      showToast('error', 'Email ini sudah terdaftar untuk akun pengelola lain.');
      return;
    }

    addAdminAccount({
      name: newAdminData.name.trim(),
      email: newAdminData.email.trim().toLowerCase(),
      password: newAdminData.password.trim(),
      phone: newAdminData.phone.trim() || undefined,
      role: newAdminData.role,
      status: 'Aktif',
    });
    setIsAddAdminOpen(false);
  };

  const handleOpenEditAdmin = (acc: UserAccount) => {
    setEditingAdmin(acc);
    setEditAdminData({
      name: acc.name,
      email: acc.email,
      phone: acc.phone || '',
      status: acc.status,
    });
  };

  const handleSaveEditAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    if (!editAdminData.name.trim() || !editAdminData.email.trim()) {
      showToast('error', 'Nama dan email wajib diisi.');
      return;
    }
    updateAdminAccount(editingAdmin.id, {
      name: editAdminData.name.trim(),
      email: editAdminData.email.trim().toLowerCase(),
      phone: editAdminData.phone.trim() || undefined,
      status: editAdminData.status,
    });
    setEditingAdmin(null);
  };

  const handleOpenResetPassword = (acc: UserAccount) => {
    setResettingPasswordAdmin(acc);
    setNewPassword('');
    setConfirmPassword('');
    setShowResetPassword(false);
  };

  const handleSaveResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingPasswordAdmin) return;
    if (!newPassword.trim() || newPassword.length < 4) {
      showToast('error', 'Password baru minimal 4 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('error', 'Konfirmasi password tidak cocok.');
      return;
    }
    updateAdminAccount(resettingPasswordAdmin.id, {
      password: newPassword.trim(),
    });
    showToast('success', `Password untuk akun "${resettingPasswordAdmin.name}" berhasil diperbarui.`);
    setResettingPasswordAdmin(null);
  };

  const handleDeleteAdmin = (acc: UserAccount) => {
    if (acc.role === 'OWNER') {
      showToast('error', 'Akun Owner utama tidak dapat dihapus.');
      return;
    }
    if (currentUser?.id === acc.id) {
      showToast('error', 'Tidak dapat menghapus akun yang sedang Anda gunakan.');
      return;
    }
    openConfirmDialog(
      'Hapus Akun Staf Admin',
      `Apakah Anda yakin ingin menghapus akun staf "${acc.name}" (${acc.email})? Staf ini tidak akan dapat login lagi ke sistem.`,
      () => {
        deleteAdminAccount(acc.id);
      }
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

            {/* Foto Profil / Logo Bisnis Uploader (Eksklusif & Elegan) */}
            <div className="sm:col-span-2 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 border border-indigo-100/90 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Photo Preview with Elegant Ring & Hover Overlay */}
                  <div className="relative group shrink-0">
                    {formData.logoUrl ? (
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-indigo-500/40 shadow-md bg-white">
                        <img
                          src={formData.logoUrl}
                          alt="Foto Profil / Logo"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <Camera className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-indigo-200 bg-white flex flex-col items-center justify-center text-slate-400 group-hover:border-indigo-400 group-hover:text-indigo-600 transition-all shadow-2xs">
                        <Camera className="w-7 h-7 mb-1 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500">Pilih Foto</span>
                      </div>
                    )}

                    {formData.logoUrl && (
                      <span
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs ring-2 ring-white shadow-xs"
                        title="Foto Profil Aktif"
                      >
                        ✓
                      </span>
                    )}
                  </div>

                  {/* Informational Copy */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-indigo-600" />
                        Foto Profil / Logo Kos
                      </h4>
                      {formData.logoUrl ? (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Foto Profil Terpasang
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-600">
                          Belum Ada Foto (Gunakan Inisial)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-lg">
                      Gantikan inisial logo standar dengan upload foto profil pengelola atau logo resmi usaha kos agar aplikasi tampil lebih mewah, elegan, dan profesional.
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Tampil otomatis di Sidebar Navigasi, Profil Akun Navbar, dan Lembar Cetak Invoice.
                    </p>
                  </div>
                </div>

                {/* Upload & Delete Actions */}
                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-xs cursor-pointer transition-all">
                    <Upload className="w-4 h-4" />
                    <span>{formData.logoUrl ? 'Ganti Foto Profil' : 'Upload Foto Profil'}</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>

                  {formData.logoUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 active:scale-95 text-xs font-semibold transition-all"
                      title="Hapus foto profil dan kembali ke default"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Hapus</span>
                    </button>
                  )}
                </div>
              </div>
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

      {/* 5. MANAJEMEN AKUN ADMIN & HAK AKSES (RBAC) */}
      <div id="admin-management-section" className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5 mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                5. Manajemen Akun Staf Admin & Hak Akses (RBAC)
              </h3>
              <p className="text-xs text-slate-500">
                Kelola hak akses pengelola kos. Pisahkan wewenang finansial Owner dan operasional Admin.
              </p>
            </div>
          </div>

          {isOwner && (
            <button
              id="btn-add-admin-account"
              type="button"
              onClick={handleOpenAddAdmin}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs shadow-xs transition-colors self-start sm:self-auto"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Akun Admin</span>
            </button>
          )}
        </div>

        {/* Role Privileges Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
          <div className="flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0 text-xs">
              👑
            </span>
            <div>
              <strong className="text-slate-900 block">Akun OWNER (Pemilik Kos)</strong>
              <p className="text-slate-500 mt-0.5 leading-relaxed">
                Kontrol absolut: Laporan keuangan laba rugi, ubah tarif kamar, kelola staf admin, ekspor pembukuan, dan reset database.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0 text-xs">
              🛡️
            </span>
            <div>
              <strong className="text-slate-900 block">Akun ADMIN (Staf Operasional)</strong>
              <p className="text-slate-500 mt-0.5 leading-relaxed">
                Fokus operasional: Input penyewa, kelola status kamar, buat tagihan, kirim WhatsApp pengingat, dan cetak invoice. Data laba bersih terproteksi.
              </p>
            </div>
          </div>
        </div>

        {/* Admin Accounts List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
            <span>Daftar Pengelola Terdaftar ({adminAccounts.length})</span>
            {!isOwner && (
              <span className="text-amber-600 font-normal">
                Mode Akses Terbatas (Admin)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3">
            {adminAccounts.map((acc) => {
              const isCurrentUser = currentUser?.id === acc.id;
              const isOwnerRole = acc.role === 'OWNER';

              return (
                <div
                  key={acc.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isCurrentUser
                      ? 'border-indigo-300 bg-indigo-50/30'
                      : 'border-slate-200/80 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden ${
                        isOwnerRole
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isOwnerRole && (formData.logoUrl || settings.business.logoUrl) ? (
                        <img
                          src={formData.logoUrl || settings.business.logoUrl}
                          alt={acc.name}
                          className="w-full h-full object-cover"
                        />
                      ) : acc.avatarUrl ? (
                        <img src={acc.avatarUrl} alt={acc.name} className="w-full h-full object-cover" />
                      ) : isOwnerRole ? (
                        '👑'
                      ) : (
                        acc.name.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900">{acc.name}</h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            isOwnerRole
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {acc.role}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            acc.status === 'Aktif'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {acc.status}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white">
                            Akun Anda
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1 font-mono">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {acc.email}
                        </span>
                        {acc.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {acc.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions (Only available to Owner) */}
                  <div className="flex items-center gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 justify-end">
                    {isOwner ? (
                      <>
                        {/* Reset Password */}
                        <button
                          type="button"
                          onClick={() => handleOpenResetPassword(acc)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                          title="Ganti / Reset Password Akun"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                          <span className="hidden md:inline">Reset Password</span>
                        </button>

                        {/* Edit Data */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditAdmin(acc)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                          title="Edit Informasi Akun"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                          <span className="hidden md:inline">Edit</span>
                        </button>

                        {/* Toggle Status (Non-owner accounts only) */}
                        {!isOwnerRole && (
                          <button
                            type="button"
                            onClick={() => toggleAdminStatus(acc.id)}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                              acc.status === 'Aktif'
                                ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                            }`}
                            title={acc.status === 'Aktif' ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                          >
                            {acc.status === 'Aktif' ? (
                              <>
                                <UserX className="w-3.5 h-3.5" />
                                <span className="hidden md:inline">Nonaktifkan</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                <span className="hidden md:inline">Aktifkan</span>
                              </>
                            )}
                          </button>
                        )}

                        {/* Delete Account (Non-owner, non-self) */}
                        {!isOwnerRole && !isCurrentUser && (
                          <button
                            type="button"
                            onClick={() => handleDeleteAdmin(acc)}
                            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                            title="Hapus Akun Admin"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        Hak kelola khusus Owner
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6. BACKUP, RESTORE & RESET SECTION */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 mt-8">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Database className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              6. Penyimpanan & Cadangan Data (Backup & Restore)
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

      {/* MODAL: TAMBAH AKUN ADMIN */}
      {isAddAdminOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Tambah Akun Staf Admin</h3>
                  <p className="text-xs text-slate-500">Buat akses operasional baru untuk staf kos</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddAdminOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Lengkap Staf Admin <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Siti Rahma / Budi Santoso"
                  value={newAdminData.name}
                  onChange={(e) => setNewAdminData({ ...newAdminData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Login <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin.kos@gmail.com"
                  value={newAdminData.email}
                  onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nomor WhatsApp / HP Staf
                </label>
                <input
                  type="text"
                  placeholder="081234567890"
                  value={newAdminData.phone}
                  onChange={(e) => setNewAdminData({ ...newAdminData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password Awal <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewAdminPassword ? 'text' : 'password'}
                    required
                    minLength={4}
                    placeholder="Minimal 4 karakter"
                    value={newAdminData.password}
                    onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewAdminPassword(!showNewAdminPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewAdminPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Staf dapat menggunakan email dan password ini untuk masuk ke aplikasi.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-800">
                <span className="font-bold block">Hak Akses: ADMIN</span>
                Staf Admin dapat mencatat sewa, membuat tagihan, dan mengirim pesan WhatsApp. Namun tidak dapat melihat laporan laba bersih usaha.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddAdminOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition-colors shadow-xs"
                >
                  Simpan Akun Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT DATA ADMIN */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit Akun Pengelola</h3>
                  <p className="text-xs text-slate-500">Perbarui profil atau status akun {editingAdmin.role}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingAdmin(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditAdmin} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Pengelola <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editAdminData.name}
                  onChange={(e) => setEditAdminData({ ...editAdminData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Login <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={editAdminData.email}
                  onChange={(e) => setEditAdminData({ ...editAdminData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nomor Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  value={editAdminData.phone}
                  onChange={(e) => setEditAdminData({ ...editAdminData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {editingAdmin.role !== 'OWNER' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Status Akun
                  </label>
                  <select
                    value={editAdminData.status}
                    onChange={(e) =>
                      setEditAdminData({
                        ...editAdminData,
                        status: e.target.value as 'Aktif' | 'Nonaktif',
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="Aktif">Aktif (Dapat Login & Mengelola)</option>
                    <option value="Nonaktif">Nonaktif (Akses Masuk Dinonaktifkan)</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingAdmin(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition-colors shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESET PASSWORD ADMIN */}
      {resettingPasswordAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Reset Password Akun</h3>
                  <p className="text-xs text-slate-500">
                    Untuk: {resettingPasswordAdmin.name} ({resettingPasswordAdmin.email})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResettingPasswordAdmin(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveResetPassword} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    required
                    minLength={4}
                    placeholder="Masukkan password baru (min 4 karakter)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showResetPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Konfirmasi Password Baru <span className="text-rose-500">*</span>
                </label>
                <input
                  type={showResetPassword ? 'text' : 'password'}
                  required
                  minLength={4}
                  placeholder="Ketik ulang password baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                />
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <span className="text-[11px] text-rose-500 mt-1 block">
                    Password konfirmasi belum sesuai.
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResettingPasswordAdmin(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={Boolean(newPassword && confirmPassword && newPassword !== confirmPassword)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-xs font-bold text-white transition-colors shadow-xs"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
