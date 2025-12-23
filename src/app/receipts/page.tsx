'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Skeleton,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  FilterList as FilterIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import NextLink from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Receipt, ReceiptType } from '@/types';
import { format } from 'date-fns';

const typeOptions = [
  { value: 'ALL', label: 'All Types' },
  { value: 'OFFICIAL_RECEIPT', label: 'Official Receipt (OR)' },
  { value: 'COLLECTION_RECEIPT', label: 'Collection Receipt (CR)' },
];

export default function ReceiptsPage() {
  const router = useRouter();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('ALL');

  const fetchReceipts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
        type,
        search,
      });

      const response = await fetch(`/api/receipts?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReceipts(data.receipts);
        setTotal(data.pagination.total);
      } else {
        setError('Failed to fetch receipts');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [page, rowsPerPage, type]);

  const handleSearch = () => {
    setPage(0);
    fetchReceipts();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getTypeLabel = (type: ReceiptType) => {
    return type === 'OFFICIAL_RECEIPT' ? 'Official Receipt' : 'Collection Receipt';
  };

  const getTypeColor = (type: ReceiptType): 'primary' | 'secondary' => {
    return type === 'OFFICIAL_RECEIPT' ? 'primary' : 'secondary';
  };

  return (
    <DashboardLayout>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 2 }}
        >
          <MuiLink
            component={NextLink}
            href="/dashboard"
            color="inherit"
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Dashboard
          </MuiLink>
          <Typography color="text.primary">Receipts</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Receipts
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage Official Receipts (OR) and Collection Receipts (CR)
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/receipts/new')}
          >
            Issue Receipt
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search by receipt number or payer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={handleKeyPress}
            size="small"
            sx={{ flex: 1, minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Receipt Type</InputLabel>
            <Select
              value={type}
              label="Receipt Type"
              onChange={(e) => {
                setType(e.target.value);
                setPage(0);
              }}
            >
              {typeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            onClick={handleSearch}
            startIcon={<FilterIcon />}
          >
            Filter
          </Button>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchReceipts}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Receipt No.</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Payer Name</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Purpose</TableCell>
                <TableCell>Issued By</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 8 }).map((_, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : receipts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary" gutterBottom>
                      No receipts found
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => router.push('/receipts/new')}
                      sx={{ mt: 1 }}
                    >
                      Issue New Receipt
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                receipts.map((receipt) => (
                  <TableRow key={receipt.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {receipt.receiptNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getTypeLabel(receipt.receiptType)}
                        size="small"
                        color={getTypeColor(receipt.receiptType)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{receipt.payerName}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="primary.main">
                        PHP {Number(receipt.amount).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                        {receipt.purpose}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {receipt.issuedBy.firstName} {receipt.issuedBy.lastName}
                    </TableCell>
                    <TableCell>
                      {format(new Date(receipt.issuedAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View">
                        <IconButton
                          size="small"
                          onClick={() => router.push(`/receipts/${receipt.id}`)}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Print">
                        <IconButton
                          size="small"
                          onClick={() => router.push(`/receipts/${receipt.id}/print`)}
                        >
                          <PrintIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>
    </DashboardLayout>
  );
}
