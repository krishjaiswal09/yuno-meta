import type {
  ItemMaster as ItemMasterType,
  CategoryMetric,
  ITRMetric
} from '../types/inventory';

// Type definitions for raw data from API
export interface RawInventoryData {
  'Item ID': string;
  'Date': string;
  'Opening Stock': number;
  'Consumption': number;
  'Incoming': number;
  'Closing Stock': number;
  'Units': string;
  'Item Name': string;
  'Category': string;
  'Unit Price': number;
  'ABC Class': string;
  'MSL': number;
}

export interface InventoryData extends RawInventoryData {}
export interface ItemMaster extends ItemMasterType {}

export interface MSLStatus {
  status: 'Below' | 'Optimal' | 'Excess';
  threshold: number;
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

// Stock level calculations
export const calculateAverageStock = (openingStock: number, closingStock: number): number => {
  return (openingStock + closingStock) / 2;
};

const calculateITR = (totalConsumption: number, averageInventory: number): number => {
  return averageInventory === 0 ? 0 : totalConsumption / averageInventory;
};

// Stock status evaluations
export const evaluateStockLevel = (stock: number, msl: number): 'Low' | 'Optimal' | 'High' => {
  const stockToMSL = stock / msl;
  if (stockToMSL < 0.9) return 'Low';
  if (stockToMSL > 1.5) return 'High';
  return 'Optimal';
};

export const evaluateMSLStatus = (stock: number, msl: number): MSLStatus => {
  const ratio = stock / msl;
  if (ratio < 0.9) return { status: 'Below', threshold: 0.9 };
  if (ratio > 1.5) return { status: 'Excess', threshold: 1.5 };
  return { status: 'Optimal', threshold: 1 };
};

// Data fetching functions
export async function fetchItemMaster(): Promise<ItemMaster[]> {
  try {
    const response = await fetch('/data/item_master.json');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  } catch (error) {
    console.error('Error fetching item master data:', error);
    throw new Error('Failed to fetch item master data');
  }
}

export async function fetchInventoryData(): Promise<InventoryData[]> {
  try {
    const response = await fetch('/data/inventory_data.json');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  } catch (error) {
    console.error('Error fetching inventory data:', error);
    throw new Error('Failed to fetch inventory data');
  }
}

// Metric calculation functions
export function calculateMSLTrends(
  stockData: InventoryData[]
): MSLTrend[] {
  return stockData.map(record => ({
    itemId: record['Item ID'],
    date: record.Date,
    stock: record['Closing Stock'],
    msl: record.MSL
  }));
}

export function calculateConsumptionTrends(
  stockData: InventoryData[]
): ConsumptionTrend[] {
  const sortedData = [...stockData].sort((a, b) => a.Date.localeCompare(b.Date));
  const monthlyUsage = new Map<string, Map<string, number>>();
  
  // Aggregate daily consumption into monthly totals
  sortedData.forEach(record => {
    const monthKey = record.Date.substring(0, 7); // YYYY-MM format
    const usage = Math.max(0, record.Consumption || 0);

    if (!monthlyUsage.has(monthKey)) {
      monthlyUsage.set(monthKey, new Map());
    }

    const itemsInMonth = monthlyUsage.get(monthKey)!;
    const currentTotal = itemsInMonth.get(record['Item ID']) || 0;
    itemsInMonth.set(record['Item ID'], currentTotal + usage);
  });

  // Transform monthly data into trend format
  const trends: ConsumptionTrend[] = [];
  monthlyUsage.forEach((items, month) => {
    items.forEach((usage, itemId) => {
      const itemDetails = stockData.find(r => r['Item ID'] === itemId);
      if (!itemDetails) return;

      trends.push({
        itemId,
        category: itemDetails.Category,
        abcClass: itemDetails['ABC Class'],
        month,
        consumption: usage
      });
    });
  });

  return trends.sort((a, b) => a.month.localeCompare(b.month));
}

export function calculateCategoryMetrics(
  stockData: InventoryData[]
): CategoryMetric[] {
  const categoryStats = new Map<string, CategoryMetric>();

  stockData.forEach(record => {
    if (!categoryStats.has(record.Category)) {
      categoryStats.set(record.Category, {
        category: record.Category,
        totalItems: 0,
        stockValue: 0,
        consumptionRate: 0
      });
    }

    const stats = categoryStats.get(record.Category)!;
    stats.totalItems++;
    stats.stockValue += record['Closing Stock'] * record['Unit Price'];
    stats.consumptionRate += record.Consumption;
  });

  return Array.from(categoryStats.values());
}

export function calculateITRMetrics(
  stockData: InventoryData[]
): ITRMetric[] {
  // Group and aggregate data by item
  const itemData = new Map<string, {
    totalConsumption: number;
    stockValues: { opening: number; closing: number }[];
    itemName: string;
    category: string;
    abcClass: string;
  }>();

  // Sort data chronologically
  const sortedData = [...stockData].sort((a, b) => a.Date.localeCompare(b.Date));

  // Process each record
  sortedData.forEach(record => {
    if (!itemData.has(record['Item ID'])) {
      itemData.set(record['Item ID'], {
        totalConsumption: record.Consumption,
        stockValues: [{
          opening: record['Opening Stock'],
          closing: record['Closing Stock']
        }],
        itemName: record['Item Name'],
        category: record.Category,
        abcClass: record['ABC Class']
      });
    } else {
      const current = itemData.get(record['Item ID'])!;
      current.totalConsumption += record.Consumption;
      current.stockValues.push({
        opening: record['Opening Stock'],
        closing: record['Closing Stock']
      });
    }
  });

  // Calculate final metrics
  return Array.from(itemData.entries()).map(([itemId, data]) => {
    // Calculate average inventory using all stock values
    const totalStockValues = data.stockValues.reduce((sum, stock) => {
      return sum + (stock.opening + stock.closing) / 2;
    }, 0);
    const averageInventory = data.stockValues.length > 0 
      ? totalStockValues / data.stockValues.length 
      : 0;

    // Calculate ITR using total consumption and average inventory
    const itr = calculateITR(data.totalConsumption, averageInventory);

    return {
      itemId,
      itemName: data.itemName,
      category: data.category,
      abcClass: data.abcClass,
      itr,
      averageInventory,
      monthlyConsumption: data.totalConsumption / (data.stockValues.length || 1),
      dataPoints: data.stockValues.length
    };
  });
}

import { useState, useEffect } from 'react';

interface StockMetric {
  category: string;
  value: number;
}

export const useInventoryData = () => {
  const [stockMetrics, setStockMetrics] = useState<StockMetric[]>([]);

  useEffect(() => {
    // TODO: Replace with actual API call
    const dummyData = [
      { category: 'Electronics', value: 1200 },
      { category: 'Furniture', value: 800 },
      { category: 'Clothing', value: 600 },
      { category: 'Books', value: 400 }
    ];
    setStockMetrics(dummyData);
  }, []);

  return { stockMetrics };
};