import { useState } from 'react';
import { Box, Container } from '@mui/material';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import Records from './pages/Records';
import Query from './pages/Query';
import { motion } from 'framer-motion';

function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'register' | 'records' | 'query'>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'register':
        return <Register />;
      case 'records':
        return <Records />;
      case 'query':
        return <Query />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          key={currentPage}
        >
          {renderPage()}
        </motion.div>
      </Container>
    </Box>
  );
}

export default App;