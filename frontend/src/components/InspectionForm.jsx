import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import { TextField, Button, Box, Typography, Grid, Paper, Alert, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const DEFECT_REASONS = ['절곡', '샤링', '제관', '용접', '가공', '작업자 실수'];

function InspectionForm({ onDataUpdate }) {
    const [formData, setFormData] = useState({
        company_name: '', product_name: '', product_code: '',
        defect_reason: '', solution: '', target_date: '', progress_percentage: 0
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            setCurrentUser(JSON.parse(user));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            setMessage({ type: 'error', text: '사용자 정보가 없습니다. 다시 로그인해주세요.' });
            return;
        }
        setMessage({ type: '', text: '' });
        try {
            // Add required fields that are not in the form to the payload
            const payload = { 
                ...formData, 
                user_id: currentUser.user_id,
                inspected_quantity: 0, // Add default or get from form
                defective_quantity: 0 // Add default or get from form
            };
            const response = await apiClient.post('/inspections', payload);
            if (response.status === 201) {
                setMessage({ type: 'success', text: '성공적으로 등록되었습니다.' });
                onDataUpdate(); // Refresh data in parent component
                setFormData({
                    company_name: '', product_name: '', product_code: '',
                    defect_reason: '', solution: '', target_date: '', progress_percentage: 0
                });
            }
        } catch (err) {
            setMessage({ type: 'error', text: '등록에 실패했습니다. 모든 필수 항목을 입력했는지 확인해주세요.' });
            console.error('Submit error:', err);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                신규 불량 등록
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid xs={12} sm={4}><TextField name="company_name" label="업체명" value={formData.company_name} onChange={handleChange} required fullWidth /></Grid>
                    <Grid xs={12} sm={4}><TextField name="product_name" label="제품명" value={formData.product_name} onChange={handleChange} required fullWidth /></Grid>
                    <Grid xs={12} sm={4}><TextField name="product_code" label="제품 코드" value={formData.product_code} onChange={handleChange} required fullWidth /></Grid>
                    <Grid xs={12} sm={4}><TextField name="product_count" type="number" label="제품 수량" value={formData.product_count} onChange={handleChange} required fullWidth /></Grid>
                    <Grid xs={12} sm={8}>
                        <FormControl fullWidth required>
                            <InputLabel>불량 원인</InputLabel>
                            <Select name="defect_reason" value={formData.defect_reason} label="불량 원인" onChange={handleChange} displayEmpty>
                                <MenuItem value="" disabled><em>선택하시오...</em></MenuItem>
                                {DEFECT_REASONS.map(reason => (<MenuItem key={reason} value={reason}>{reason}</MenuItem>))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid xs={12}><TextField name="solution" label="해결 방안" value={formData.solution} onChange={handleChange} multiline rows={3} fullWidth /></Grid>
                    <Grid xs={12} sm={6}><TextField name="target_date" label="조치 목표일" type="date" value={formData.target_date} onChange={handleChange} InputLabelProps={{ shrink: true }}
                        fullWidth /></Grid>
                    <Grid xs={12} sm={6}><TextField name="progress_percentage" type="number" label="진행률 (%)" value={formData.progress_percentage} inputProps={{ min: 0, max: 100 }} onChange={handleChange} fullWidth /></Grid>
                </Grid>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="submit" variant="contained" startIcon={<AddCircleOutlineIcon />}>
                        등록하기
                    </Button>
                </Box>
                {message.text && <Alert severity={message.type} sx={{ mt: 2 }}>{message.text}</Alert>}
            </Box>
        </Paper>
    );
}

export default InspectionForm;
