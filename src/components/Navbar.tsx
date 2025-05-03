import { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  Activity, 
  UserPlus, 
  Users, 
  Database,
  Menu as MenuIcon,
  X as CloseIcon
} from 'lucide-react';
import { motion } from 'framer-motion';

interface NavbarProps {
  currentPage: 'dashboard' | 'register' | 'records' | 'query';
  setCurrentPage: (page: 'dashboard' | 'register' | 'records' | 'query') => void;
}

const Navbar = ({ currentPage, setCurrentPage }: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navigateTo = (page: 'dashboard' | 'register' | 'records' | 'query') => {
    setCurrentPage(page);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const navItems = [
    { text: 'Dashboard', icon: <Activity size={20} />, page: 'dashboard' as const },
    { text: 'Register Patient', icon: <UserPlus size={20} />, page: 'register' as const },
    { text: 'Patient Records', icon: <Users size={20} />, page: 'records' as const },
    { text: 'SQL Query', icon: <Database size={20} />, page: 'query' as const }
  ];

  const drawer = (
    <Box sx={{ textAlign: 'center' }} onClick={handleDrawerToggle}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Typography variant="h6" sx={{ my: 2, fontWeight: 600, ml: 2 }}>
          MedTrack
        </Typography>
        <IconButton edge="end" color="inherit" aria-label="close drawer" sx={{ mr: 2 }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              sx={{ 
                textAlign: 'left',
                bgcolor: currentPage === item.page ? 'primary.light' : 'transparent',
                color: currentPage === item.page ? 'white' : 'inherit',
                '&:hover': {
                  bgcolor: currentPage === item.page ? 'primary.main' : 'rgba(25, 118, 210, 0.08)',
                  paddingLeft: '24px'
                }
              }}
              onClick={() => navigateTo(item.page)}
            >
              <ListItemIcon sx={{ 
                color: currentPage === item.page ? 'white' : 'inherit',
                minWidth: '40px'
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: 'white', color: 'text.primary', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h6"
              component="div"
              sx={{
                display: 'flex',
                alignItems: 'center',
                fontWeight: 600,
                color: 'primary.main'
              }}
            >
              <Activity size={24} style={{ marginRight: '8px' }} />
              MedTrack
            </Typography>
          </motion.div>
          
          {isMobile ? (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={handleDrawerToggle}
              sx={{ ml: 'auto' }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex', gap: 2 }}>
              {navItems.map((item) => (
                <Button
                  key={item.text}
                  startIcon={item.icon}
                  color={currentPage === item.page ? 'primary' : 'inherit'}
                  variant={currentPage === item.page ? 'contained' : 'text'}
                  onClick={() => navigateTo(item.page)}
                  sx={{ 
                    borderRadius: '20px', 
                    px: 2,
                    py: 1,
                    mx: 1,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      <Drawer
        anchor="right"
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;