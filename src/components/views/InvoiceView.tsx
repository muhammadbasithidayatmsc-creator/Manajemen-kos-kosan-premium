import React from 'react';
import { useKos } from '../../context/KosContext';
import { Bill } from '../../types';
import {
  Printer,
  MessageCircle,
  X,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
} from 'lucide-react';
import {
  formatRupiah,
  formatDateIndo,
  generateWhatsappBillingUrl,
  cleanWhatsappNumber,
} from '../../utils/formatters';

interface InvoiceViewProps {
  bill: Bill;
  onClose: () => void;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({ bill, onClose }) => {
  const { tenants, properties, rooms, settings } = useKos();

  const tenant = tenants.find((t) => t.id === bill.tenantId);
  const property = properties.find((p) => p.id === bill.propertyId);
  const room = rooms.find((r) => r.id === bill.roomId);

  const handlePrint = () => {
    window.print();
  };

  const waBillingUrl = tenant
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        {/* Modal Action Bar (Hidden during print) */}
        <div className="no-print p-4 bg-slate-900 text-white flex items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-indigo-300 font-bold">
              {bill.invoiceNumber}
            </span>
            <span className="text-xs text-slate-400">• Pratinjau Invoice</span>
          </div>

          <div className="flex items-center gap-2">
            {tenant && (
              <a
                href={waBillingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kirim ke WA</span>
              </a>
            )}

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div
          id="printable-invoice"
          className="printable-container p-6 sm:p-8 bg-white text-slate-900 font-sans"
        >
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-slate-900">
            <div>
              <div className="flex items-center gap-3">
                {settings.business.logoUrl ? (
                  <img
                    src={settings.business.logoUrl}
                    alt={settings.business.kosName || 'Logo Kos'}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shrink-0">
                    {settings.business.logoText || 'KM'}
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    {settings.business.kosName || settings.business.businessName || 'KOS MANAGEMENT'}
                  </h1>
                  {settings.business.kosName && settings.business.businessName && (
                    <span className="text-[11px] text-slate-500 font-medium block">
                      {settings.business.businessName}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                {property?.address || settings.business.address}
                {settings.business.city ? `, ${settings.business.city}` : ''}
              </p>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                Kontak Pengelola: {settings.business.whatsappNumber || settings.business.ownerPhone} ({settings.business.ownerName})
              </p>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-xl sm:text-2xl font-black text-indigo-700 tracking-tight">
                {settings.invoiceTemplate?.invoiceTitle || 'INVOICE'}
              </div>
              <p className="font-mono text-xs font-bold text-slate-900 mt-0.5">
                {bill.invoiceNumber}
              </p>
              <div className="mt-2">
                {bill.status === 'Lunas' ? (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                    ✓ LUNAS
                  </span>
                ) : bill.status === 'Terlambat' ? (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
                    ! TERLAMBAT
                  </span>
                ) : (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                    BELUM DIBAYAR
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Meta Information Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-6 py-6 border-b border-slate-100 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Ditujukan Kepada Penghuni:
              </span>
              <p className="text-sm font-bold text-slate-900">{tenant?.fullName || '-'}</p>
              <p className="text-slate-600 font-medium">
                Kamar {room?.roomNumber} ({room?.type})
              </p>
              <p className="text-slate-500">{property?.name}</p>
              <p className="text-slate-600 font-mono mt-0.5">
                WhatsApp: {tenant?.whatsappNumber}
              </p>
            </div>

            <div className="space-y-1 sm:text-right">
              <div>
                <span className="text-slate-500">Periode Tagihan:</span>{' '}
                <strong className="text-slate-900 font-bold">{bill.period}</strong>
              </div>
              <div>
                <span className="text-slate-500">Tanggal Terbit:</span>{' '}
                <span className="text-slate-700 font-medium">
                  {formatDateIndo(bill.billDate)}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Jatuh Tempo:</span>{' '}
                <span className="text-rose-700 font-bold">
                  {formatDateIndo(bill.dueDate)}
                </span>
              </div>
              {bill.paidAt && (
                <div>
                  <span className="text-slate-500">Tanggal Pembayaran:</span>{' '}
                  <span className="text-emerald-700 font-bold">
                    {formatDateIndo(bill.paidAt)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Table of Charges */}
          <div className="py-6">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-700 font-bold">
                  <th className="py-2.5 px-2">No.</th>
                  <th className="py-2.5 px-2">Deskripsi Layanan</th>
                  <th className="py-2.5 px-2 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                <tr>
                  <td className="py-3 px-2 font-mono text-slate-400">01</td>
                  <td className="py-3 px-2">
                    <p className="font-bold text-slate-900">
                      Sewa Kamar {room?.roomNumber} - Periode {bill.period}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {property?.name} • Fasilitas: {(room?.facilities || []).slice(0, 3).join(', ')}
                    </p>
                  </td>
                  <td className="py-3 px-2 text-right font-mono font-bold">
                    {formatRupiah(bill.rentAmount)}
                  </td>
                </tr>

                {bill.additionalFees > 0 && (
                  <tr>
                    <td className="py-3 px-2 font-mono text-slate-400">02</td>
                    <td className="py-3 px-2">
                      <p className="font-bold text-slate-900">Biaya Tambahan</p>
                      <p className="text-[11px] text-slate-500">
                        {bill.additionalFeesNotes || 'Biaya operasional tambahan'}
                      </p>
                    </td>
                    <td className="py-3 px-2 text-right font-mono font-bold text-slate-700">
                      {formatRupiah(bill.additionalFees)}
                    </td>
                  </tr>
                )}

                {bill.discount > 0 && (
                  <tr>
                    <td className="py-3 px-2 font-mono text-slate-400">03</td>
                    <td className="py-3 px-2">
                      <p className="font-bold text-rose-700">Potongan Diskon</p>
                      <p className="text-[11px] text-slate-500">Potongan harga sewa khusus</p>
                    </td>
                    <td className="py-3 px-2 text-right font-mono font-bold text-rose-600">
                      - {formatRupiah(bill.discount)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Total Row */}
            <div className="mt-4 pt-4 border-t-2 border-slate-900 flex justify-end">
              <div className="w-64 space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Subtotal Sewa:</span>
                  <span className="font-mono">{formatRupiah(bill.rentAmount)}</span>
                </div>
                {bill.additionalFees > 0 && (
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Biaya Tambahan:</span>
                    <span className="font-mono">+{formatRupiah(bill.additionalFees)}</span>
                  </div>
                )}
                {bill.discount > 0 && (
                  <div className="flex items-center justify-between text-rose-600">
                    <span>Diskon:</span>
                    <span className="font-mono">-{formatRupiah(bill.discount)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-black text-sm text-slate-900">
                  <span>TOTAL PEMBAYARAN:</span>
                  <span className="font-mono text-base text-indigo-700">
                    {formatRupiah(bill.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Account Details */}
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
              {settings.invoiceTemplate?.paymentInfoTitle || 'Informasi Rekening Pembayaran'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
              <div>
                <p className="text-slate-500">Bank:</p>
                <p className="font-bold text-slate-900">{settings.payment.bankName}</p>
              </div>
              <div>
                <p className="text-slate-500">Nomor Rekening:</p>
                <p className="font-mono font-bold text-slate-900 text-sm">
                  {settings.payment.accountNumber}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Atas Nama:</p>
                <p className="font-bold text-slate-900">{settings.payment.accountHolder}</p>
              </div>
              <div>
                <p className="text-slate-500">Konfirmasi Pembayaran:</p>
                <p className="font-mono text-slate-900">
                  WA: {settings.business.whatsappNumber || settings.business.ownerPhone}
                </p>
              </div>
            </div>

            {settings.payment.additionalBankInfo && (
              <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                <span className="font-semibold text-slate-700">Rekening Tambahan: </span>
                {settings.payment.additionalBankInfo}
              </div>
            )}

            {(settings.invoiceTemplate?.notes || settings.payment.notes) && (
              <p className="mt-2.5 pt-2 border-t border-slate-200 text-[11px] text-slate-500 italic">
                Catatan: {settings.invoiceTemplate?.notes || settings.payment.notes}
              </p>
            )}
          </div>

          {/* Signature & Closing */}
          <div className="mt-8 pt-4 flex items-end justify-between text-xs">
            <div>
              <p className="text-[11px] text-slate-400">
                Dokumen resmi diterbitkan otomatis oleh sistem {settings.business.businessName}.
              </p>
              <p className="text-[11px] text-slate-400">
                {settings.invoiceTemplate?.footerNote ||
                  'Terima kasih atas kepercayaan Anda menempati hunian kami.'}
              </p>
            </div>

            <div className="text-center w-40">
              <p className="text-slate-500 mb-12">Hormat Kami,</p>
              <p className="font-bold text-slate-900 border-t border-slate-400 pt-1">
                {settings.business.ownerName}
              </p>
              <p className="text-[10px] text-slate-400">Pengelola Kos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
