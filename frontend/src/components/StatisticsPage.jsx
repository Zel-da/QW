import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    AppBar, Toolbar, IconButton, Container, CircularProgress, Alert,
    Button, Grid, Typography, Paper, Box, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_URL = '/api';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];
const DEFECT_REASONS = ['절곡', '샤링', '제관', '용접', '가공', '작업자 실수'];

// 데이터 집계 함수 (변경 없음)
const aggregateData = (data, key) => {
    const result = {};
    data.forEach(item => {
        const group = item[key];
        if (!result[group]) { result[group] = { name: group, 불량수량: 0 }; }
        result[group].불량수량 += item.defective_quantity || 0;
    });
    return Object.values(result);
};

const aggregateReasonsForProduct = (data, productName) => {
    const result = {};
    DEFECT_REASONS.forEach(r => { result[r] = { name: r, count: 0 }; });
    data.filter(item => item.product_name === productName).forEach(item => {
        if (result[item.defect_reason]) {
            result[item.defect_reason].count += item.defective_quantity || 0;
        }
    });
    return Object.values(result).filter(r => r.count > 0);
};

function StatisticsPage() {
    const navigate = useNavigate();
    const [allData, setAllData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [timeFilter, setTimeFilter] = useState('all');
    const [companyFilter, setCompanyFilter] = useState('');
    const [productFilter, setProductFilter] = useState('');

    const [filteredData, setFilteredData] = useState([]);
    const [productsInCompany, setProductsInCompany] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/inspections`);
                setAllData(response.data);
                setError('');
            } catch (err) {
                setError('데이터를 불러오는 데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const uniqueCompanies = useMemo(() => [...new Set(allData.map(item => item.company_name))], [allData]);
    const uniqueProducts = useMemo(() => [...new Set(allData.map(item => item.product_name))], [allData]);

    useEffect(() => {
        let items = allData || [];
        const now = new Date();
        if (timeFilter === 'day') items = items.filter(item => new Date(item.received_date).toDateString() === now.toDateString());
        else if (timeFilter === 'month') items = items.filter(item => new Date(item.received_date).getMonth() === now.getMonth() && new Date(item.received_date).
getFullYear() === now.getFullYear());
        else if (timeFilter === 'year') items = items.filter(item => new Date(item.received_date).getFullYear() === now.getFullYear());

        if (companyFilter) {
            items = items.filter(item => item.company_name === companyFilter);
            setProductsInCompany([...new Set(items.map(item => item.product_name))]);
        } else {
            setProductsInCompany(uniqueProducts);
        }

        if (productFilter) items = items.filter(item => item.product_name === productFilter);

        setFilteredData(items);

    }, [timeFilter, companyFilter, productFilter, allData, uniqueProducts]);

    const handleCompanyChange = (event) => {
        setCompanyFilter(event.target.value);
        setProductFilter('');
    };

    const companyChartData = aggregateData(filteredData, 'company_name');
    const productChartData = aggregateData(filteredData, 'product_name');
    const productReasonData = productFilter ? aggregateReasonsForProduct(filteredData, productFilter) : [];

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton onClick={() => navigate(-1)} color="inherit" edge="start"><ArrowBackIcon /></IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>통계 분석</Typography>
                </Toolbar>
            </AppBar>
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                {loading ? <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box> :
                 error ? <Alert severity="error">{error}</Alert> :
                (<>
                    <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={4}><FormControl fullWidth><InputLabel>기간</InputLabel><Select value={timeFilter} label="기간" onChange={(e) =>
setTimeFilter(e.target.value)}><MenuItem value="all">전체</MenuItem><MenuItem value="day">일별</MenuItem><MenuItem value="month">월별</MenuItem><MenuItem value="year">
연별</MenuItem></Select></FormControl></Grid>
                            <Grid item xs={12} md={4}><FormControl fullWidth><InputLabel>업체명</InputLabel><Select value={companyFilter} label="업체명" onChange=
{handleCompanyChange}><MenuItem value=""><em>전체 업체</em></MenuItem>{uniqueCompanies.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}</Select></FormControl></
Grid>
                            <Grid item xs={12} md={4}><FormControl fullWidth disabled={!companyFilter}><InputLabel>부품(제품)</InputLabel><Select value={productFilter}
label="부품(제품)" onChange={(e) => setProductFilter(e.target.value)}><MenuItem value=""><em>전체 부품</em></MenuItem>{productsInCompany.map(p => <MenuItem key={p}
value={p}>{p}</MenuItem>)}</Select></FormControl></Grid>
                        </Grid>
                    </Paper>
                    <Grid container spacing={3}>
                        {/* 각 차트가 한 행(12컬럼)을 모두 차지하도록 lg={12}로 변경 */}
                        <Grid item xs={12} lg={12}>
                            <Paper elevation={3} sx={{ p: 2, height: 450 }}><Typography variant="h6" align="center" gutterBottom>__________업체별 불량 수량__________</Typography><
ResponsiveContainer><PieChart><Pie data={companyChartData} dataKey="불량수량" nameKey="name" cx="50%" cy="50%" outerRadius={150} label>{companyChartData.map((entry,
index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></Paper>
                        </Grid>
                        <Grid item xs={12} lg={12}>
                            <Paper elevation={3} sx={{ p: 2, height: 450 }}><Typography variant="h6" align="center" gutterBottom>__________제품별 불량 수량__________</Typography><
ResponsiveContainer><BarChart data={productChartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Legend
/><Bar dataKey="불량수량" fill="#82ca9d" /></BarChart></ResponsiveContainer></Paper>
                        </Grid>
                        {productFilter && productReasonData.length > 0 &&
                            <Grid item xs={12}>
                                <Paper elevation={3} sx={{ p: 2, mt: 2, height: 500 }}><Typography variant="h6" align="center" gutterBottom>{`__________'${productFilter}' 불량
원인 분석__________`}</Typography><ResponsiveContainer><PieChart><Pie data={productReasonData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={150} label>
{productReasonData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip /><Legend /></PieChart></
ResponsiveContainer></Paper>
                            </Grid>
                        }
                    </Grid>
                </>)}
            </Container>
        </Box>
    );
}

export default StatisticsPage;