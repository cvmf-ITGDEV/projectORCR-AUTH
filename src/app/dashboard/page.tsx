'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DashboardStats, STATUS_COLORS, ApplicationStatus } from '@/types';
import { format } from 'date-fns';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
        border: `1px solid ${color}30`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 24px ${color}20`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="text.secondary" variant="body2" fontWeight={500}>
              {title}
            </Typography>
            <Typography variant="h3" fontWeight={700} sx={{ my: 1, color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: `${color}20`,
              color,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          setStats({
            totalApplications: 0,
            draftApplications: 0,
            submittedApplications: 0,
            underReviewApplications: 0,
            approvedApplications: 0,
            rejectedApplications: 0,
            totalReceipts: 0,
            totalReceiptAmount: 0,
            recentApplications: [],
            recentReceipts: [],
          });
        }
      } catch {
        setError('Failed to load dashboard data');
        setStats({
          totalApplications: 0,
          draftApplications: 0,
          submittedApplications: 0,
          underReviewApplications: 0,
          approvedApplications: 0,
          rejectedApplications: 0,
          totalReceipts: 0,
          totalReceiptAmount: 0,
          recentApplications: [],
          recentReceipts: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getStatusLabel = (status: ApplicationStatus) => {
    const labels: Record<ApplicationStatus, string> = {
      DRAFT: 'Draft',
      SUBMITTED: 'Submitted',
      UNDER_REVIEW: 'Under Review',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
    };
    return labels[status];
  };

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back! Here&apos;s an overview of your loan applications and receipts.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/applications/new')}
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            New Application
          </Button>
        </Box>

        {error && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} lg={3}>
            {loading ? (
              <Skeleton variant="rounded" height={140} />
            ) : (
              <StatCard
                title="Total Applications"
                value={stats?.totalApplications || 0}
                icon={<DescriptionIcon />}
                color="#1a3a6e"
                subtitle="All time"
              />
            )}
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            {loading ? (
              <Skeleton variant="rounded" height={140} />
            ) : (
              <StatCard
                title="Pending Review"
                value={(stats?.submittedApplications || 0) + (stats?.underReviewApplications || 0)}
                icon={<PendingIcon />}
                color="#f59e0b"
                subtitle="Awaiting action"
              />
            )}
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            {loading ? (
              <Skeleton variant="rounded" height={140} />
            ) : (
              <StatCard
                title="Approved"
                value={stats?.approvedApplications || 0}
                icon={<CheckCircleIcon />}
                color="#22c55e"
                subtitle="This month"
              />
            )}
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            {loading ? (
              <Skeleton variant="rounded" height={140} />
            ) : (
              <StatCard
                title="Total Receipts"
                value={stats?.totalReceipts || 0}
                icon={<ReceiptIcon />}
                color="#3b82f6"
                subtitle={`PHP ${(stats?.totalReceiptAmount || 0).toLocaleString()}`}
              />
            )}
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Recent Applications
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => router.push('/applications')}
                    sx={{ textTransform: 'none' }}
                  >
                    View All
                  </Button>
                </Box>
                {loading ? (
                  <Box>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} variant="rounded" height={48} sx={{ mb: 1 }} />
                    ))}
                  </Box>
                ) : stats?.recentApplications && stats.recentApplications.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Application No.</TableCell>
                          <TableCell>Applicant</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stats.recentApplications.map((app) => (
                          <TableRow
                            key={app.id}
                            hover
                            sx={{ cursor: 'pointer' }}
                            onClick={() => router.push(`/applications/${app.id}`)}
                          >
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {app.applicationNumber}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {app.firstName} {app.lastName}
                            </TableCell>
                            <TableCell>
                              PHP {Number(app.loanAmount).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={getStatusLabel(app.status)}
                                size="small"
                                color={STATUS_COLORS[app.status]}
                              />
                            </TableCell>
                            <TableCell>
                              {format(new Date(app.createdAt), 'MMM dd, yyyy')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <DescriptionIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography color="text.secondary">
                      No applications yet. Create your first loan application.
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      sx={{ mt: 2 }}
                      onClick={() => router.push('/applications/new')}
                    >
                      New Application
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Application Status
                  </Typography>
                  <TrendingUpIcon color="primary" />
                </Box>
                {loading ? (
                  <Box>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} variant="rounded" height={36} sx={{ mb: 1.5 }} />
                    ))}
                  </Box>
                ) : (
                  <Box>
                    {[
                      { label: 'Draft', value: stats?.draftApplications || 0, color: '#6b7280' },
                      { label: 'Submitted', value: stats?.submittedApplications || 0, color: '#3b82f6' },
                      { label: 'Under Review', value: stats?.underReviewApplications || 0, color: '#f59e0b' },
                      { label: 'Approved', value: stats?.approvedApplications || 0, color: '#22c55e' },
                      { label: 'Rejected', value: stats?.rejectedApplications || 0, color: '#ef4444' },
                    ].map((item) => (
                      <Box
                        key={item.label}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          py: 1.5,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          '&:last-child': { borderBottom: 'none' },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              backgroundColor: item.color,
                            }}
                          />
                          <Typography variant="body2">{item.label}</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={600}>
                          {item.value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
}
