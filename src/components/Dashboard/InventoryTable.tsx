import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  Chip,
  Paper
} from '@mui/material';
import { ITRMetric } from '../../types/inventory';

// Visual styling constants
const STYLE_CONSTANTS = {
  colors: {
    low: 'red',
    optimal: 'limegreen',
    high: 'red',
    abcClass: {
      A: 'limegreen',
      B: 'purple',
      C: 'orange'
    }
  },
  backgrounds: {
    card: 'linear-gradient(180deg, rgba(36,37,56,0.5) 0%, rgba(36,37,56,0.8) 100%)',
    hover: 'rgba(255,255,255,0.03)'
  }
};

interface InventoryTableProps {
  data: ITRMetric[];
  filters: {
    itemName: string;
    category: string;
    abcClass: string;
  };
}

// Utility functions for data formatting
const extractProductNumber = (name: string): number => {
  const match = name.match(/\\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

const formatNumber = (value: number | undefined | null): string => {
  if (typeof value !== 'number' || isNaN(value)) return '0';
  return value.toLocaleString();
};

const formatDecimal = (value: number | undefined | null, decimals: number = 2): string => {
  if (typeof value !== 'number' || isNaN(value)) return '0';
  return value.toFixed(decimals);
};

// Business logic for turnover evaluation
const evaluateTurnover = (itr: number): 'Low' | 'Optimal' | 'High' => {
  if (itr < 1) return 'Low';
  if (itr > 3) return 'High';
  return 'Optimal';
};

const InventoryTable: React.FC<InventoryTableProps> = ({ data, filters }) => {
  const [sortField, setSortField] = useState<keyof ITRMetric>('itemName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter items based on user selections
  const filteredItems = data.filter(item => {
    if (!item) return false;
    
    const nameMatch = !filters.itemName || 
      item.itemName?.toLowerCase().includes(filters.itemName.toLowerCase());
    const categoryMatch = !filters.category || item.category === filters.category;
    const classMatch = !filters.abcClass || item.abcClass === filters.abcClass;
    
    return nameMatch && categoryMatch && classMatch;
  });

  // Handle column sorting
  const handleSortChange = (field: keyof ITRMetric) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Sort items based on current sort settings
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      if (!a || !b) return 0;
      
      const valueA = a[sortField];
      const valueB = b[sortField];

      // Natural sort for product names
      if (sortField === 'itemName') {
        const numA = extractProductNumber(String(valueA));
        const numB = extractProductNumber(String(valueB));
        const comparison = numA - numB;
        return sortOrder === 'asc' ? comparison : -comparison;
      }
      
      // Handle numeric comparisons
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        if (isNaN(valueA) && isNaN(valueB)) return 0;
        if (isNaN(valueA)) return sortOrder === 'asc' ? 1 : -1;
        if (isNaN(valueB)) return sortOrder === 'asc' ? -1 : 1;
        return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
      }
      
      // Default string comparison
      return sortOrder === 'asc'
        ? String(valueA || '').localeCompare(String(valueB || ''))
        : String(valueB || '').localeCompare(String(valueA || ''));
    });
  }, [filteredItems, sortOrder, sortField]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        background: STYLE_CONSTANTS.backgrounds.card,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Inventory Turnover Analysis
      </Typography>
      <TableContainer sx={{ maxHeight: 400 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {/* Column Headers */}
              <TableCell>
                <TableSortLabel
                  active={sortField === 'itemName'}
                  direction={sortField === 'itemName' ? sortOrder : 'asc'}
                  onClick={() => handleSortChange('itemName')}
                >
                  Item Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'category'}
                  direction={sortField === 'category' ? sortOrder : 'asc'}
                  onClick={() => handleSortChange('category')}
                >
                  Category
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'abcClass'}
                  direction={sortField === 'abcClass' ? sortOrder : 'asc'}
                  onClick={() => handleSortChange('abcClass')}
                >
                  ABC Class
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sortField === 'itr'}
                  direction={sortField === 'itr' ? sortOrder : 'asc'}
                  onClick={() => handleSortChange('itr')}
                >
                  ITR
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Status</TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sortField === 'monthlyConsumption'}
                  direction={sortField === 'monthlyConsumption' ? sortOrder : 'asc'}
                  onClick={() => handleSortChange('monthlyConsumption')}
                >
                  Monthly Consumption
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sortField === 'averageInventory'}
                  direction={sortField === 'averageInventory' ? sortOrder : 'asc'}
                  onClick={() => handleSortChange('averageInventory')}
                >
                  Current Stock
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedItems.map((item) => {
              const turnoverStatus = evaluateTurnover(item.itr);
              return (
                <TableRow
                  key={item.itemId}
                  sx={{ '&:hover': { bgcolor: STYLE_CONSTANTS.backgrounds.hover } }}
                >
                  <TableCell>{item.itemName}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.abcClass}
                      size="small"
                      sx={{
                        bgcolor: `${STYLE_CONSTANTS.colors.abcClass[item.abcClass as keyof typeof STYLE_CONSTANTS.colors.abcClass]}22`,
                        color: STYLE_CONSTANTS.colors.abcClass[item.abcClass as keyof typeof STYLE_CONSTANTS.colors.abcClass],
                        height: 20,
                        fontSize: '0.75rem',
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">{formatDecimal(item.itr)}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={turnoverStatus}
                      size="small"
                      sx={{
                        bgcolor: `${STYLE_CONSTANTS.colors[turnoverStatus.toLowerCase() as keyof typeof STYLE_CONSTANTS.colors]}22`,
                        color: STYLE_CONSTANTS.colors[turnoverStatus.toLowerCase() as keyof typeof STYLE_CONSTANTS.colors],
                        height: 20,
                        fontSize: '0.75rem',
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">{formatNumber(item.monthlyConsumption)}</TableCell>
                  <TableCell align="right">{formatNumber(item.averageInventory)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default InventoryTable; 