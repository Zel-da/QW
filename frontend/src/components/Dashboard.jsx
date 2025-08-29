import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom'; // Link import
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

    useEffect(() => {
        const fetchInspections = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/inspections`);
                setInspections(response.data);
                setError('');
            } catch (err) {
                setError('데이터를 불러오는 데 실패했습니다.');
                console.error('Fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchInspections();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        window.location.href = '/login'; // 로그아웃 시 로그인 페이지로 이동
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        불량 관리 대시보드
                    </Typography>
                    {/* 버튼을 페이지 이동 링크로 변경 */}
                    <Button color="inherit" startIcon={<AssessmentIcon />} component={RouterLink} to="/statistics">
                        통계 보기
                    </Button>
                    <IconButton color="inherit" onClick={handleLogout} aria-label="logout">
                        <LogoutIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <StatsGrid data={inspections} />
                        </Grid>
                        <Grid item xs={12}>
                            <InspectionForm />
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