'use client';

import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  InputAdornment,
  Paper,
} from '@mui/material';
import {
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useLoanForm } from '../LoanFormContext';
import { EMPLOYMENT_STATUSES } from '@/types';

export default function EmploymentStep() {
  const { formData, updateFormData, errors } = useLoanForm();

  const isEmployed = ['Employed', 'Self-Employed', 'OFW'].includes(formData.employmentStatus);

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Employment & Income Information
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Provide details about your current employment and income sources.
      </Typography>

      <Paper elevation={0} sx={{ p: 3, mb: 3, backgroundColor: 'primary.main', color: 'white', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <WorkIcon />
          <Typography variant="subtitle1" fontWeight={600}>
            Employment Status
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Your current employment details
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required error={!!errors.employmentStatus}>
            <InputLabel>Employment Status</InputLabel>
            <Select
              value={formData.employmentStatus}
              label="Employment Status"
              onChange={(e) => updateFormData({ employmentStatus: e.target.value })}
            >
              {EMPLOYMENT_STATUSES.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {isEmployed && (
          <>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Employer / Business Name"
                value={formData.employerName}
                onChange={(e) => updateFormData({ employerName: e.target.value })}
                error={!!errors.employerName}
                helperText={errors.employerName}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Employer / Business Address"
                value={formData.employerAddress}
                onChange={(e) => updateFormData({ employerAddress: e.target.value })}
                placeholder="Complete address of employer or business"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                required
                label="Position / Designation"
                value={formData.position}
                onChange={(e) => updateFormData({ position: e.target.value })}
                error={!!errors.position}
                helperText={errors.position}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Years Employed"
                type="number"
                value={formData.yearsEmployed}
                onChange={(e) => updateFormData({ yearsEmployed: e.target.value })}
                InputProps={{
                  inputProps: { min: 0 },
                }}
              />
            </Grid>
          </>
        )}

        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3, mt: 2, mb: 2, backgroundColor: 'grey.100', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <MoneyIcon color="primary" />
              <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                Income Details
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Provide your monthly income information
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            required
            label="Monthly Income"
            type="number"
            value={formData.monthlyIncome}
            onChange={(e) => updateFormData({ monthlyIncome: e.target.value })}
            error={!!errors.monthlyIncome}
            helperText={errors.monthlyIncome || 'Gross monthly income'}
            InputProps={{
              startAdornment: <InputAdornment position="start">PHP</InputAdornment>,
              inputProps: { min: 0 },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            label="Other Income"
            type="number"
            value={formData.otherIncome}
            onChange={(e) => updateFormData({ otherIncome: e.target.value })}
            helperText="Additional monthly income (if any)"
            InputProps={{
              startAdornment: <InputAdornment position="start">PHP</InputAdornment>,
              inputProps: { min: 0 },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            label="Source of Other Income"
            value={formData.incomeSource}
            onChange={(e) => updateFormData({ incomeSource: e.target.value })}
            placeholder="e.g., Rental, Business, etc."
            disabled={!formData.otherIncome}
          />
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              p: 2,
              mt: 2,
              backgroundColor: 'info.main',
              color: 'white',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <MoneyIcon />
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                Total Monthly Income
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                PHP{' '}
                {(
                  (parseFloat(formData.monthlyIncome) || 0) +
                  (parseFloat(formData.otherIncome) || 0)
                ).toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
