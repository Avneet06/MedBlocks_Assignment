import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TablePagination,
  CircularProgress,
  Alert,
  Tooltip,
  IconButton,
  Chip
} from '@mui/material';
import { motion } from 'framer-motion';
import { Database, Play, Copy, Info } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';

interface QueryResult {
  rows: Record<string, any>[];
  fields: { name: string }[];
}

const exampleQueries = [
  {
    title: 'All Patients',
    query: 'SELECT * FROM patients ORDER BY createdAt DESC'
  },
  {
    title: 'Male Patients',
    query: "SELECT id, firstName, lastName, dateOfBirth, email FROM patients WHERE gender = 'Male'"
  },
  {
    title: 'Female Patients',
    query: "SELECT id, firstName, lastName, dateOfBirth, email FROM patients WHERE gender = 'Female'"
  },
  {
    title: 'Patients by Age',
    query: "SELECT firstName, lastName, dateOfBirth, EXTRACT(YEAR FROM AGE(CURRENT_DATE, dateOfBirth::date)) as age FROM patients ORDER BY age DESC"
  }
];

const Query = () => {
  const { isLoading, executeQuery } = useDatabase();
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM patients LIMIT 10');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showTip, setShowTip] = useState(false);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSqlQuery(event.target.value);
  };

  const runQuery = async () => {
    if (!sqlQuery.trim()) {
      setError('Please enter a SQL query');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setQueryResult(null);
      
      const result = await executeQuery(sqlQuery);
      setQueryResult(result);
    } catch (err: any) {
      setError(err.message || 'An error occurred while executing the query');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const useExampleQuery = (query: string) => {
    setSqlQuery(query);
  };

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
        <Database size={28} style={{ verticalAlign: 'middle', marginRight: '12px' }} />
        SQL Query Interface
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
        Run custom SQL queries to analyze and extract patient data. Use the example queries to get started.
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Example Queries
          <Tooltip title="Click on a query to use it">
            <IconButton size="small" sx={{ ml: 1 }} onClick={() => setShowTip(!showTip)}>
              <Info size={16} />
            </IconButton>
          </Tooltip>
        </Typography>
        
        {showTip && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Click any example query to populate the query editor. Then click "Run Query" to execute it.
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          {exampleQueries.map((example, index) => (
            <Chip
              key={index}
              label={example.title}
              onClick={() => useExampleQuery(example.query)}
              color="primary"
              variant="outlined"
              clickable
              sx={{ 
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  transform: 'translateY(-2px)'
                }
              }}
            />
          ))}
        </Box>
      </Box>

      <Paper 
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        elevation={2} 
        sx={{ mb: 4, p: 3 }}
      >
        <Box sx={{ display: 'flex', mb: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={sqlQuery}
            onChange={handleQueryChange}
            placeholder="Enter your SQL query here..."
            InputProps={{
              sx: { fontFamily: 'monospace' }
            }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setSqlQuery('')}
            disabled={loading || !sqlQuery}
          >
            Clear
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={runQuery}
            disabled={loading || !sqlQuery}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Play size={20} />}
          >
            {loading ? 'Running...' : 'Run Query'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {queryResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">
                Results: {queryResult.rows.length} {queryResult.rows.length === 1 ? 'row' : 'rows'}
              </Typography>
              
              {queryResult.rows.length > 0 && (
                <Tooltip title="Copy as JSON">
                  <IconButton 
                    size="small" 
                    onClick={() => copyToClipboard(JSON.stringify(queryResult.rows, null, 2))}
                  >
                    <Copy size={16} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {queryResult.rows.length > 0 ? (
              <>
                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table stickyHeader aria-label="query results">
                    <TableHead>
                      <TableRow>
                        {queryResult.fields.map((field, index) => (
                          <TableCell key={index} sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                            {field.name}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {queryResult.rows
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row, rowIndex) => (
                          <TableRow key={rowIndex}>
                            {queryResult.fields.map((field, cellIndex) => (
                              <TableCell key={cellIndex}>
                                {formatCellValue(row[field.name])}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={queryResult.rows.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            ) : (
              <Alert severity="info">Query executed successfully, but no data returned</Alert>
            )}
          </motion.div>
        )}
      </Paper>
    </Box>
  );
};

// Helper function to format cell values
const formatCellValue = (value: any): string => {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  
  if (value instanceof Date) {
    return value.toLocaleString();
  }
  
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  
  return String(value);
};

export default Query;