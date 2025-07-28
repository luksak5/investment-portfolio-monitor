
export interface Transaction {
  id: string;
  transactionType: string;
  currency: string;
  account: string;
  symbol: string;
  date: Date;
  quantity: number | null;
  tradePrice: number | null;
  commission: number | null;
  exchangeRate: number;
}



export function convertDate(dateStr: string): Date {
  // Remove extra spaces and convert to lowercase for consistent handling
  dateStr = dateStr.trim().toLowerCase();

  // Try parsing as ISO format (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr);
  }

  // Try DD-MM-YYYY format
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split('-');
    return new Date(`${year}-${month}-${day}`);
  }

  // Try text-based format (e.g., "17 March 2025" or "17 Mar 2025")
  const months: { [key: string]: string } = {
    'january': '01', 'jan': '01',
    'february': '02', 'feb': '02',
    'march': '03', 'mar': '03',
    'april': '04', 'apr': '04',
    'may': '05',
    'june': '06', 'jun': '06',
    'july': '07', 'jul': '07',
    'august': '08', 'aug': '08',
    'september': '09', 'sep': '09',
    'october': '10', 'oct': '10',
    'november': '11', 'nov': '11',
    'december': '12', 'dec': '12'
  };

  const textMatch = dateStr.match(/^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/);
  if (textMatch) {
    const [, day, monthText, year] = textMatch;
    const month = months[monthText];
    if (month) {
      // Pad day with leading zero if needed
      const paddedDay = day.padStart(2, '0');
      return new Date(`${year}-${month}-${paddedDay}`);
    }
  }

  // If none of the above formats work, try native Date parsing
  const nativeDate = new Date(dateStr);
  if (!isNaN(nativeDate.getTime())) {
    return nativeDate;
  }

  // If all parsing attempts fail, throw an error
  throw new Error(`Invalid date format: ${dateStr}. Supported formats: YYYY-MM-DD, DD-MM-YYYY, DD Month YYYY`);
}

// Helper function to format Date object to string for display
export function formatDate(date: Date | string): string {
  try {
    // If it's already a string in YYYY-MM-DD format, return it
    if (typeof date === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
      }
      // If it's a string but not in YYYY-MM-DD format, convert it
      return formatDate(convertDate(date));
    }

    // If it's a Date object, format it
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }

    throw new Error('Invalid date format');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}
