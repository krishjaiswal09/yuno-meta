import React from 'react';
import { Box, Typography, Paper, Stack, Chip } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { MSLTrend } from '../../types/inventory';

interface Props {
  data: MSLTrend[];
  itemId: string;
  itemName: string;
}

type StockStatus = 'below' | 'optimal' | 'excess';

const colors: Record<StockStatus, string> = {
  below: 'red',
  optimal: 'limegreen',
  excess: 'purple'
};

// function to see stock status
const getStockStatus = (currentStock: number, targetMSL: number): StockStatus => {
  const ratio = currentStock / targetMSL;
  if (ratio < 0.9) return 'below';
  if (ratio > 1.5) return 'excess';
  return 'optimal';
};

const MSLTrendAnalysis: React.FC<Props> = ({ data, itemId, itemName }) => {
  const enrichedData = data.map(point => ({
    ...point,
    status: getStockStatus(point.stock, point.msl)
  }));

  const currentStatus = enrichedData[enrichedData.length - 1]?.status || 'optimal';
  const daysBelow = enrichedData.filter(d => d.status === 'below').length;
  const daysExcess = enrichedData.filter(d => d.status === 'excess').length;
  const mslCompliance = enrichedData.length > 0 
    ? ((enrichedData.length - daysBelow) / enrichedData.length) * 100 
    : 100;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'below': return <ErrorIcon />;
      case 'excess': return <WarningIcon />;
      default: return <CheckCircleIcon />;
    }
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
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h6" gutterBottom>MSL Trend Analysis</Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {itemName} ({itemId})
          </Typography>
        </Box>

        <Chip
          icon={getStatusIcon(currentStatus)}
          label={`${currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)} Stock`}
          sx={{
            bgcolor: `${colors[currentStatus]}22`,
            color: colors[currentStatus],
            '& .MuiChip-icon': { color: 'inherit' },
          }}
        />
      </Stack>

      <Box height={300}>
        <ResponsiveContainer>
          <LineChart 
            data={enrichedData} 
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="date"
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: 'rgba(255,255,255,0.5)' }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: 'rgba(255,255,255,0.5)' }}
            />
            
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;

                const data = payload[0].payload as { date: string; stock: number; msl: number; status: StockStatus };
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
                      {data.date}
                    </Typography>
                    <Typography variant="body1" color="primary.main">
                      Stock: {data.stock.toLocaleString()}
                    </Typography>
                    <Typography variant="body1" color="purple">
                      MSL: {data.msl.toLocaleString()}
                    </Typography>
                    <Chip
                      size="small"
                      label={data.status}
                      sx={{
                        mt: 1,
                        bgcolor: `${colors[data.status]}22`,
                        color: colors[data.status],
                      }}
                    />
                  </Box>
                );
              }}
            />

            <ReferenceLine
              y={enrichedData[0]?.msl}
              stroke="purple"
              strokeDasharray="3 3"
              label={{
                value: 'MSL',
                fill: 'purple',
                position: 'right',
              }}
            />


            <Line
              type="monotone"
              dataKey="stock"
              stroke="limegreen"
              strokeWidth={2}
              dot={{ fill: 'limegreen', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: 'limegreen' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>


      <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
        <MetricBox
          value={daysBelow}
          label="Days Below MSL"
          color={colors.below}
        />
        <MetricBox
          value={`${mslCompliance.toFixed(1)}%`}
          label="MSL Compliance"
          color={colors.optimal}
        />
        <MetricBox
          value={daysExcess}
          label="Days in Excess"
          color={colors.excess}
        />
      </Stack>
    </Paper>
  );
};

const MetricBox = ({ value, label, color }: { value: string | number, label: string, color: string }) => (
  <Box sx={{ textAlign: 'center' }}>
    <Typography variant="h6" color={color}>
      {value}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

export default MSLTrendAnalysis; 