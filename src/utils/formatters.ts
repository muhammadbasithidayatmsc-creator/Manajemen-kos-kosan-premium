/**
 * Utilities for currency, date formatting, WhatsApp link generation, and CSV export
 */

export function formatRupiah(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'Rp 0';
  }
  return 'Rp ' + Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function cleanWhatsappNumber(phone: string | undefined | null): string {
  if (!phone) return '';
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '');
  
  // If begins with '0', replace with '62'
  if (digits.startsWith('0')) {
    digits = '62' + digits.slice(1);
  } else if (!digits.startsWith('62') && digits.length > 5) {
    digits = '62' + digits;
  }
  
  return digits;
}

export function formatDateIndo(dateStr: string | undefined | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

export function formatMonthYear(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

export interface WhatsappBillingParams {
  tenantPhone: string;
  tenantName: string;
  propertyName: string;
  roomNumber: string;
  period: string;
  dueDate: string;
  totalAmount: number;
  ownerName: string;
  ownerPhone?: string;
  businessName?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
}

export function generateWhatsappBillingUrl(params: WhatsappBillingParams): string {
  const cleanPhone = cleanWhatsappNumber(params.tenantPhone);
  
  const formattedDueDate = formatDateIndo(params.dueDate);
  const formattedTotal = formatRupiah(params.totalAmount);
  const ownerContact = params.ownerPhone || '081803716514';

  const message = `Halo ${params.tenantName},

Kami informasikan tagihan kos:

Properti: ${params.propertyName}
Kamar: ${params.roomNumber}
Periode: ${params.period}
Jatuh Tempo: ${formattedDueDate}

Total Tagihan:
${formattedTotal}

Silakan melakukan pembayaran sesuai informasi pembayaran pada invoice.

Terima kasih.

${params.ownerName}
${ownerContact}`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]): void {
  // Use UTF-8 BOM so Excel opens it with proper accents and formatting
  const bom = '\uFEFF';
  const csvContent = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    ...rows.map(row =>
      row.map(val => {
        const str = String(val ?? '');
        return `"${str.replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\r\n');

  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
