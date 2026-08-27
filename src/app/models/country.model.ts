/**
 * Interface representing a country master reference item for dropdown selectors and lookup mapping.
 */
export interface CountryLookup {
  id: number;
  code: string;
  name: string;
  phoneCode?: string;
  isActive?: boolean;
}
