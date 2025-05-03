import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import initSqlJs from 'sql.js';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  phoneNumber: string;
  email: string;
  address: string;
  medicalHistory: string;
  createdAt: string;
}

interface QueryResult {
  rows: Record<string, any>[];
  fields: { name: string }[];
}

type DatabaseContextType = {
  isLoading: boolean;
  error: string | null;
  executeQuery: (query: string) => Promise<QueryResult>;
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'age'>) => Promise<string>;
  getAllPatients: () => Promise<Patient[]>;
  getPatientById: (id: string) => Promise<Patient | null>;
};

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birthDateObj = new Date(birthDate);
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }
  
  return age;
};

// Load database from localStorage if it exists
const loadExistingDatabase = (): Uint8Array | null => {
  const savedDb = localStorage.getItem('patientDb');
  if (savedDb) {
    const binaryString = atob(savedDb);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
  return null;
};

// Save database to localStorage
const saveDatabase = (db: any) => {
  const binaryArray = db.export();
  const binaryString = String.fromCharCode.apply(null, Array.from(binaryArray));
  const base64String = btoa(binaryString);
  localStorage.setItem('patientDb', base64String);
};

export const DatabaseProvider = ({ children }: { children: ReactNode }) => {
  const [db, setDb] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDB = async () => {
      try {
        setIsLoading(true);
        
        const SQL = await initSqlJs({
          locateFile: file => `https://sql.js.org/dist/${file}`
        });
        
        let database;
        const existingDb = loadExistingDatabase();
        
        if (existingDb) {
          database = new SQL.Database(existingDb);
        } else {
          database = new SQL.Database();
          // Initialize the patients table
          database.run(`
            CREATE TABLE IF NOT EXISTS patients (
              id TEXT PRIMARY KEY,
              firstName TEXT NOT NULL,
              lastName TEXT NOT NULL,
              dateOfBirth TEXT NOT NULL,
              gender TEXT NOT NULL,
              phoneNumber TEXT,
              email TEXT,
              address TEXT,
              medicalHistory TEXT,
              createdAt TEXT DEFAULT CURRENT_TIMESTAMP
            );
          `);
        }
        
        setDb(database);
        setError(null);
      } catch (err) {
        console.error('Database initialization error:', err);
        setError('Failed to initialize database. Please refresh the page and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeDB();
  }, []);

  const executeQuery = async (query: string): Promise<QueryResult> => {
    if (!db) {
      throw new Error('Database not initialized');
    }
    
    try {
      const result = db.exec(query);
      saveDatabase(db); // Save after each query
      return {
        rows: result[0]?.values.map((row: any[]) => 
          result[0].columns.reduce((obj: any, col: string, i: number) => {
            obj[col] = row[i];
            return obj;
          }, {})
        ) || [],
        fields: result[0]?.columns.map(name => ({ name })) || []
      };
    } catch (err: any) {
      console.error('Query execution error:', err);
      throw new Error(`Query execution failed: ${err.message}`);
    }
  };

  const addPatient = async (patient: Omit<Patient, 'id' | 'createdAt' | 'age'>): Promise<string> => {
    if (!db) {
      throw new Error('Database not initialized');
    }
    
    try {
      const id = crypto.randomUUID();
      const stmt = db.prepare(`
        INSERT INTO patients (
          id, firstName, lastName, dateOfBirth, gender, 
          phoneNumber, email, address, medicalHistory,
          createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'));
      `);
      
      stmt.run([
        id,
        patient.firstName,
        patient.lastName,
        patient.dateOfBirth,
        patient.gender,
        patient.phoneNumber,
        patient.email,
        patient.address,
        patient.medicalHistory
      ]);
      
      stmt.free();
      saveDatabase(db); // Save after adding patient
      return id;
    } catch (err: any) {
      console.error('Error adding patient:', err);
      throw new Error(`Failed to add patient: ${err.message}`);
    }
  };

  const getAllPatients = async (): Promise<Patient[]> => {
    if (!db) {
      throw new Error('Database not initialized');
    }
    
    try {
      const result = db.exec('SELECT * FROM patients ORDER BY createdAt DESC');
      return result[0]?.values.map((row: any[]) => {
        const patient = result[0].columns.reduce((obj: any, col: string, i: number) => {
          obj[col] = row[i];
          return obj;
        }, {});
        // Calculate age from dateOfBirth
        patient.age = calculateAge(patient.dateOfBirth);
        return patient;
      }) || [];
    } catch (err: any) {
      console.error('Error fetching patients:', err);
      throw new Error(`Failed to fetch patients: ${err.message}`);
    }
  };

  const getPatientById = async (id: string): Promise<Patient | null> => {
    if (!db) {
      throw new Error('Database not initialized');
    }
    
    try {
      const stmt = db.prepare('SELECT * FROM patients WHERE id = ?');
      const result = stmt.getAsObject([id]);
      stmt.free();
      if (Object.keys(result).length > 0) {
        const patient = result as Patient;
        patient.age = calculateAge(patient.dateOfBirth);
        return patient;
      }
      return null;
    } catch (err: any) {
      console.error('Error fetching patient by ID:', err);
      throw new Error(`Failed to fetch patient: ${err.message}`);
    }
  };

  const contextValue: DatabaseContextType = {
    isLoading,
    error,
    executeQuery,
    addPatient,
    getAllPatients,
    getPatientById
  };

  return (
    <DatabaseContext.Provider value={contextValue}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};