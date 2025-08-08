export interface SymbolMapping {
  id: number;
  ibkr_symbol: string;
  yahoo_symbol: string;
  security_name?: string;
  exchange?: string;
  asset_type?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSymbolMappingRequest {
  ibkr_symbol: string;
  yahoo_symbol: string;
  security_name?: string;
  exchange?: string;
  asset_type?: string;
  is_active?: boolean;
}

export interface UpdateSymbolMappingRequest {
  id: number;
  ibkr_symbol?: string;
  yahoo_symbol?: string;
  security_name?: string;
  exchange?: string;
  asset_type?: string;
  is_active?: boolean;
}

export interface SymbolMappingFilters {
  search?: string;
  exchange?: string;
  asset_type?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

export interface SymbolMappingResponse {
  data: SymbolMapping[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 