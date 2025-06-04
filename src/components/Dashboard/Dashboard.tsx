import React, { useState } from 'react';
import { Box } from '@mui/material';
import FilterPanel, { FilterState } from './FilterPanel';
import CategoryDistribution from './CategoryDistribution';
import MSLTrendAnalysis from './MSLTrendAnalysis';
import ConsumptionTrend from './ConsumptionTrend';
import InventoryTable from './InventoryTable';
import DataLoader from './DataLoader';
import type { MSLTrend, ConsumptionTrend as ConsumptionTrendType } from '../../services/inventoryService';

const Dashboard: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    itemName: '',
    category: '',
    abcClass: '',
    itemId: '',
    dateRange: [null, null],
  });

  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
      <DataLoader>
        {(data) => {
          // Filter MSL trends
          const filteredMSLTrends: MSLTrend[] = data.mslTrends.filter(trend => {
            if (filters.itemId && trend.itemId !== filters.itemId) return false;
            if (filters.dateRange[0] || filters.dateRange[1]) {
              const date = new Date(trend.date);
              if (filters.dateRange[0] && date < filters.dateRange[0]) return false;
              if (filters.dateRange[1] && date > filters.dateRange[1]) return false;
            }
            return true;
          });

          // Filter consumption trends
          const filteredConsumptionTrends: ConsumptionTrendType[] = data.consumptionTrends.filter(trend => {
            if (filters.category && trend.category !== filters.category) return false;
            if (filters.abcClass && trend.abcClass !== filters.abcClass) return false;
            if (filters.itemId && trend.itemId !== filters.itemId) return false;
            return true;
          });

          return (
            <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={3}>
              <Box gridColumn="span 12">
                <FilterPanel
                  filters={filters}
                  onFilterChange={setFilters}
                  categories={Array.from(new Set(data.itemMaster.map(item => item.Category)))}
                  itemOptions={data.itemMaster.map(item => ({
                    id: item['Item ID'],
                    name: item['Item Name'],
                  }))}
                />
              </Box>

              <Box gridColumn={{ xs: 'span 12', md: 'span 6' }}>
                <CategoryDistribution
                  data={data.categoryMetrics}
                  selectedCategory={filters.category}
                />
              </Box>

              <Box gridColumn={{ xs: 'span 12', md: 'span 6' }}>
                <MSLTrendAnalysis
                  data={filteredMSLTrends}
                  itemId={filters.itemId || filteredMSLTrends[0]?.itemId || ''}
                  itemName={
                    data.itemMaster.find(
                      item => item['Item ID'] === (filters.itemId || filteredMSLTrends[0]?.itemId)
                    )?.['Item Name'] || ''
                  }
                />
              </Box>

              <Box gridColumn="span 12">
                <ConsumptionTrend
                  data={filteredConsumptionTrends}
                  filters={{
                    category: filters.category,
                    abcClass: filters.abcClass,
                    itemId: filters.itemId,
                  }}
                />
              </Box>

              <Box gridColumn="span 12">
                <InventoryTable
                  data={data.itrMetrics}
                  filters={{
                    itemName: filters.itemName,
                    category: filters.category,
                    abcClass: filters.abcClass,
                  }}
                />
              </Box>
            </Box>
          );
        }}
      </DataLoader>
    </Box>
  );
};

export default Dashboard; 