import React, { useState, useRef } from 'react';
import { useKos } from '../context/KosContext';
import {
  X,
  User,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  UserCheck,
  Camera,
  Upload,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Trash2,
} from 'lucide-react';

export const ProfileModal: React.FC = () => {
  const {
    currentUser,
    updateProfile,
    changePassword,
    isProfileModalOpen,
    setIsProfileModalOpen,
    profileModalTab,
    setProfileModalTab,
    showToast,
  } = useKos();

  // Profile Form state
  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username || '');
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isProfileModalOpen) return null;

  const isOwner = currentUser.role === 'OWNER';

  // Handle Photo File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Harap pilih file gambar (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('error', 'Ukuran foto maksimal 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAvatarUrl(dataUrl);
      showToast('info', 'Foto profil dipilih. Klik "Simpan Profil" untuk menerapkan.');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('error', 'Nama lengkap wajib diisi.');
      return;
    }
    if (!username.trim()) {
      showToast('error', 'Username wajib diisi untuk kemudahan login.');
      return;
    }

    updateProfile({
      name: name.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim(),
      phone: phone.trim(),
      avatarUrl: avatarUrl.trim() || undefined,
    });

    setIsProfileModalOpen(false);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError('Harap masukkan password saat ini.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password baru minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password tidak cocok dengan password baru.');
      return;
    }

    const result = changePassword(currentPassword, newPassword);
    if (result.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsProfileModalOpen(false);
    } else {
      setPasswordError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="modal-profile-security"
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-xs ${
                isOwner ? 'bg-amber-600' : 'bg-sky-600'
              }`}
            >
              {isOwner ? <ShieldCheck className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                Profil & Keamanan Akun
              </h3>
              <p className="text-xs text-slate-500">
                Kelola identitas, foto, dan kredensial login Anda
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-profile-modal"
            onClick={() => setIsProfileModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 px-6 bg-white gap-4">
          <button
            type="button"
            id="tab-profile-info"
            onClick={() => setProfileModalTab('profile')}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              profileModalTab === 'profile'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profil Akun</span>
          </button>
          <button
            type="button"
            id="tab-profile-password"
            onClick={() => setProfileModalTab('password')}
            className={`py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              profileModalTab === 'password'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Ganti Password</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {profileModalTab === 'profile' ? (
            /* Profil Tab */
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Photo Upload Section */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="relative group shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="w-20 h-20 rounded-2xl object-cover ring-2 ring-indigo-500 shadow-md"
                    />
                  ) : (
                    <div
                      className={`w-20 h-20 rounded-2xl flex items-center justify-center font-bold text-2xl text-white shadow-md ${
                        isOwner ? 'bg-amber-600' : 'bg-sky-600'
                      }`}
                    >
                      {name.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all hover:scale-105"
                    title="Upload Foto Baru"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <h4 className="text-sm font-bold text-slate-900">{name}</h4>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isOwner ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {currentUser.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Format gambar JPG, PNG, atau WEBP (Maksimal 2 MB)
                  </p>

                  <div className="mt-2.5 flex items-center gap-2 justify-center sm:justify-start">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      id="btn-upload-profile-photo"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>Upload Foto</span>
                    </button>

                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl('')}
                        className="px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors flex items-center gap-1"
                        title="Hapus foto profil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Contoh: Bapak Ahmad Fauzi"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Username & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username Login
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder="owner / admin"
                      className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hak Akses (Role)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.role === 'OWNER' ? 'Owner (Pemilik Utama)' : 'Admin Operasional'}
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@kos.id"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08123456789"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="btn-save-profile"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Simpan Profil
                </button>
              </div>
            </form>
          ) : (
            /* Ganti Password Tab */
            <form onSubmit={handleSavePassword} className="space-y-4">
              {passwordError && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-800">
                <KeyRound className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Password default awal adalah <strong>123456</strong>. Buat password yang mudah Anda ingat namun aman.
                </p>
              </div>

              {/* Current Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password Saat Ini
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Masukkan password saat ini (default: 123456)"
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password Baru
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ulangi Password Baru
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Ketik ulang password baru Anda"
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Strength Hint */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Password baru akan langsung aktif untuk login berikutnya.</span>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="btn-save-password"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Perbarui Password
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
