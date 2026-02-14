/**
 * Batch code generator
 * Format: PRODUCTPARTNUMBER-YYYYMMDD-SEQ
 * Example: AB123-20260215-001
 */

/**
 * Generate a batch code for a product
 * @param partNumber - Product part number
 * @param lastSequenceNumber - Last sequence number for this date (to determine next SEQ)
 * @returns Generated batch code
 */
export function generateBatchCode(
  partNumber: string,
  lastSequenceNumber: number = 0
): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const nextSeq = lastSequenceNumber + 1;
  const seqStr = String(nextSeq).padStart(3, '0');

  return `${partNumber}-${dateStr}-${seqStr}`;
}

/**
 * Parse batch code to extract components
 * @param batchCode - Batch code in format PARTNUM-YYYYMMDD-SEQ
 * @returns Parsed components or null if invalid
 */
export interface ParsedBatchCode {
  partNumber: string;
  date: Date;
  sequence: number;
}

export function parseBatchCode(batchCode: string): ParsedBatchCode | null {
  const pattern = /^(.+)-(\d{8})-(\d{3})$/;
  const match = batchCode.match(pattern);

  if (!match) {
    return null;
  }

  const [, partNumber, dateStr, seqStr] = match;
  const year = parseInt(dateStr.substring(0, 4), 10);
  const month = parseInt(dateStr.substring(4, 6), 10) - 1;
  const day = parseInt(dateStr.substring(6, 8), 10);

  const date = new Date(year, month, day);
  const sequence = parseInt(seqStr, 10);

  return { partNumber, date, sequence };
}
