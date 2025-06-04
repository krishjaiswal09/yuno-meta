import React from 'react';
import { Box, Typography, Paper, Stack, Chip } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ConsumptionTrend as ConsumptionData } from '../../types/inventory';

interface Props {
  data: ConsumptionData[];
  filters: {
    category: string;
    abcClass: string;
    itemId: string;
  };
}

const ConsumptionTrend: React.FC<Props> = ({ data, filters }) => {
  // Apply filters to data
  const filteredData = data.filter(item => {
    const categoryMatch = !filters.category || item.category === filters.category;
    const classMatch = !filters.abcClass || item.abcClass === filters.abcClass;
    const itemMatch = !filters.itemId || item.itemId === filters.itemId;
    return categoryMatch && classMatch && itemMatch;
  });

  // Group and aggregate consumption by month
  const monthlyConsumption = filteredData.reduce((acc, record) => {
    if (!acc[record.month]) {
      acc[record.month] = {
        month: record.month,
        totalUsage: 0,
      };
    }
    acc[record.month].totalUsage += record.consumption;
    return acc;
  }, {} as { [key: string]: { month: string; totalUsage: number } });

  const chartData = Object.values(monthlyConsumption);

  // Calculate key metrics
  const totalConsumption = chartData.reduce((sum, item) => sum + item.totalUsage, 0);
  const avgMonthlyConsumption = chartData.length > 0 ? totalConsumption / chartData.length : 0;
  const latestMonthConsumption = chartData[chartData.length - 1]?.totalUsage || 0;
  
  // Calculate trend percentage
  const trend = avgMonthlyConsumption > 0 
    ? ((latestMonthConsumption - avgMonthlyConsumption) / avgMonthlyConsumption) * 100 
    : 0;

  // Custom tooltip component
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
          {data.month}
        </Typography>
        <Typography variant="body1" color="primary.main">
          Usage: {data.totalUsage.toLocaleString()}
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
      {/* Header with trend indicator */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Consumption Trend
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Monthly consumption analysis
          </Typography>
        </Box>
        <TrendChip percentage={trend} />
      </Stack>

      {/* Bar Chart */}
      <Box height={400}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="month"
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: 'rgba(255,255,255,0.5)' }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: 'rgba(255,255,255,0.5)' }}
            />
            <Tooltip content={CustomTooltip} />
            <Bar
              dataKey="totalUsage"
              fill="limegreen"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Summary Metrics */}
      <Stack direction="row" spacing={4} justifyContent="center" mt={2}>
        <MetricBox
          value={totalConsumption.toLocaleString()}
          label="Total Usage"
          color="primary.main"
        />
        <MetricBox
          value={avgMonthlyConsumption.toFixed(0)}
          label="Monthly Average"
          color="purple"
        />
        <MetricBox
          value={latestMonthConsumption.toLocaleString()}
          label="Latest Month"
          color="orange"
        />
      </Stack>
    </Paper>
  );
};

// Helper component for trend indicator
const TrendChip = ({ percentage }: { percentage: number }) => (
  <Chip
    label={`${Math.abs(percentage).toFixed(1)}% ${percentage >= 0 ? 'increase' : 'decrease'}`}
    sx={{
      bgcolor: percentage >= 0 ? 'rgba(0,255,0,0.2)' : 'rgba(255,0,0,0.2)',
      color: percentage >= 0 ? 'limegreen' : 'red',
    }}
  />
);

// Helper component for metric display
const MetricBox = ({ value, label, color }: { value: string; label: string; color: string }) => (
  <Box sx={{ textAlign: 'center' }}>
    <Typography variant="h6" color={color}>
      {value}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

export default ConsumptionTrend; 