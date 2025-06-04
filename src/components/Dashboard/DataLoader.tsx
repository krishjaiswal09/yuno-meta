import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import type { ItemMaster, InventoryData, MSLTrend, ConsumptionTrend, CategoryMetric, ITRMetric } from '../../types/inventory';
import {
  fetchItemMaster,
  fetchInventoryData,
  calculateMSLTrends,
  calculateConsumptionTrends,
  calculateCategoryMetrics,
  calculateITRMetrics
} from '../../services/inventoryService';

interface DataLoaderProps {
  children: (data: {
    itemMaster: ItemMaster[];
    inventoryData: InventoryData[];
    mslTrends: MSLTrend[];
    consumptionTrends: ConsumptionTrend[];
    categoryMetrics: CategoryMetric[];
    itrMetrics: ITRMetric[];
  }) => React.ReactNode;
}

const DataLoader: React.FC<DataLoaderProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    itemMaster: ItemMaster[];
    inventoryData: InventoryData[];
    mslTrends: MSLTrend[];
    consumptionTrends: ConsumptionTrend[];
    categoryMetrics: CategoryMetric[];
    itrMetrics: ITRMetric[];
  } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch raw data
        console.log('Fetching data...');
        const [itemMaster, inventoryData] = await Promise.all([
          fetchItemMaster(),
          fetchInventoryData()
        ]);
        console.log('Raw data received:', { itemMaster, inventoryData });

        // Calculate metrics
        console.log('Calculating metrics...');
        const mslTrends = calculateMSLTrends(inventoryData);
        console.log('MSL Trends:', mslTrends);
        
        const consumptionTrends = calculateConsumptionTrends(inventoryData);
        console.log('Consumption Trends:', consumptionTrends);
        
        const categoryMetrics = calculateCategoryMetrics(inventoryData);
        console.log('Category Metrics:', categoryMetrics);
        
        const itrMetrics = calculateITRMetrics(inventoryData);
        console.log('ITR Metrics:', itrMetrics);

        const processedData = {
          itemMaster,
          inventoryData,
          mslTrends,
          consumptionTrends,
          categoryMetrics,
          itrMetrics
        };
        console.log('Setting processed data:', processedData);
        setData(processedData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load inventory data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!data) {
    return null;
  }

  return <>{children(data)}</>;
};

export default DataLoader; 