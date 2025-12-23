'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Skeleton,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Chip,
} from '@mui/material';
import {
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  Print as PrintIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import NextLink from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Receipt, ReceiptType } from '@/types';
import { format } from 'date-fns';

export default function ReceiptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const response = await fetch(`/api/receipts/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setReceipt(data.receipt);
        } else {
          setError('Receipt not found');
        }
      } catch {
        setError('Failed to load receipt');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchReceipt();
    }
  }, [params.id]);

  const getTypeLabel = (type: ReceiptType) => {
    return type === 'OFFICIAL_RECEIPT' ? 'Official Receipt' : 'Collection Receipt';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width={300} height={40} />
          <Skeleton variant="rectangular" height={400} sx={{ mt: 2, borderRadius: 2 }} />
        </Box>
      </DashboardLayout>
    );
  }

  if (error || !receipt) {
    return (
      <DashboardLayout>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Receipt not found'}
        </Alert>
        <Button startIcon={<BackIcon />} onClick={() => router.push('/receipts')}>
          Back to Receipts
        </Button>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
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
          <MuiLink component={NextLink} href="/receipts" color="inherit" underline="hover">
            Receipts
          </MuiLink>
          <Typography color="text.primary">{receipt.receiptNumber}</Typography>
        </Breadcrumbs>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h4" fontWeight={700}>
                {receipt.receiptNumber}
              </Typography>
              <Chip
                label={getTypeLabel(receipt.receiptType)}
                color={receipt.receiptType === 'OFFICIAL_RECEIPT' ? 'primary' : 'secondary'}
              />
            </Box>
            <Typography variant="body1" color="text.secondary">
              Issued on {format(new Date(receipt.issuedAt), 'MMMM dd, yyyy hh:mm a')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<BackIcon />}
              onClick={() => router.push('/receipts')}
            >
              Back
            </Button>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={() => window.print()}
            >
              Print
            </Button>
          </Box>
        </Box>
      </Box>

      <Paper sx={{ p: 4 }} id="receipt-print">
        <Box
          sx={{
            textAlign: 'center',
            mb: 4,
            pb: 3,
            borderBottom: '2px solid',
            borderColor: 'primary.main',
          }}
        >
          <Typography
            variant="h4"
            fontWeight={700}
            color="primary.main"
            sx={{ letterSpacing: 2 }}
          >
            {receipt.receiptType === 'OFFICIAL_RECEIPT'
              ? 'OFFICIAL RECEIPT'
              : 'COLLECTION RECEIPT'}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
            {receipt.receiptNumber}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Payer Information
            </Typography>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={{ border: 'none', color: 'text.secondary', width: '40%' }}>
                    Name
                  </TableCell>
                  <TableCell sx={{ border: 'none', fontWeight: 600 }}>
                    {receipt.payerName}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ border: 'none', color: 'text.secondary' }}>Address</TableCell>
                  <TableCell sx={{ border: 'none' }}>{receipt.payerAddress || '-'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Payment Details
            </Typography>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={{ border: 'none', color: 'text.secondary', width: '40%' }}>
                    Method
                  </TableCell>
                  <TableCell sx={{ border: 'none', fontWeight: 500 }}>
                    {receipt.paymentMethod}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ border: 'none', color: 'text.secondary' }}>Details</TableCell>
                  <TableCell sx={{ border: 'none' }}>{receipt.paymentDetails || '-'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Purpose
          </Typography>
          <Typography variant="body1">{receipt.purpose}</Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            backgroundColor: 'primary.main',
            color: 'white',
            borderRadius: 2,
            textAlign: 'center',
          }}
        >
          <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
            Amount Received
          </Typography>
          <Typography variant="h3" fontWeight={700}>
            PHP {Number(receipt.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Typography>
        </Paper>

        {receipt.remarks && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Remarks
            </Typography>
            <Typography variant="body2">{receipt.remarks}</Typography>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Issued By
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {receipt.issuedBy.firstName} {receipt.issuedBy.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {receipt.issuedBy.email}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">
              Date & Time
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {format(new Date(receipt.issuedAt), 'MMMM dd, yyyy')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {format(new Date(receipt.issuedAt), 'hh:mm a')}
            </Typography>
          </Box>
        </Box>

        {receipt.loanApplication && (
          <Box
            sx={{
              mt: 3,
              p: 2,
              backgroundColor: 'grey.100',
              borderRadius: 2,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Linked Application
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {receipt.loanApplication.applicationNumber} - {receipt.loanApplication.firstName}{' '}
              {receipt.loanApplication.lastName}
            </Typography>
          </Box>
        )}
      </Paper>
    </DashboardLayout>
  );
}
