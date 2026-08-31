export interface Currency {
  code: string;
  name: string;
  nameTh: string;
  symbol: string;
  flag: string;
}

export interface ConversionHistoryItem {
  id: string;
  timestamp: number;
  formattedTime: string;
  fromAmount: number;
  fromCurrency: string;
  toAmount: number;
  toCurrency: string;
  rate: number;
}

export interface ExchangeRateResponse {
  result?: string;
  provider?: string;
  documentation?: string;
  terms_of_use?: string;
  time_last_update_unix?: number;
  time_last_update_utc?: string;
  time_next_update_unix?: number;
  time_next_update_utc?: string;
  base_code?: string;
  rates: Record<string, number>;
}
