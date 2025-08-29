import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';

function StatsCard({ title, value, color }) {
    return (
        <Paper elevation={3} sx={{ p: 2, textAlign: 'center', color: 'white', backgroundColor: color }}>
            <Typography variant="h6" component="div">{title}</Typography>
            <Typography variant="h4" component="div">{value}</Typography>
        </Paper>
    );
}

function StatsGrid({ data }) {
    const totalInspected = data.reduce((sum, item) => sum + (item.inspected_quantity || 0), 0);
    const totalDefective = data.reduce((sum, item) => sum + (item.defective_quantity || 0), 0);
    const totalActioned = data.reduce((sum, item) => sum + (item.actioned_quantity || 0), 0);
    const defectRate = totalInspected > 0 ? ((totalDefective / totalInspected) * 100).toFixed(2) + '%' : '0%';

    return (
        <Box sx={{ mb: 4 }}>
            <Grid container spacing={3}>
                <Grid xs={12} sm={6} md={3}>
                    <StatsCard title="총 검사 수량" value={totalInspected} color="#1976d2" />
                </Grid>
                <Grid xs={12} sm={6} md={3}>
                    <StatsCard title="총 불량 수량" value={totalDefective} color="#d32f2f" />
                </Grid>
                <Grid xs={12} sm={6} md={3}>
                    <StatsCard title="총 조치 수량" value={totalActioned} color="#388e3c" />
                </Grid>
                <Grid xs={12} sm={6} md={3}>
                    <StatsCard title="불량률" value={defectRate} color="#f57c00" />
                </Grid>
            </Grid>
        </Box>
    );
}

export default StatsGrid;