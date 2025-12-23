'use client';

import { useMemo } from 'react';
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
  Slider,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material';
import {
  AccountBalance as LoanIcon,
  Calculate as CalculateIcon,
} from '@mui/icons-material';
import { useLoanForm } from '../LoanFormContext';
import { LOAN_PURPOSES, LOAN_TERMS } from '@/types';

export default function LoanDetailsStep() {
  const { formData, updateFormData, errors } = useLoanForm();

  const loanCalculation = useMemo(() => {
    const principal = parseFloat(formData.loanAmount) || 0;
    const rate = parseFloat(formData.interestRate) || 0;
    const term = parseInt(formData.loanTerm) || 1;

    const totalInterest = principal * (rate / 100) * (term / 12);
    const totalAmount = principal + totalInterest;
    const monthlyPayment = totalAmount / term;

    return {
      principal,
      totalInterest,
      totalAmount,
      monthlyPayment,
    };
  }, [formData.loanAmount, formData.interestRate, formData.loanTerm]);

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Loan Details
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Specify your loan requirements and preferences.
      </Typography>

      <Paper elevation={0} sx={{ p: 3, mb: 3, backgroundColor: 'primary.main', color: 'white', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <LoanIcon />
          <Typography variant="subtitle1" fontWeight={600}>
            Loan Application
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Configure your loan amount, term, and purpose
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required error={!!errors.loanPurpose}>
            <InputLabel>Loan Purpose</InputLabel>
            <Select
              value={formData.loanPurpose}
              label="Loan Purpose"
              onChange={(e) => updateFormData({ loanPurpose: e.target.value })}
            >
              {LOAN_PURPOSES.map((purpose) => (
                <MenuItem key={purpose} value={purpose}>
                  {purpose}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Loan Amount"
            type="number"
            value={formData.loanAmount}
            onChange={(e) => updateFormData({ loanAmount: e.target.value })}
            error={!!errors.loanAmount}
            helperText={errors.loanAmount || 'Minimum: PHP 10,000'}
            InputProps={{
              startAdornment: <InputAdornment position="start">PHP</InputAdornment>,
              inputProps: { min: 10000, step: 1000 },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required error={!!errors.loanTerm}>
            <InputLabel>Loan Term (Months)</InputLabel>
            <Select
              value={formData.loanTerm}
              label="Loan Term (Months)"
              onChange={(e) => updateFormData({ loanTerm: e.target.value })}
            >
              {LOAN_TERMS.map((term) => (
                <MenuItem key={term} value={term.toString()}>
                  {term} months ({term / 12} {term / 12 === 1 ? 'year' : 'years'})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Box sx={{ px: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Interest Rate: {formData.interestRate}% per annum
            </Typography>
            <Slider
              value={parseFloat(formData.interestRate) || 12}
              onChange={(_, value) => updateFormData({ interestRate: value.toString() })}
              min={6}
              max={24}
              step={0.5}
              marks={[
                { value: 6, label: '6%' },
                { value: 12, label: '12%' },
                { value: 18, label: '18%' },
                { value: 24, label: '24%' },
              ]}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}%`}
            />
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mt: 2,
              backgroundColor: 'grey.100',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CalculateIcon color="primary" />
              <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                Loan Calculation Summary
              </Typography>
            </Box>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={{ border: 'none', py: 1 }}>Principal Amount</TableCell>
                  <TableCell align="right" sx={{ border: 'none', py: 1, fontWeight: 600 }}>
                    PHP {loanCalculation.principal.toLocaleString()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ border: 'none', py: 1 }}>
                    Interest Rate ({formData.interestRate}% p.a.)
                  </TableCell>
                  <TableCell align="right" sx={{ border: 'none', py: 1, fontWeight: 600 }}>
                    PHP {loanCalculation.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ border: 'none', py: 1 }}>Loan Term</TableCell>
                  <TableCell align="right" sx={{ border: 'none', py: 1, fontWeight: 600 }}>
                    {formData.loanTerm || 0} months
                  </TableCell>
                </TableRow>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  <TableCell sx={{ border: 'none', py: 2, color: 'white', fontWeight: 600 }}>
                    Total Amount Payable
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ border: 'none', py: 2, color: 'white', fontWeight: 700, fontSize: '1.25rem' }}
                  >
                    PHP {loanCalculation.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <Box
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: '#f6c000',
                borderRadius: 2,
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" color="primary.dark" fontWeight={600}>
                Estimated Monthly Payment
              </Typography>
              <Typography variant="h4" color="primary.dark" fontWeight={700}>
                PHP {loanCalculation.monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
