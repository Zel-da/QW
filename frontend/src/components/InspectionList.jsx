import React, { useState } from 'react';
import axios from 'axios';
import { Box, IconButton, Tooltip } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import EditInspectionModal from './EditInspectionModal';
import InspectionDetailModal from './InspectionDetailModal';

const API_URL = '/api';

function InspectionList({ allInspections, onRefresh }) {
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedInspection, setSelectedInspection] = useState(null);

    const handleEditOpen = (inspection) => {
        setSelectedInspection(inspection);
        setEditModalOpen(true);
    };

    const handleDetailOpen = (inspection) => {
        setSelectedInspection(inspection);
        setDetailModalOpen(true);
    };

    const handleModalClose = () => {
        setEditModalOpen(false);
        setDetailModalOpen(false);
        setSelectedInspection(null);
    };

    const handleSave = () => {
        handleModalClose();
        onRefresh();
    };
    
    const handleDelete = async (id) => {
        if (window.confirm('정말로 이 항목을 삭제하시겠습니까?')) {
            try {
                await axios.delete(`${API_URL}/inspections/${id}`);
                onRefresh();
            } catch (err) {
                console.error('Delete error:', err);
                alert('삭제에 실패했습니다.');
            }
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'company_name', headerName: '업체명', width: 130 },
        { field: 'product_name', headerName: '제품명', width: 150 },
        { field: 'product_code', headerName: '제품 코드', width: 120 },
        { field: 'inspected_quantity', headerName: '검사 수량', type: 'number', width: 100 },
        { field: 'defective_quantity', headerName: '불량 수량', type: 'number', width: 100 },
        { field: 'actioned_quantity', headerName: '조치 수량', type: 'number', width: 100 },
        { field: 'defect_reason', headerName: '불량 원인', width: 150 },
        { field: 'progress_percentage', headerName: '진행률 (%)', type: 'number', width: 120,
            renderCell: (params) => `${params.value}%`
        },
        { field: 'received_date', headerName: '접수일', type: 'date', width: 120, valueGetter: (value) => value ? new Date(value) : null },
        { field: 'target_date', headerName: '목표일', type: 'date', width: 120, valueGetter: (value) => value ? new Date(value) : null },
        {
            field: 'actions',
            headerName: '관리',
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            width: 150,
            renderCell: (params) => (
                <Box>
                    <Tooltip title="상세보기">
                        <IconButton onClick={() => handleDetailOpen(params.row)} size="small">
                            <VisibilityIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="수정">
                        <IconButton onClick={() => handleEditOpen(params.row)} size="small">
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="삭제">
                        <IconButton onClick={() => handleDelete(params.row.id)} size="small">
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    return (
        <Box sx={{ height: 650, width: '100%' }}>
            <DataGrid
                rows={allInspections}
                columns={columns}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 10 },
                    },
                }}
                pageSizeOptions={[10, 25, 50]}
                checkboxSelection
                disableRowSelectionOnClick
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                    toolbar: {
                      showQuickFilter: true,
                    },
                }}
                sx={{
                    '& .MuiDataGrid-root': {
                        border: 'none',
                    },
                    '& .MuiDataGrid-cell': {
                        borderBottom: '1px solid #e0e0e0',
                    },
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#f5f5f5',
                        borderBottom: '2px solid #e0e0e0',
                    },
                }}
            />
            {selectedInspection && (
                <>
                    <EditInspectionModal
                        inspection={selectedInspection}
                        open={editModalOpen}
                        onClose={handleModalClose}
                        onSave={handleSave}
                    />
                    <InspectionDetailModal
                        inspection={selectedInspection}
                        open={detailModalOpen}
                        onClose={handleModalClose}
                    />
                </>
            )}
        </Box>
    );
}

export default InspectionList;