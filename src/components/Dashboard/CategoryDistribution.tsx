import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CategoryMetric } from '../../types/inventory';

interface Props {
  data: CategoryMetric[];
  selectedCategory: string;
}

//  color palette for categories
const categoryColors = ['limegreen', 'purple', 'orange', 'red', 'cyan'];

const CategoryDistribution: React.FC<Props> = ({ data, selectedCategory }) => {
  // Transform data for the chart
  const chartData = data.map((category, index) => ({
    name: category.category,
    value: category.stockValue,
    color: categoryColors[index % categoryColors.length],
    isSelected: selectedCategory === category.category,
    itemCount: category.totalItems,
    consumption: category.consumptionRate
  }));

  const totalStockValue = chartData.reduce((sum, item) => sum + item.value, 0);
  const totalItems = chartData.reduce((sum, item) => sum + item.itemCount, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;
    return (
      <Box
        sx={{
          bgcolor: 'background.paper',
          p: 2,
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 1,
        }}
      >
        <Typography variant="subtitle2" color="text.secondary">
          {data.name}
        </Typography>
        <Typography variant="body1" color="primary.main">
          Stock Value: ${data.value.toLocaleString()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {((data.value / totalStockValue) * 100).toFixed(1)}% of total
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Items: {data.itemCount}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Consumption: {data.consumption.toLocaleString()}
        </Typography>
      </Box>
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        height: '100%',
        background: 'linear-gradient(180deg, rgba(36,37,56,0.5) 0%, rgba(36,37,56,0.8) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Category Distribution
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Distribution of inventory items by category
      </Typography>

      <Box height={300}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={60}
              paddingAngle={2}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.color}
                  opacity={entry.isSelected || !selectedCategory ? 1 : 0.3}
                  stroke="rgba(255,255,255,0.1)"
                />
              ))}
            </Pie>
            <Tooltip content={CustomTooltip} />
          </PieChart>
        </ResponsiveContainer>
      </Box>


      <Box mt={2} textAlign="center">
        <MetricDisplay
          value={`$${totalStockValue.toLocaleString()}`}
          label="Total Stock Value"
          color="primary.main"
        />
        <MetricDisplay
          value={totalItems}
          label="Total Items"
          color="purple"
          topMargin
        />
      </Box>
    </Paper>
  );
};

const MetricDisplay = ({ 
  value, 
  label, 
  color, 
  topMargin = false 
}: { 
  value: string | number;
  label: string;
  color: string;
  topMargin?: boolean;
}) => (
  <>
    <Typography variant="h6" color={color} sx={topMargin ? { mt: 1 } : undefined}>
      {value}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </>
);

export default CategoryDistribution; 