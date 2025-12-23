'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
  Collapse,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  Receipt as ReceiptIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  ExpandLess,
  ExpandMore,
  Add as AddIcon,
  List as ListIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';

const DRAWER_WIDTH = 280;

interface MenuItem {
  title: string;
  path?: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  children?: { title: string; path: string; icon: React.ReactNode }[];
}

const menuItems: MenuItem[] = [
  { title: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  {
    title: 'Loan Applications',
    icon: <DescriptionIcon />,
    children: [
      { title: 'All Applications', path: '/applications', icon: <ListIcon /> },
      { title: 'New Application', path: '/applications/new', icon: <AddIcon /> },
    ],
  },
  {
    title: 'Receipts',
    icon: <ReceiptIcon />,
    children: [
      { title: 'All Receipts', path: '/receipts', icon: <ListIcon /> },
      { title: 'Issue Receipt', path: '/receipts/new', icon: <AddIcon /> },
    ],
  },
  { title: 'Users', path: '/users', icon: <PeopleIcon />, adminOnly: true },
  { title: 'Settings', path: '/settings', icon: <SettingsIcon />, adminOnly: true },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Loan Applications', 'Receipts']);

  const handleNavigation = (path: string) => {
    router.push(path);
    if (isMobile) {
      onClose();
    }
  };

  const handleToggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const isActive = (path: string) => pathname === path;

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.adminOnly && user?.role !== 'ADMIN') return false;
    return true;
  });

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #1a3a6e 0%, #2d5aa8 100%)',
          color: 'white',
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: '-0.5px' }}>
            OR/CR System
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Loan Application Portal
          </Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', py: 2 }}>
        <List sx={{ px: 2 }}>
          {filteredMenuItems.map((item) => (
            <Box key={item.title}>
              {item.children ? (
                <>
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => handleToggleExpand(item.title)}
                      sx={{
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: 'rgba(26, 58, 110, 0.08)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.title}
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                      {expandedItems.includes(item.title) ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                  </ListItem>
                  <Collapse in={expandedItems.includes(item.title)} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.children.map((child) => (
                        <ListItem key={child.path} disablePadding sx={{ mb: 0.5 }}>
                          <ListItemButton
                            onClick={() => handleNavigation(child.path)}
                            sx={{
                              pl: 4,
                              borderRadius: 2,
                              backgroundColor: isActive(child.path)
                                ? 'rgba(26, 58, 110, 0.12)'
                                : 'transparent',
                              borderLeft: isActive(child.path)
                                ? '3px solid #f6c000'
                                : '3px solid transparent',
                              '&:hover': {
                                backgroundColor: 'rgba(26, 58, 110, 0.08)',
                              },
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 36,
                                color: isActive(child.path) ? 'primary.main' : 'text.secondary',
                              }}
                            >
                              {child.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={child.title}
                              primaryTypographyProps={{
                                fontSize: '0.875rem',
                                fontWeight: isActive(child.path) ? 600 : 400,
                                color: isActive(child.path) ? 'primary.main' : 'text.primary',
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                </>
              ) : (
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => item.path && handleNavigation(item.path)}
                    sx={{
                      borderRadius: 2,
                      backgroundColor: item.path && isActive(item.path)
                        ? 'rgba(26, 58, 110, 0.12)'
                        : 'transparent',
                      borderLeft: item.path && isActive(item.path)
                        ? '3px solid #f6c000'
                        : '3px solid transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(26, 58, 110, 0.08)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: item.path && isActive(item.path) ? 'primary.main' : 'text.secondary',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.title}
                      primaryTypographyProps={{
                        fontWeight: item.path && isActive(item.path) ? 600 : 500,
                        color: item.path && isActive(item.path) ? 'primary.main' : 'text.primary',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              )}
            </Box>
          ))}
        </List>
      </Box>

      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
          OR/CR System v1.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
}
