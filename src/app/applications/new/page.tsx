'use client';

import { Box, Typography, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { Home as HomeIcon, NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import NextLink from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoanFormWizard from '@/components/loan/LoanFormWizard';

export default function NewApplicationPage() {
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
          <MuiLink
            component={NextLink}
            href="/applications"
            color="inherit"
            underline="hover"
          >
            Applications
          </MuiLink>
          <Typography color="text.primary">New Application</Typography>
        </Breadcrumbs>

        <Typography variant="h4" fontWeight={700} gutterBottom>
          New Loan Application
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Complete all steps to submit your loan application.
        </Typography>
      </Box>

      <LoanFormWizard />
    </DashboardLayout>
  );
}
