import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import InspectionList from './InspectionList';
import InspectionForm from './InspectionForm';
import StatsGrid from './StatsGrid';
import { AppBar, Toolbar, Typography, IconButton, Container, Box, Grid, CircularProgress, Alert, Button, Fab } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AddIcon from '@mui/icons-material/Add';

const API_URL = '/api';

function Dashboard() {
    const [inspections, setInspections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false); // State for modal
    const navigate = useNavigate();

    const fetchInspections = useCallback(async () => {
        try {
            // setLoading(true); // Don't show main loader on refresh
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

    const handleAddSuccess = () => {
        fetchInspections();
        setIsFormOpen(false); // Close modal on success
    };

    return (
        <Box sx={{ flexGrow: 1, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
            <AppBar position="static" elevation={0} sx={{ backgroundColor: 'primary.main' }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        외주업체 출장검사 대쉬보드 현황
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
                            <InspectionList allInspections={inspections} onRefresh={fetchInspections} />
                        </Grid>
                    </Grid>
                )}
            </Container>
            <Fab
                color="primary"
                aria-label="add"
                sx={{ position: 'fixed', bottom: 32, right: 32 }}
                onClick={() => setIsFormOpen(true)}
            >
                <AddIcon />
            </Fab>
            <InspectionForm
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onAddSuccess={handleAddSuccess}
            />
        </Box>
    );
}

export default Dashboard;