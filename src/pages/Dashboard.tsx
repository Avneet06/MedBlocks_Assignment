import { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import { Users, UserPlus, Activity, Database } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';

interface DashboardStats {
  totalPatients: number;
  recentRegistrations: number;
  malePatients: number;
  femalePatients: number;
}

const Dashboard = () => {
  const { isLoading, executeQuery } = useDatabase();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    recentRegistrations: 0,
    malePatients: 0,
    femalePatients: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (isLoading) return;
      
      try {
        setLoadingStats(true);
        
        // Get total patient count
        const totalResult = await executeQuery('SELECT COUNT(*) as count FROM patients');
        const totalPatients = parseInt(totalResult.rows[0].count) || 0;
        
        // Get recent registrations (last 7 days) - Fixed SQLite datetime syntax
        const recentResult = await executeQuery(`
          SELECT COUNT(*) as count FROM patients 
          WHERE createdAt >= DATETIME('now', '-7 days')
        `);
        const recentRegistrations = parseInt(recentResult.rows[0].count) || 0;
        
        // Get gender statistics
        const maleResult = await executeQuery(`
          SELECT COUNT(*) as count FROM patients WHERE gender = 'Male'
        `);
        const malePatients = parseInt(maleResult.rows[0].count) || 0;
        
        const femaleResult = await executeQuery(`
          SELECT COUNT(*) as count FROM patients WHERE gender = 'Female'
        `);
        const femalePatients = parseInt(femaleResult.rows[0].count) || 0;
        
        setStats({
          totalPatients,
          recentRegistrations,
          malePatients,
          femalePatients
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [isLoading, executeQuery]);

  const statsCards = [
    { title: 'Total Patients', value: stats.totalPatients, icon: Users, color: '#1976d2' },
    { title: 'New This Week', value: stats.recentRegistrations, icon: UserPlus, color: '#00b894' },
    { title: 'Male Patients', value: stats.malePatients, icon: Activity, color: '#0984e3' },
    { title: 'Female Patients', value: stats.femalePatients, icon: Database, color: '#e84393' }
  ];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="600">
        Patient Registration Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
        Welcome to MedTrack, your patient management system. View statistics, register new patients, and manage records.
      </Typography>

      <Grid container spacing={3}>
        {statsCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card 
                sx={{ 
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <CardContent>
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 16, 
                    right: 16,
                    color: card.color,
                    opacity: 0.8
                  }}>
                    <card.icon size={24} />
                  </Box>
                  <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                    {card.title}
                  </Typography>
                  {loadingStats ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Typography variant="h3" component="div" fontWeight="600" sx={{ color: card.color }}>
                      {card.value}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Getting Started
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              style={{ height: '100%' }}
            >
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    <UserPlus size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Register Patient
                  </Typography>
                  <Typography variant="body2">
                    Add new patients to the system by completing the registration form with their personal and medical information.
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              style={{ height: '100%' }}
            >
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    <Users size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    View Records
                  </Typography>
                  <Typography variant="body2">
                    Browse through patient records, view their details, and manage their information efficiently.
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              style={{ height: '100%' }}
            >
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    <Database size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Run SQL Queries
                  </Typography>
                  <Typography variant="body2">
                    Perform custom SQL queries to analyze patient data and generate reports based on specific criteria.
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;