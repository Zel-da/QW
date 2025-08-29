import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import InspectionList from './InspectionList';
import InspectionForm from './InspectionForm';
import StatsGrid from './StatsGrid';
import { AppBar, Toolbar, Typography, IconButton, Container, Box, Grid, CircularProgress, Alert, Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AssessmentIcon from '@mui/icons-material/Assessment';

const API_URL = '/api';

function Dashboard() {
    const [inspections, setInspections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchInspections = useCallback(async () => {
        // When refreshing, we don't want to show the main loader, just update in background
        // setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/inspections`);
            setInspections(response.data);
            setError('');
        } catch (err) {
            setError('데이터를 불러오는 데 실패했습니다.');
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInspections();
    }, [fetchInspections]);

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        navigate('/login');
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        불량 관리 대시보드
                    </Typography>
                    <Button color="inherit" startIcon={<AssessmentIcon />} component={RouterLink} to="/statistics">
                        통계 보기
                    </Button>
                    <IconButton color="inherit" onClick={handleLogout} aria-label="logout">
                        <LogoutIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                {loading && inspections.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                ) : (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <StatsGrid data={inspections} />
                        </Grid>
                        <Grid item xs={12}>
                            <InspectionForm onAddSuccess={fetchInspections} />
                        </Grid>
                        <Grid item xs={12}>
                            <InspectionList allInspections={inspections} />
                        </Grid>
                    </Grid>
                )}
            </Container>
        </Box>
    );
}

export default Dashboard;