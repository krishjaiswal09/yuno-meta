export interface ItemMaster {
  'Item ID': string;
  'Item Name': string;
  Category: string;
  'ABC Class': string;
  MSL: number;
  'Unit Price': number;
}

export interface InventoryData {
  'Item ID': string;
  Date: string;
  'Opening Stock': number;
  Consumption: number;
  Incoming: number;
  'Closing Stock': number;
  Units: string;
  'Item Name': string;
  Category: string;
  'Unit Price': number;
  'ABC Class': string;
  MSL: number;
  'Inventory Turnover ratio'?: number;
  Ratio?: number;
}

export interface MSLTrend {
  itemId: string;
  date: string;
  stock: number;
  msl: number;
}

export interface ConsumptionTrend {
  itemId: string;
  category: string;
  abcClass: string;
  month: string;
  consumption: number;
}

export interface CategoryMetric {
  category: string;
  totalItems: number;
  stockValue: number;
  consumptionRate: number;
}

export interface ITRMetric {
  itemId: string;
  itemName: string;
  category: string;
  abcClass: string;
  itr: number;
  averageInventory: number;
  monthlyConsumption: number;
  dataPoints?: number;
}

export interface FilterState {
  itemName: string;
  category: string;
  abcClass: string;
  itemId: string;
  dateRange: [Date | null, Date | null];
}

export interface ItemOption {
  id: string;
  name: string;
} 