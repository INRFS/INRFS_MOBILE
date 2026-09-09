import * as XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import RNShare from 'react-native-share';
import { Platform } from 'react-native';

export interface ExcelExportOptions {
  filename: string;
  sheetName?: string;
  data: Record<string, any>[];
  title?: string;
}

/**
 * Universal Excel .xlsx export utility for React Native.
 * Converts JSON data into a valid Excel workbook and saves/shares on the device.
 */
export const exportToExcel = async ({
  filename,
  sheetName = 'Sheet1',
  data,
  title,
}: ExcelExportOptions): Promise<void> => {
  if (!data || data.length === 0) {
    throw new Error('No data available to export.');
  }

  try {
    // 1. Create a new workbook and convert JSON array to worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 2. Append worksheet to workbook (sheet name max 31 chars)
    const safeSheetName = (sheetName || 'Sheet1').replace(/[*?:/\\\[\]]/g, '').slice(0, 31);
    XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName || 'Data');

    // 3. Generate binary base64 output
    const base64 = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });

    // 4. Determine clean filename and directory
    const cleanFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
    const dir = RNFS.CachesDirectoryPath || RNFS.DocumentDirectoryPath;
    const filePath = `${dir}/${cleanFilename}`;

    // 5. Write to local file system
    await RNFS.writeFile(filePath, base64, 'base64');

    const fileExists = await RNFS.exists(filePath);
    if (!fileExists) {
      throw new Error('Export file could not be created on the device.');
    }

    // 6. Open share sheet / download dialog
    const fileUrl = Platform.OS === 'android' ? `file://${filePath}` : filePath;
    await RNShare.open({
      url: fileUrl,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      title: title || `Export ${cleanFilename}`,
      subject: cleanFilename,
      filename: cleanFilename,
      useInternalStorage: true,
      failOnCancel: false,
    });
  } catch (error: any) {
    // Gracefully handle user cancellation
    if (
      error?.message?.includes('User did not share') ||
      error?.message?.includes('DISMISSED') ||
      error?.message?.includes('cancel') ||
      error?.message?.includes('cancelled')
    ) {
      return;
    }
    console.warn('Excel export error:', error);
    throw error;
  }
};

export default exportToExcel;
