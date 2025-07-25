
export interface Transaction {
  id: string;
  date: Date;
  account: string;
  transactionType: string;
  symbol: string;
  quantity: number | null;
  price: number | null;
  commission: number | null;
  exchangeRate: number;
  currency?: string;
}

export interface AccountMapping {
  id: string;
  fullAccount: string;
  clientName: string;
  clientEmail: string;
  riskProfile: string;
  isActive: boolean;
}

export function convertDate(dateStr: string): Date {
  // Try parsing the date string directly
  const parsedDate = new Date(dateStr);
  
  // Check if the date is valid
  if (!isNaN(parsedDate.getTime())) {
    return parsedDate;
  }
  
  throw new Error(`Invalid date format: ${dateStr}`);
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
