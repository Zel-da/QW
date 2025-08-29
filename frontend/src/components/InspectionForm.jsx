import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid,
    Alert, FormControl, InputLabel, Select, MenuItem, Box
} from '@mui/material';

const API_URL = '/api';
const DEFECT_REASONS = ['절곡', '샤링', '제관', '용접', '가공', '작업자 실수'];

const initialFormData = {
    company_name: '', product_name: '', product_code: '', inspected_quantity: '',
    defective_quantity: '', actioned_quantity: '', defect_reason: '', solution: '',
    target_date: '', progress_percentage: 0, user_id: 1
};

function InspectionForm({ open, onClose, onAddSuccess }) {
    const [formData, setFormData] = useState(initialFormData);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when modal is closed
    useEffect(() => {
        if (!open) {
            setFormData(initialFormData);
            setMessage({ type: '', text: '' });
        }
    }, [open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setIsSubmitting(true);

        const dataToSubmit = {
            ...formData,
            inspected_quantity: formData.inspected_quantity || null,
            defective_quantity: formData.defective_quantity || null,
            actioned_quantity: formData.actioned_quantity || null,
            progress_percentage: formData.progress_percentage || 0,
            target_date: formData.target_date || null
        };

        try {
            const response = await axios.post(`${API_URL}/inspections`, dataToSubmit);
            if (response.status === 201) {
                if (onAddSuccess) {
                    onAddSuccess();
                }
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || '등록에 실패했습니다. 모든 필수 항목을 입력했는지 확인해주세요.';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>신규 불량 등록</DialogTitle>
            <Box component="form" onSubmit={handleSubmit}>
                <DialogContent>
                    {message.text && <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ type: '', text: '' })}>{message.text}</Alert>}
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={4}><TextField name="company_name" label="업체명" value={formData.company_name} onChange={handleChange} required fullWidth /></Grid>
                        <Grid item xs={12} sm={4}><TextField name="product_name" label="제품명" value={formData.product_name} onChange={handleChange} required fullWidth /></Grid>
                        <Grid item xs={12} sm={4}><TextField name="product_code" label="제품 코드" value={formData.product_code} onChange={handleChange} required fullWidth /></Grid>
                        <Grid item xs={12} sm={4}><TextField name="inspected_quantity" type="number" label="검사 수량" value={formData.inspected_quantity} onChange={handleChange} required fullWidth /></Grid>
                        <Grid item xs={12} sm={4}><TextField name="defective_quantity" type="number" label="불량 수량" value={formData.defective_quantity} onChange={handleChange} required fullWidth /></Grid>
                        <Grid item xs={12} sm={4}><TextField name="actioned_quantity" type="number" label="조치 수량" value={formData.actioned_quantity} onChange={handleChange} fullWidth /></Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel>불량 원인</InputLabel>
                                <Select name="defect_reason" value={formData.defect_reason} label="불량 원인" onChange={handleChange}>
                                    {DEFECT_REASONS.map(reason => (<MenuItem key={reason} value={reason}>{reason}</MenuItem>))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}><TextField name="solution" label="해결 방안" value={formData.solution} onChange={handleChange} multiline rows={3} fullWidth /></Grid>
                        <Grid item xs={12} sm={6}><TextField name="target_date" label="조치 목표일" type="date" value={formData.target_date} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth /></Grid>
                        <Grid item xs={12} sm={6}><TextField name="progress_percentage" type="number" label="진행률 (%)" value={formData.progress_percentage} inputProps={{ min: 0, max: 100 }} onChange={handleChange} fullWidth /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: '16px 24px' }}>
                    <Button onClick={onClose}>취소</Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                        {isSubmitting ? '저장 중...' : '저장'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}

export default InspectionForm;