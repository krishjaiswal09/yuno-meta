import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { useInventoryData } from '../../services/inventoryService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StockMetrics: React.FC = () => {
  const { stockMetrics } = useInventoryData();

  return (
    <Card sx={{ height: '100%', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Stock Metrics
        </Typography>
        <Box sx={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={stockMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StockMetrics; 