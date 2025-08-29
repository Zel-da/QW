import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import LoopIcon from '@mui/icons-material/Loop'; // For ongoing cases
import BugReportIcon from '@mui/icons-material/BugReport'; // For total defects
import WarningIcon from '@mui/icons-material/Warning';
import TaskAltIcon from '@mui/icons-material/TaskAlt';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}));

const StatCard = ({ title, value, icon, color }) => (
  <StyledCard elevation={2}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {React.cloneElement(icon, { sx: { fontSize: 28, color: color, mr: 1.5 } })}
        <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
        {value}
      </Typography>
    </CardContent>
  </StyledCard>
);

function StatsGrid({ data }) {
  const ongoingInspections = data.filter(item => item.progress_percentage < 100);
  const totalDefects = data.reduce((sum, item) => sum + (item.defective_quantity || 0), 0);
  const totalActioned = data.reduce((sum, item) => sum + (item.actioned_quantity || 0), 0);
  
  const completionRate = totalDefects > 0 ? ((totalActioned / totalDefects) * 100).toFixed(1) : '100.0';

  const stats = [
    { title: '진행 중인 불량 건수', value: `${ongoingInspections.length} 건`, icon: <LoopIcon />, color: 'info.main' },
    { title: '총 불량 수량', value: `${totalDefects.toLocaleString()} 개`, icon: <BugReportIcon />, color: 'warning.main' },
    { title: '총 미조치 수량', value: `${(totalDefects - totalActioned).toLocaleString()} 개`, icon: <WarningIcon />, color: 'error.main' },
    { title: '조치 완료율', value: `${completionRate} %`, icon: <TaskAltIcon />, color: 'success.main' },
  ];

  return (
    <Grid container spacing={3}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <StatCard title={stat.title} value={stat.value} icon={stat.icon} color={stat.color} />
        </Grid>
      ))}
    </Grid>
  );
}

export default StatsGrid;