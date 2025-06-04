import React from 'react';
import {
  Paper,
  Stack,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

export interface FilterState {
  itemName: string;
  category: string;
  abcClass: string;
  itemId: string;
  dateRange: [Date | null, Date | null];
}

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  categories: string[];
  itemOptions: Array<{ id: string; name: string }>;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  categories,
  itemOptions,
}) => {
  const handleChange = <K extends keyof FilterState>(field: K, value: FilterState[K]) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        background: 'linear-gradient(180deg, rgba(36,37,56,0.5) 0%, rgba(36,37,56,0.8) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{
          '& .MuiFormControl-root': {
            minWidth: { xs: '100%', md: '200px' },
          },
        }}
      >
        <TextField
          label="Search by Item Name"
          value={filters.itemName}
          onChange={(e) => handleChange('itemName', e.target.value)}
          size="small"
        />

        <FormControl size="small">
          <InputLabel>Category</InputLabel>
          <Select
            value={filters.category}
            label="Category"
            onChange={(e) => handleChange('category', e.target.value)}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel>ABC Class</InputLabel>
          <Select
            value={filters.abcClass}
            label="ABC Class"
            onChange={(e) => handleChange('abcClass', e.target.value)}
          >
            <MenuItem value="">All Classes</MenuItem>
            <MenuItem value="A">Class A</MenuItem>
            <MenuItem value="B">Class B</MenuItem>
            <MenuItem value="C">Class C</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel>Item ID</InputLabel>
          <Select
            value={filters.itemId}
            label="Item ID"
            onChange={(e) => handleChange('itemId', e.target.value)}
          >
            <MenuItem value="">All Items</MenuItem>
            {itemOptions.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.name} ({item.id})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ flex: { xs: 'none', md: 1 } }}
          >
            <DatePicker
              label="Start Date"
              value={filters.dateRange[0]}
              onChange={(date) => handleChange('dateRange', [date, filters.dateRange[1]])}
              slotProps={{ textField: { size: 'small' } }}
            />
            <DatePicker
              label="End Date"
              value={filters.dateRange[1]}
              onChange={(date) => handleChange('dateRange', [filters.dateRange[0], date])}
              slotProps={{ textField: { size: 'small' } }}
            />
          </Stack>
        </LocalizationProvider>
      </Stack>
    </Paper>
  );
};

export default FilterPanel; 