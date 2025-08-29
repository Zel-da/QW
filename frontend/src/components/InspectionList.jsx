import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box,
    FormControl, InputLabel, Select, MenuItem, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import InspectionDetailModal from './InspectionDetailModal';
import EditInspectionModal from './EditInspectionModal';

const API_URL = '/api';

function InspectionList({ allInspections = [] }) {
    const [filteredInspections, setFilteredInspections] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedUser, setSelectedUser] = useState('');

    const [detailOpen, setDetailOpen] = useState(false);
    const [editingOpen, setEditingOpen] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [selectedInspection, setSelectedInspection] = useState(null);

    useEffect(() => {
        const fetchFilterData = async () => {
            try {
                const [companiesRes, usersRes] = await Promise.all([axios.get(`${API_URL}/companies`), axios.get(`${API_URL}/users`)]);
                setCompanies(companiesRes.data);
                setUsers(usersRes.data);
            } catch (err) { console.error("Failed to fetch filter data", err); }
        };
        fetchFilterData();
    }, []);

    useEffect(() => {
        let items = allInspections || [];
        if (selectedCompany) items = items.filter(item => item.company_name === selectedCompany);
        if (selectedUser) items = items.filter(item => item.username === selectedUser);
        setFilteredInspections(items);
    }, [selectedCompany, selectedUser, allInspections]);

    const handleRowClick = (inspection) => {
        setSelectedInspection(inspection);
        setDetailOpen(true);
    };

    const handleOpenEditModal = (inspection) => {
        setDetailOpen(false);
        setSelectedInspection(inspection);
        setEditingOpen(true);
    };

    const handleSaveInspection = async (updatedInspection) => {
        try {
            await axios.put(`${API_URL}/inspections/${updatedInspection.id}`, updatedInspection);
            setEditingOpen(false);
            window.location.reload();
        } catch (err) { alert("수정에 실패했습니다."); }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`${API_URL}/inspections/${deletingId}`);
            setDeletingId(null);
            window.location.reload();
        } catch (err) { alert("삭제에 실패했습니다."); }
    };

    return (
        <>
            <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
                <Typography variant="h6" gutterBottom>불량 기록 이력</Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    <FormControl sx={{ minWidth: 200 }}><InputLabel>업체별 보기</InputLabel><Select value={selectedCompany} label="업체별 보기" onChange={(e) =>
setSelectedCompany(e.target.value)}><MenuItem value=""><em>전체</em></MenuItem>{companies.map(c => <MenuItem key={c.id} value={c.company_name}>{c.company_name}</
MenuItem>)}</Select></FormControl>
                    <FormControl sx={{ minWidth: 200 }}><InputLabel>등록자별 보기</InputLabel><Select value={selectedUser} label="등록자별 보기" onChange={(e) =>
setSelectedUser(e.target.value)}><MenuItem value=""><em>전체</em></MenuItem>{users.map(u => <MenuItem key={u.id} value={u.username}>{u.username}</MenuItem>)}</Select>
</FormControl>
                    <Button variant="outlined" onClick={() => { setSelectedCompany(''); setSelectedUser(''); }}>필터 초기화</Button>
                </Box>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>업체명</TableCell>
                                <TableCell>제품명</TableCell>
                                <TableCell>제품코드</TableCell>
                                <TableCell>검사 수량</TableCell>
                                <TableCell>불량 수량</TableCell>
                                <TableCell>조치 수량</TableCell>
                                <TableCell>진행률 (%)</TableCell>
                                <TableCell>접수일</TableCell>
                                <TableCell>등록자</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredInspections.map((item) => (
                                <TableRow key={item.id} hover sx={{ cursor: 'pointer' }} onClick={() => handleRowClick(item)}>
                                    <TableCell>{item.company_name}</TableCell>
                                    <TableCell>{item.product_name}</TableCell>
                                    <TableCell>{item.product_code}</TableCell>
                                    <TableCell>{item.inspected_quantity}</TableCell>
                                    <TableCell>{item.defective_quantity}</TableCell>
                                    <TableCell>{item.actioned_quantity}</TableCell>
                                    <TableCell>{item.progress_percentage}</TableCell>
                                    <TableCell>{new Date(item.received_date).toLocaleDateString()}</TableCell>
                                    <TableCell>{item.username}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <InspectionDetailModal
                inspection={selectedInspection}
                open={detailOpen}
                onClose={() => setDetailOpen(false)}
                onEdit={handleOpenEditModal}
                onDelete={(id) => { setDetailOpen(false); setDeletingId(id); }}
            />
            <EditInspectionModal open={editingOpen} onClose={() => setEditingOpen(false)} inspection={selectedInspection} onSave={handleSaveInspection} />
            <Dialog open={!!deletingId} onClose={() => setDeletingId(null)}><DialogTitle>삭제 확인</DialogTitle><DialogContent><DialogContentText>정말로 이 항목을
삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</DialogContentText></DialogContent><DialogActions><Button onClick={() => setDeletingId(null)}>취소</Button><Button
onClick={handleDelete} color="error">삭제</Button></DialogActions></Dialog>
        </>
    );
}

export default InspectionList;