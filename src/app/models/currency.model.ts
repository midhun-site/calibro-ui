/**
 * ISO 4217 Currency reference model for financial calculations, invoicing, and branch defaults.
 */
export interface CurrencyLookup {
  id: number;
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
  isDefault?: boolean;
  isActive?: boolean;
}
