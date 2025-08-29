import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Grid, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function DetailRow({ label, value }) {
    return (
        <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>{label}</Typography>
            <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>{value || '미지정'}</Typography>
        </Grid>
    );
}

function InspectionDetailModal({ inspection, open, onClose, onEdit, onDelete }) {
    if (!inspection) return null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>상세 정보</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    {inspection.image_path && (
                        <Grid item xs={12}><Box component="img" sx={{ maxHeight: 400, maxWidth: '100%', mb: 2 }} src={`/uploads/${inspection.image_path}`} alt="Uploaded Image" /></Grid>
                    )}
                    <DetailRow label="업체명" value={inspection.company_name} />
                    <DetailRow label="제품명" value={inspection.product_name} />
                    <DetailRow label="제품코드" value={inspection.product_code} />
                    <DetailRow label="등록자" value={inspection.username} />
                    <DetailRow label="접수일" value={new Date(inspection.received_date).toLocaleDateString()} />
                    <DetailRow label="조치 목표일" value={inspection.target_date ? new Date(inspection.target_date).toLocaleDateString() : '미지정'} />
                    <DetailRow label="검사 수량" value={inspection.inspected_quantity} />
                    <DetailRow label="불량 수량" value={inspection.defective_quantity} />
                    <DetailRow label="조치 수량" value={inspection.actioned_quantity} />
                    <DetailRow label="진행률 (%)" value={`${inspection.progress_percentage}%`} />
                    <Grid item xs={12}><Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>불량 원인</Typography><Typography variant="body1">
                        {inspection.defect_reason || '미지정'}</Typography></Grid>
                    <Grid item xs={12}><Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>해결 방안</Typography><Typography variant="body1">
                        {inspection.solution || '미지정'}</Typography></Grid>
                    {inspection.excel_path && (
                        <Grid item xs={12}><Button component="a" href={`/uploads/${inspection.excel_path}`} download>엑셀 파일 다운로드</Button></Grid>
                    )}
                </Grid>
            </DialogContent>
            <DialogActions>
                <IconButton onClick={() => onEdit(inspection)} color="primary"><EditIcon /></IconButton>
                <IconButton onClick={() => onDelete(inspection.id)} color="error"><DeleteIcon /></IconButton>
                <Box sx={{ flexGrow: 1 }} />
                <Button onClick={onClose}>닫기</Button>
            </DialogActions>
        </Dialog>
    );
}

export default InspectionDetailModal;