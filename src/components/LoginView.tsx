import React, { useState } from 'react';
import { useKos } from '../context/KosContext';
import { UserRole } from '../types';
import {
  ShieldCheck,
  UserCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Building2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { settings, loginWithPortal } = useKos();

  // Selected portal: null means selection screen, or 'OWNER' / 'ADMIN'
  const [selectedPortal, setSelectedPortal] = useState<UserRole | null>('OWNER');
  const [usernameOrEmail, setUsernameOrEmail] = useState('owner');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const kosName = settings.business.kosName || 'Kost Singgah Nyaman';
  const logoUrl = settings.business.logoUrl;

  const handleSelectPortal = (role: UserRole) => {
    setSelectedPortal(role);
    setErrorMessage(null);
    if (role === 'OWNER') {
      setUsernameOrEmail('owner');
      setPassword('123456');
    } else {
      setUsernameOrEmail('admin');
      setPassword('123456');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPortal) return;

    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = loginWithPortal(usernameOrEmail, password, selectedPortal);
      setIsLoading(false);
      if (!result.success) {
        setErrorMessage(result.message);
      }
    }, 400);
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    setSelectedPortal(role);
    const u = role === 'OWNER' ? 'owner' : 'admin';
    const p = '123456';
    setUsernameOrEmail(u);
    setPassword(p);
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = loginWithPortal(u, p, role);
      setIsLoading(false);
      if (!result.success) {
        setErrorMessage(result.message);
      }
    }, 350);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-indigo-600/15 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-4xl relative z-10 flex flex-col items-center">
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 text-xs font-semibold shadow-inner mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>KOS MANAGEMENT PRO v2.0</span>
          </div>

          <div className="flex items-center gap-3.5 mb-2">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={kosName}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/30 shadow-lg"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg ring-2 ring-indigo-400/20">
                <Building2 className="w-6 h-6" />
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {kosName}
            </h1>
          </div>
          <p className="text-sm text-slate-400 max-w-md">
            Sistem Operasional Kos Modern, Terintegrasi & Otomatisasi Keuangan
          </p>
        </div>

        {/* Card Container */}
        <div className="w-full bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8">
          {/* Portal Selector Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Pilih Portal Masuk
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Masuk sesuai hak akses dan wewenang akun Anda
                </p>
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  id="tab-owner-portal"
                  onClick={() => handleSelectPortal('OWNER')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedPortal === 'OWNER'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>OWNER</span>
                </button>
                <button
                  type="button"
                  id="tab-admin-portal"
                  onClick={() => handleSelectPortal('ADMIN')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedPortal === 'ADMIN'
                      ? 'bg-sky-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>ADMIN</span>
                </button>
              </div>
            </div>

            {/* Portal Cards Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* OWNER PORTAL CARD */}
              <div
                id="portal-card-owner"
                onClick={() => handleSelectPortal('OWNER')}
                className={`cursor-pointer rounded-2xl p-4 sm:p-5 border transition-all duration-200 relative overflow-hidden ${
                  selectedPortal === 'OWNER'
                    ? 'bg-amber-500/10 border-amber-500/60 ring-2 ring-amber-500/20 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    FULL ACCESS
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  OWNER PORTAL
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  Akses menyeluruh: Laporan Laba Rugi, kontrol tarif, audit trail, kelola akun admin & properti.
                </p>
                <div className="flex items-center justify-between text-[11px] text-amber-400/90 font-semibold pt-2 border-t border-amber-500/15">
                  <span>Demo: <code className="bg-amber-500/20 px-1 py-0.5 rounded">owner</code> / <code className="bg-amber-500/20 px-1 py-0.5 rounded">123456</code></span>
                  {selectedPortal === 'OWNER' && (
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Terpilih
                    </span>
                  )}
                </div>
              </div>

              {/* ADMIN PORTAL CARD */}
              <div
                id="portal-card-admin"
                onClick={() => handleSelectPortal('ADMIN')}
                className={`cursor-pointer rounded-2xl p-4 sm:p-5 border transition-all duration-200 relative overflow-hidden ${
                  selectedPortal === 'ADMIN'
                    ? 'bg-sky-500/10 border-sky-500/60 ring-2 ring-sky-500/20 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    OPERASIONAL
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  ADMIN PORTAL
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  Akses harian: Pendaftaran penghuni, check-in, cetak invoice sewa, input pengeluaran rutin.
                </p>
                <div className="flex items-center justify-between text-[11px] text-sky-400/90 font-semibold pt-2 border-t border-sky-500/15">
                  <span>Demo: <code className="bg-sky-500/20 px-1 py-0.5 rounded">admin</code> / <code className="bg-sky-500/20 px-1 py-0.5 rounded">123456</code></span>
                  {selectedPortal === 'ADMIN' && (
                    <span className="flex items-center gap-1 text-sky-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Terpilih
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div
                id="login-error-alert"
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-relaxed animate-in fade-in duration-150"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold">Gagal Masuk: </span>
                  {errorMessage}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Username Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nama / Username / Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="input-login-username"
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder={selectedPortal === 'OWNER' ? 'owner' : 'admin'}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-600 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="input-login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-slate-600 transition-all"
                  />
                  <button
                    type="button"
                    id="btn-toggle-login-password"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Remember Me & Quick Hint */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Ingat Sesi Login Saya</span>
              </label>

              <div className="flex items-center gap-1 text-slate-400">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Default: <strong className="text-slate-200">123456</strong></span>
              </div>
            </div>

            {/* Submit Button & Fast Action */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                id="btn-submit-login"
                disabled={isLoading}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm text-white transition-all duration-200 shadow-lg ${
                  selectedPortal === 'OWNER'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-extrabold shadow-amber-500/20'
                    : 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-indigo-500/20'
                } ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.01] active:scale-[0.99]'}`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Memverifikasi Akun...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke {selectedPortal === 'OWNER' ? 'Owner Portal' : 'Admin Portal'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                id="btn-quick-demo-login"
                onClick={() => handleQuickDemoLogin(selectedPortal || 'OWNER')}
                className="py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-2 shrink-0"
                title="Langsung login dengan kredensial default 1-klik"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>1-Klik Demo Login</span>
              </button>
            </div>
          </form>

          {/* Security Footer Notice */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-start gap-2.5 text-slate-400 text-[11px] leading-relaxed">
            <HelpCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p>
              Kredensial <code className="text-slate-300">owner</code> / <code className="text-slate-300">123456</code> dan <code className="text-slate-300">admin</code> / <code className="text-slate-300">123456</code> adalah setup awal demo. Anda dapat mengubah password dan mengatur staf di menu <strong>Profil → Ganti Password</strong> atau <strong>Settings → User Management</strong> setelah masuk.
            </p>
          </div>
        </div>

        {/* Brand Copyright */}
        <p className="text-xs text-slate-400 mt-6 text-center">
          &copy; {new Date().getFullYear()} {kosName}. Hak cipta dilindungi undang-undang.
        </p>
      </div>
    </div>
  );
};
