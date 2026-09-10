import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDateIndo } from './formatters';

export interface ExcelExportOptions {
  filename: string;
  sheetName?: string;
  title: string;
  subtitle?: string;
  businessName?: string;
  headers: string[];
  rows: (string | number)[][];
}

export interface PDFExportOptions {
  filename: string;
  title: string;
  subtitle?: string;
  businessName?: string;
  address?: string;
  ownerName?: string;
  ownerPhone?: string;
  headers: string[];
  rows: (string | number)[][];
  orientation?: 'portrait' | 'landscape';
  footerNote?: string;
}

/**
 * Generates and downloads an authentic .xlsx spreadsheet with styled headers and auto-column width
 */
export function exportToExcel(options: ExcelExportOptions): void {
  const {
    filename,
    sheetName = 'Sheet1',
    title,
    subtitle,
    businessName = 'KOS MANAGEMENT',
    headers,
    rows,
  } = options;

  // Prepare 2D matrix for worksheet
  const data: (string | number)[][] = [
    [businessName.toUpperCase()],
    [title],
  ];

  if (subtitle) {
    data.push([subtitle]);
  }
  data.push([`Tanggal Export: ${formatDateIndo(new Date().toISOString().split('T')[0])}`]);
  data.push([]); // Empty row before table

  // Table header
  data.push(headers);

  // Table rows
  rows.forEach((r) => data.push(r));

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Calculate auto column widths
  const colWidths = headers.map((h, colIndex) => {
    let maxLen = h.length;
    rows.forEach((row) => {
      const cellVal = String(row[colIndex] ?? '');
      if (cellVal.length > maxLen) {
        maxLen = cellVal.length;
      }
    });
    return { wch: Math.min(Math.max(maxLen + 3, 12), 40) };
  });
  ws['!cols'] = colWidths;

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));

  // Download
  const safeFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  XLSX.writeFile(wb, safeFilename);
}

/**
 * Generates and downloads a high quality, professional A4 PDF document
 */
export function exportToPDF(options: PDFExportOptions): void {
  const {
    filename,
    title,
    subtitle,
    businessName = 'KOS MANAGEMENT',
    address = 'Sistem Manajemen Hunian Kos',
    ownerName = 'Pemilik Kos',
    ownerPhone = '081803716514',
    headers,
    rows,
    orientation = 'portrait',
    footerNote,
  } = options;

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Primary brand colors
  const brandDark = [15, 23, 42]; // #0F172A
  const brandIndigo = [79, 70, 229]; // #4F46E5
  const slate600 = [71, 85, 105];

  // Header Box / Brand Info
  doc.setFillColor(brandDark[0], brandDark[1], brandDark[2]);
  doc.roundedRect(14, 12, 14, 14, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('KM', 18, 21);

  // Business info
  doc.setTextColor(brandDark[0], brandDark[1], brandDark[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(businessName.toUpperCase(), 32, 19);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slate600[0], slate600[1], slate600[2]);
  doc.text(address, 32, 24);
  doc.text(`Kontak Pengelola: ${ownerPhone} (${ownerName})`, 32, 28);

  // Document Title Badge
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(brandIndigo[0], brandIndigo[1], brandIndigo[2]);
  doc.text(title.toUpperCase(), 14, 38);

  // Date / Subtitle
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slate600[0], slate600[1], slate600[2]);
  const dateStr = `Dibuat pada: ${formatDateIndo(new Date().toISOString().split('T')[0])}`;
  doc.text(subtitle ? `${subtitle} | ${dateStr}` : dateStr, 14, 43);

  // Divider line
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(14, 46, pageWidth - 14, 46);

  // AutoTable
  autoTable(doc, {
    startY: 50,
    head: [headers],
    body: rows,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2.8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    styles: {
      overflow: 'linebreak',
      cellWidth: 'auto',
    },
    margin: { left: 14, right: 14, bottom: 20 },
    didDrawPage: (data) => {
      // Footer on every page
      const footerY = pageHeight - 10;
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184); // slate-400

      const leftText = footerNote || `Dokumen resmi ${businessName} | WA: ${ownerPhone}`;
      doc.text(leftText, 14, footerY);

      const pageNumber = `Halaman ${data.pageNumber}`;
      doc.text(pageNumber, pageWidth - 14 - doc.getTextWidth(pageNumber), footerY);
    },
  });

  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  doc.save(safeFilename);
}
