export interface Customer {
  id: string;
  code: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  taxNumber?: string;
  totalEquipments: number;
  activeWorkOrders: number;
}

export interface CreateCustomerPayload {
  code: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  taxNumber?: string;
}
