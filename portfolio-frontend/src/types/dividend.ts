/**
 * @fileoverview Dividend type definitions and utility functions for portfolio management
 * @description Core types and helper functions for dividend data handling
 * @version 1.0.0
 * @author Portfolio Monitor Team
 * @license MIT
 * 
 * This module provides:
 * - Dividend interface definition
 * - Date conversion utilities for CSV imports
 * - Date formatting functions for display
 * 
 * @example
 * ```typescript
 * import { Dividend, convertDate, formatDate } from '@/types/dividend';
 * 
 * // Create a dividend
 * const dividend: Dividend = {
 *   id: 'uuid-123',
 *   transactionType: 'Dividends',
 *   currency: 'USD',
 *   account: 'ACC001234',
 *   symbol: 'AAPL',
 *   date: new Date('2024-01-15'),
 *   amount: 150.25
 * };
 * 
 * // Convert date string to Date object
 * const date = convertDate('15-01-2024');
 * 
 * // Format date for display
 * const formattedDate = formatDate(date); // Returns "2024-01-15"
 * ```
 */

/**
 * Represents a dividend payment in the portfolio management system.
 * 
 * @interface Dividend
 * @description Core data structure for dividend operations and related metadata
 * 
 * @property {string} id - Unique identifier for the dividend (UUID format)
 * @property {string} transactionType - Type of transaction (always 'Dividends')
 * @property {string} currency - Currency code for the dividend ('USD' | 'EUR' | 'GBP' | 'INR')
 * @property {string} account - Client account identifier (foreign key to clientManagement table)
 * @property {string} symbol - Stock/security symbol (e.g., 'AAPL', 'GOOGL', 'MSFT')
 * @property {Date} date - Dividend payment date
 * @property {number} amount - Dividend amount received
 * @property {string} status - Status of the dividend ('active' | 'inactive')
 * @property {string} created_at - Timestamp when record was created
 * @property {string} updated_at - Timestamp when record was last updated
 * 
 * @example
 * ```typescript
 * // Dividend example
 * const dividend: Dividend = {
 *   id: '550e8400-e29b-41d4-a716-446655440000',
 *   transactionType: 'Dividends',
 *   currency: 'USD',
 *   account: 'ACC001234',
 *   symbol: 'AAPL',
 *   date: new Date('2024-01-15'),
 *   amount: 150.25,
 *   status: 'active',
 *   created_at: '2024-01-15T10:00:00Z',
 *   updated_at: '2024-01-15T16:45:00Z'
 * };
 * ```
 * 
 * @databaseMapping
 * Maps to the 'dividends' table in Supabase with the following constraints:
 * - id: UUID PRIMARY KEY, NOT NULL
 * - transactionType: TEXT NOT NULL, DEFAULT 'Dividends', CHECK (transactionType = 'Dividends')
 * - currency: TEXT NOT NULL, CHECK (currency IN ('USD', 'EUR', 'GBP', 'INR'))
 * - account: TEXT NOT NULL, FOREIGN KEY REFERENCES clientManagement(account)
 * - symbol: TEXT NOT NULL
 * - date: TIMESTAMP WITH TIME ZONE NOT NULL
 * - amount: DECIMAL(10,2) NOT NULL, CHECK (amount >= 0)
 * - status: TEXT NOT NULL, DEFAULT 'active', CHECK (status IN ('active', 'inactive'))
 * - created_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * - updated_at: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * 
 * @since 1.0.0
 * @see {@link convertDate} for date string conversion
 * @see {@link formatDate} for date formatting
 */
export interface Dividend {
  /** Unique identifier for the dividend (UUID format) */
  id: string;
  /** Type of transaction (always 'Dividends') */
  transactionType: string;
  /** Currency code for the dividend ('USD' | 'EUR' | 'GBP' | 'INR') */
  currency: string;
  /** Client account identifier (foreign key to clientManagement table) */
  account: string;
  /** Stock/security symbol (e.g., 'AAPL', 'GOOGL', 'MSFT') */
  symbol: string;
  /** Dividend payment date */
  date: Date;
  /** Dividend amount received */
  amount: number;
  /** Status of the dividend ('active' | 'inactive') */
  status: string;
  /** Timestamp when record was created */
  created_at: string;
  /** Timestamp when record was last updated */
  updated_at: string;
}

/**
 * Converts date strings in various formats to JavaScript Date objects.
 * 
 * @function convertDate
 * @description Robust date string parser that handles multiple input formats for CSV import compatibility
 * 
 * @param {string} dateStr - Date string to convert to Date object
 * @returns {Date} JavaScript Date object representing the parsed date
 * @throws {Error} When the date format is not supported or parsing fails
 * 
 * @example
 * ```typescript
 * // ISO format (YYYY-MM-DD)
 * convertDate('2024-01-15')        // Returns Date(2024, 0, 15)
 * 
 * // European format (DD-MM-YYYY)
 * convertDate('15-01-2024')        // Returns Date(2024, 0, 15)
 * convertDate('31-12-2023')        // Returns Date(2023, 11, 31)
 * 
 * // Text format (DD Month YYYY)
 * convertDate('15 January 2024')   // Returns Date(2024, 0, 15)
 * convertDate('17 March 2025')     // Returns Date(2025, 2, 17)
 * 
 * // Abbreviated month format (DD Mon YYYY)
 * convertDate('15 Jan 2024')       // Returns Date(2024, 0, 15)
 * convertDate('31 Dec 2023')       // Returns Date(2023, 11, 31)
 * 
 * // Case insensitive
 * convertDate('15 JANUARY 2024')   // Returns Date(2024, 0, 15)
 * convertDate('15 jan 2024')       // Returns Date(2024, 0, 15)
 * ```
 * 
 * @supportedFormats
 * 1. **ISO Format**: YYYY-MM-DD (e.g., "2024-01-15")
 * 2. **European Format**: DD-MM-YYYY (e.g., "15-01-2024")
 * 3. **Text Format**: DD Month YYYY (e.g., "15 January 2024")
 * 4. **Abbreviated Format**: DD Mon YYYY (e.g., "15 Jan 2024")
 * 5. **Native Date Parsing**: Falls back to JavaScript's native Date parsing
 * 
 * @errorHandling
 * - Trims whitespace and converts to lowercase for consistent handling
 * - Validates date format before parsing
 * - Throws descriptive error messages for unsupported formats
 * - Handles edge cases like single-digit days and months
 * 
 * @useCase
 * Primarily used for CSV import functionality where date formats may vary:
 * - Excel exports often use DD-MM-YYYY format
 * - Database exports typically use YYYY-MM-DD format
 * - Manual entries might use text-based formats
 * 
 * @since 1.0.0
 * @author Portfolio Monitor Team
 */
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

/**
 * Helper function to format Date objects to string for display purposes.
 * 
 * @function formatDate
 * @description Converts Date objects or date strings to consistent YYYY-MM-DD string format
 * 
 * @param {Date | string} date - Date object or string to format
 * @returns {string} Formatted date string in YYYY-MM-DD format
 * 
 * @example
 * ```typescript
 * // Format Date object
 * formatDate(new Date('2024-01-15'))  // Returns "2024-01-15"
 * formatDate(new Date('2023-12-31'))  // Returns "2023-12-31"
 * 
 * // Format already formatted string (no change)
 * formatDate('2024-01-15')            // Returns "2024-01-15"
 * 
 * // Format other date strings (converts first)
 * formatDate('15-01-2024')            // Returns "2024-01-15"
 * formatDate('15 January 2024')       // Returns "2024-01-15"
 * 
 * // Handle invalid dates
 * formatDate('invalid-date')          // Returns "Invalid Date"
 * ```
 * 
 * @behavior
 * - If input is already a string in YYYY-MM-DD format, returns it unchanged
 * - If input is a string in other format, converts it using convertDate() first
 * - If input is a Date object, formats it to YYYY-MM-DD string
 * - Returns "Invalid Date" for any parsing errors
 * 
 * @useCase
 * Used throughout the application for consistent date display:
 * - Table display formatting
 * - Form input values
 * - Export functionality
 * - API responses
 * 
 * @errorHandling
 * - Wraps all operations in try-catch block
 * - Logs errors to console for debugging
 * - Returns "Invalid Date" string for any failures
 * - Graceful degradation for invalid inputs
 * 
 * @since 1.0.0
 * @author Portfolio Monitor Team
 * @see {@link convertDate} for date string parsing
 */
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