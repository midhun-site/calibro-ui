export enum EquipmentStatus {
  Active = 1,
  InCalibration = 2,
  OutOfService = 3,
  Scrapped = 4
}

export interface CustomerEquipment {
  id: string;
  customerId: string;
  customerName: string;
  assetTag: string;
  name: string;
  category: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  location: string;
  accuracySpec: string;
  measurementRange: string;
  calibrationIntervalMonths: number;
  lastCalibrationDate?: string;
  nextDueDate?: string;
  status: EquipmentStatus;
  isOverdue: boolean;
}

export interface CreateEquipmentPayload {
  customerId: string;
  assetTag: string;
  name: string;
  category: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  location: string;
  accuracySpec: string;
  measurementRange: string;
  calibrationIntervalMonths: number;
}
