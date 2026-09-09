import RNFS from 'react-native-fs';
import RNShare from 'react-native-share';
import { Platform } from 'react-native';

export interface BondCertificatePdfData {
  bondId: string;
  investorName: string;
  investorId: string;
  mobile?: string;
  email?: string;
  principal: number;
  rate: number;
  tenureMonths: number;
  investmentDate?: string;
  maturityDate?: string;
  monthlyInterest?: number;
  expectedInterest?: number;
  maturityAmount?: number;
  status?: string;
  verificationUrl?: string;
}

const formatCurrency = (val: number | undefined | null): string => {
  const n = Math.round(Number(val) || 0);
  return 'INR ' + n.toLocaleString('en-IN');
};

const sanitizePdfText = (str: any): string => {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[\u20B9\u00A3\u20AC]/g, 'INR ');
};

const getUtf8ByteLength = (str: string): number => {
  let len = 0;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code < 0x80) len += 1;
    else if (code < 0x800) len += 2;
    else if (code < 0xd800 || code >= 0xe000) len += 3;
    else {
      i++;
      len += 4;
    }
  }
  return len;
};

const toBase64Utf8 = (str: string): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  const bytes: number[] = [];

  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i);
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push((code >> 6) | 0xc0);
      bytes.push((code & 0x3f) | 0x80);
    } else if (code < 0xd800 || code >= 0xe000) {
      bytes.push((code >> 12) | 0xe0);
      bytes.push(((code >> 6) & 0x3f) | 0x80);
      bytes.push((code & 0x3f) | 0x80);
    } else {
      i++;
      const nextCode = str.charCodeAt(i);
      code = 0x10000 + (((code & 0x3ff) << 10) | (nextCode & 0x3ff));
      bytes.push((code >> 18) | 0xf0);
      bytes.push(((code >> 12) & 0x3f) | 0x80);
      bytes.push(((code >> 6) & 0x3f) | 0x80);
      bytes.push((code & 0x3f) | 0x80);
    }
  }

  let output = '';
  let i = 0;
  while (i < bytes.length) {
    const b1 = bytes[i++];
    const b2 = i < bytes.length ? bytes[i++] : NaN;
    const b3 = i < bytes.length ? bytes[i++] : NaN;

    const e1 = b1 >> 2;
    const e2 = ((b1 & 3) << 4) | (b2 >> 4);
    let e3 = ((b2 & 15) << 2) | (b3 >> 6);
    let e4 = b3 & 63;

    if (isNaN(b2)) {
      e3 = e4 = 64;
    } else if (isNaN(b3)) {
      e4 = 64;
    }

    output += chars.charAt(e1) + chars.charAt(e2) + chars.charAt(e3) + chars.charAt(e4);
  }

  return output;
};

/**
 * Creates a valid, standard PDF 1.4 binary content string for the Bond Certificate.
 */
export const createBondCertificatePdfContent = (data: BondCertificatePdfData): string => {
  let content = '';
  const write = (line: string) => {
    content += line + '\n';
  };

  const bId = sanitizePdfText(data.bondId || 'BND-OFFICIAL');

  // Background (A4: 595.28 x 841.89 pt)
  write('0.99 0.99 0.97 rg');
  write('0 0 595.28 841.89 re f');

  // Outer Decorative Border (Gold Primary #C5A85C)
  write('0.77 0.65 0.36 RG 2 w');
  write('20 20 555.28 801.89 re S');

  // Inner Border (Gold Dark #8A6D2F)
  write('0.54 0.43 0.18 RG 0.75 w');
  write('26 26 543.28 789.89 re S');

  // Header Banner Card
  write('0.96 0.93 0.85 rg 0.77 0.65 0.36 RG 1 w');
  write('35 746.89 525.28 48 re B');

  // Header Logo & Branding
  write('BT /F2 20 Tf 0.54 0.43 0.18 rg 1 0 0 1 50 768 Tm (INRFS) Tj ET');
  write('BT /F2 11 Tf 0.1 0.1 0.1 rg 1 0 0 1 130 770 Tm (INVESTMENT PORTAL) Tj ET');
  write('BT /F2 10 Tf 0.54 0.43 0.18 rg 1 0 0 1 360 770 Tm (OFFICIAL BOND CERTIFICATE) Tj ET');

  // Certificate Title & Subtitle
  write('BT /F2 16 Tf 0.1 0.1 0.1 rg 1 0 0 1 135 700 Tm (CERTIFICATE OF INVESTMENT BOND) Tj ET');
  write('BT /F1 9.5 Tf 0.45 0.45 0.45 rg 1 0 0 1 115 682 Tm (This certificate confirms the following fixed return investment with INRFS.) Tj ET');

  // Bond ID Badge
  write('0.96 0.93 0.85 rg 0.77 0.65 0.36 RG 1.2 w');
  write('185 638 225 28 re B');
  write('BT /F2 11 Tf 0.54 0.43 0.18 rg 1 0 0 1 205 648 Tm (BOND ID: ' + bId + ') Tj ET');

  // Principal Box
  const principalVal = formatCurrency(data.principal);
  write('1 1 1 rg 0.77 0.65 0.36 RG 1.5 w');
  write('45 548 505.28 72 re B');
  write('BT /F2 10 Tf 0.54 0.43 0.18 rg 1 0 0 1 60 596 Tm (INVESTED PRINCIPAL AMOUNT) Tj ET');
  write('BT /F2 22 Tf 0.1 0.1 0.1 rg 1 0 0 1 60 566 Tm (' + sanitizePdfText(principalVal) + ') Tj ET');

  // Two-Column Grid Helper
  const drawRow = (
    y: number,
    label1: string,
    val1: string,
    label2: string,
    val2: string,
    isHigh2 = false,
  ) => {
    write('1 1 1 rg 0.85 0.85 0.85 RG 0.75 w');
    write('45 ' + y + ' 505.28 44 re B');

    // Col 1
    write('BT /F2 8.5 Tf 0.45 0.45 0.45 rg 1 0 0 1 55 ' + (y + 26) + ' Tm (' + sanitizePdfText(label1) + ') Tj ET');
    write('BT /F2 11 Tf 0.1 0.1 0.1 rg 1 0 0 1 55 ' + (y + 10) + ' Tm (' + sanitizePdfText(val1) + ') Tj ET');

    // Col 2
    write('BT /F2 8.5 Tf 0.45 0.45 0.45 rg 1 0 0 1 310 ' + (y + 26) + ' Tm (' + sanitizePdfText(label2) + ') Tj ET');
    const col2Color = isHigh2 ? '0.02 0.58 0.41' : '0.1 0.1 0.1';
    write('BT /F2 11 Tf ' + col2Color + ' rg 1 0 0 1 310 ' + (y + 10) + ' Tm (' + sanitizePdfText(val2) + ') Tj ET');
  };

  let rowY = 492;
  drawRow(rowY, 'INVESTOR NAME', data.investorName || '—', 'INVESTOR ID', data.investorId || '—');

  rowY -= 48;
  drawRow(rowY, 'MOBILE NUMBER', data.mobile || '—', 'EMAIL ADDRESS', data.email || '—');

  rowY -= 48;
  drawRow(rowY, 'INVESTMENT DATE', data.investmentDate || '—', 'MATURITY DATE', data.maturityDate || '—');

  rowY -= 48;
  drawRow(
    rowY,
    'INTEREST RATE',
    `${data.rate}% p.a.`,
    'TENURE DURATION',
    `${data.tenureMonths || 1} Months`,
  );

  rowY -= 48;
  drawRow(
    rowY,
    'MONTHLY INTEREST',
    formatCurrency(data.monthlyInterest),
    'TOTAL EXPECTED INTEREST',
    formatCurrency(data.expectedInterest),
  );

  rowY -= 48;
  drawRow(
    rowY,
    'INVESTMENT STATUS',
    data.status || 'Active',
    'MATURITY AMOUNT',
    formatCurrency(data.maturityAmount),
    true,
  );

  // Verification Box
  rowY -= 76;
  write('0.96 0.93 0.85 rg 0.77 0.65 0.36 RG 1 w');
  write('45 ' + rowY + ' 505.28 64 re B');
  write('BT /F2 9 Tf 0.54 0.43 0.18 rg 1 0 0 1 60 ' + (rowY + 44) + ' Tm (OFFICIAL VERIFICATION DETAILS) Tj ET');
  const verifyUrl = data.verificationUrl || `verify.inrfs.in/${bId}`;
  write('BT /F2 9.5 Tf 0.1 0.1 0.1 rg 1 0 0 1 60 ' + (rowY + 26) + ' Tm (Online Verification: ' + sanitizePdfText(verifyUrl) + ') Tj ET');
  write('BT /F3 8 Tf 0.45 0.45 0.45 rg 1 0 0 1 60 ' + (rowY + 12) + ' Tm (This certificate is authenticated with cryptographic server validation.) Tj ET');

  // Footer Disclaimers
  write('BT /F2 8 Tf 0.54 0.43 0.18 rg 1 0 0 1 150 61 Tm (ISSUED UNDER THE OFFICIAL SEAL OF INRFS INVESTMENTS) Tj ET');
  write('BT /F1 7.5 Tf 0.45 0.45 0.45 rg 1 0 0 1 115 49 Tm (This is an authentic computer-generated investment certificate. No physical signature is required.) Tj ET');

  const streamLen = getUtf8ByteLength(content);

  const objects: string[] = [];
  objects[1] = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  objects[2] = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  objects[3] = '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources 4 0 R /Contents 5 0 R >>\nendobj\n';
  objects[4] = '4 0 obj\n<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> /F3 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >> >> >>\nendobj\n';
  objects[5] = '5 0 obj\n<< /Length ' + streamLen + ' >>\nstream\n' + content + 'endstream\nendobj\n';

  const pdfHeader = '%PDF-1.4\n%âãÏÓ\n';
  let body = '';
  const offsets: number[] = [];
  let currentOffset = getUtf8ByteLength(pdfHeader);

  for (let i = 1; i <= 5; i++) {
    offsets[i] = currentOffset;
    body += objects[i];
    currentOffset += getUtf8ByteLength(objects[i]);
  }

  let xref = 'xref\n0 6\n0000000000 65535 f \n';
  for (let i = 1; i <= 5; i++) {
    xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }

  const startxref = currentOffset;
  const trailer = 'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + startxref + '\n%%EOF\n';

  return pdfHeader + body + xref + trailer;
};

/**
 * Generates an authentic A4 PDF Bond Certificate and opens native download/share.
 */
export const generateAndDownloadBondPdf = async (
  data: BondCertificatePdfData,
): Promise<void> => {
  if (!data) {
    throw new Error('Bond certificate data is missing.');
  }

  try {
    const rawPdf = createBondCertificatePdfContent(data);
    const base64 = toBase64Utf8(rawPdf);

    const cleanId = String(data.bondId || 'BND-OFFICIAL').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `Bond_Certificate_${cleanId}.pdf`;
    const dir = RNFS.CachesDirectoryPath || RNFS.DocumentDirectoryPath;
    const filePath = `${dir}/${filename}`;

    await RNFS.writeFile(filePath, base64, 'base64');

    const exists = await RNFS.exists(filePath);
    if (!exists) {
      throw new Error('Certificate PDF could not be created on the device.');
    }

    const fileUrl = Platform.OS === 'android' ? `file://${filePath}` : filePath;
    await RNShare.open({
      url: fileUrl,
      type: 'application/pdf',
      title: `Download ${filename}`,
      subject: `INRFS Bond Certificate - ${cleanId}`,
      filename: filename,
      useInternalStorage: true,
      failOnCancel: false,
    });
  } catch (error: any) {
    if (
      error?.message?.includes('User did not share') ||
      error?.message?.includes('DISMISSED') ||
      error?.message?.includes('cancel') ||
      error?.message?.includes('cancelled')
    ) {
      return;
    }
    console.warn('PDF Certificate generation error:', error);
    throw error;
  }
};

export default generateAndDownloadBondPdf;
