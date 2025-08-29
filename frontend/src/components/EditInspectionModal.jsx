import React, { useState, useEffect } from 'react';
import api from '../api'; // Import the centralized api instance
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, FormControl, InputLabel, Select, MenuItem, Box, Alert } from '@mui/material';

const DEFECT_REASONS = ['절곡', '샤링', '제관', '용접', '가공', '작업자 실수'];

function EditInspectionModal({ open, onClose, inspection, onSave }) {
    const [formData, setFormData] = useState({});
    const [error, setError] = useState('');

    useEffect(() => {
        if (inspection) {
            // Format date for the date input field, which expects 'YYYY-MM-DD'
            const formattedInspection = { 
                ...inspection, 
                target_date: inspection.target_date ? new Date(inspection.target_date).toISOString().split('T')[0] : '' 
            };
            setFormData(formattedInspection);
        }
        // Clear error when modal is opened or inspection changes
        setError('');
    }, [inspection, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setError('');
        try {
            // The API expects certain fields to be numbers
            const dataToSubmit = {
                ...formData,
                inspected_quantity: Number(formData.inspected_quantity),
                defective_quantity: Number(formData.defective_quantity),
                actioned_quantity: Number(formData.actioned_quantity),
                progress_percentage: Number(formData.progress_percentage),
            };
            await api.put(`/inspections/${inspection.id}`, dataToSubmit);
            onSave(); // Propagate success up to parent (closes modal, refreshes list)
        } catch (err) {
            console.error('Update error:', err);
            setError(err.response?.data?.message || '수정에 실패했습니다.');
        }
    };

    if (!inspection) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>기록 수정 (ID: {inspection.id})</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}><TextField name="inspected_quantity" label="검사 수량" type="number" value={formData.inspected_quantity || ''} onChange={handleChange} fullWidth /></Grid>
                        <Grid item xs={12} sm={4}><TextField name="defective_quantity" label="불량 수량" type="number" value={formData.defective_quantity || ''} onChange={handleChange} fullWidth /></Grid>
                        <Grid item xs={12} sm={4}><TextField name="actioned_quantity" label="조치 수량" type="number" value={formData.actioned_quantity || ''} onChange={handleChange} fullWidth /></Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>불량 원인</InputLabel>
                                <Select name="defect_reason" value={formData.defect_reason || ''} label="불량 원인" onChange={handleChange}>
                                    {DEFECT_REASONS.map(reason => (<MenuItem key={reason} value={reason}>{reason}</MenuItem>))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}><TextField name="solution" label="해결 방안" value={formData.solution || ''} onChange={handleChange} multiline rows={3} fullWidth /></Grid>
                        <Grid item xs={12} sm={6}><TextField name="target_date" label="조치 목표일" type="date" value={formData.target_date || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth /></Grid>
                        <Grid item xs={12} sm={6}><TextField name="progress_percentage" label="진행률 (%)" type="number" value={formData.progress_percentage || ''} inputProps={{ min: 0, max: 100 }} onChange={handleChange} fullWidth /></Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px' }}>
                <Button onClick={onClose}>취소</Button>
                <Button onClick={handleSave} variant="contained">저장</Button>
            </DialogActions>
        </Dialog>
    );
}

export default EditInspectionModal;