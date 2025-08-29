import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const DEFECT_REASONS = ['절곡', '샤링', '제관', '용접', '가공', '작업자 실수'];

function EditInspectionModal({ open, onClose, inspection, onSave }) {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (inspection) {
            const formattedInspection = { ...inspection, target_date: inspection.target_date ? new Date(inspection.target_date).toISOString().split('T')[0] : '' };
            setFormData(formattedInspection);
        }
    }, [inspection]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => { onSave(formData); };

    if (!inspection) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>기록 수정</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={4}><TextField name="inspected_quantity" label="검사 수량" type="number" value={formData.inspected_quantity || ''} onChange=
{handleChange} fullWidth /></Grid>
                    <Grid item xs={12} sm={4}><TextField name="defective_quantity" label="불량 수량" type="number" value={formData.defective_quantity || ''} onChange=
{handleChange} fullWidth /></Grid>
                    <Grid item xs={12} sm={4}><TextField name="actioned_quantity" label="조치 수량" type="number" value={formData.actioned_quantity || ''} onChange=
{handleChange} fullWidth /></Grid>
                    <Grid item xs={12} sm={12}>
                        <FormControl fullWidth>
                            <InputLabel>불량 원인</InputLabel>
                            <Select
                                name="defect_reason"
                                value={formData.defect_reason || ''}
                                label="불량 원인"
                                onChange={handleChange}
                                displayEmpty
                            >
                                <MenuItem value="" disabled>
                                    <em>선택하시오...</em>
                                </MenuItem>
                                {DEFECT_REASONS.map(reason => (<MenuItem key={reason} value={reason}>{reason}</MenuItem>))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={12}><TextField name="solution" label="해결 방안" value={formData.solution || ''} onChange={handleChange} multiline rows={3}
                        fullWidth /></Grid>
                    <Grid item xs={12} sm={6}><TextField name="target_date" label="조치 목표일" type="date" value={formData.target_date || ''} onChange={handleChange}
                        InputLabelProps={{ shrink: true }} fullWidth /></Grid>
                    <Grid item xs={12} sm={6}><TextField name="progress_percentage" label="진행률 (%)" type="number" value={formData.progress_percentage || ''} onChange
={handleChange} fullWidth /></Grid>
                </Grid>
            </DialogContent>
            <DialogActions><Button onClick={onClose}>취소</Button><Button onClick={handleSave} variant="contained">저장</Button></DialogActions>
        </Dialog>
    );
}

export default EditInspectionModal;