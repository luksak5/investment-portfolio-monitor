
export interface Transaction {
  id: string;
  date: string;
  account: string;
  description: string;
  transactionType: string;
  symbol: string;
  quantity: number | null;
  price: number | null;
  grossAmount: number;
  commission: number | null;
  netAmount: number;
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
