require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

console.log("DATABASE_URL:", process.env.DATABASE_URL);

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const jwtSecret = process.env.JWT_SECRET || 'devsecret';

// ✅ FIXED: Authentication middleware
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Invalid token format' });
  }
  
  try {
    const data = jwt.verify(token, jwtSecret);
    req.user = data;
    console.log('Authenticated user:', data.email || data.name || data.id);
    next();
  } catch (e) {
    console.error('Token verification failed:', e.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ✅ Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Backend is running', 
    timestamp: new Date().toISOString(),
    database: 'Connected'
  });
});

// ✅ Debug endpoint to check table structure
app.get('/api/debug-table', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'reports'
      ORDER BY ordinal_position
    `);
    res.json({ columns: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ FIXED: Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const q = 'INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4) RETURNING id,email,role,name';
    const result = await pool.query(q, [name, email, hashed, role || 'student']);
    
    res.status(201).json({ 
      message: 'User registered successfully',
      user: result.rows[0] 
    });
    
  } catch (err) {
    console.error('Registration error:', err);
    
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    res.status(400).json({ error: err.message });
  }
});

// ✅ FIXED: Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const q = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(q, [email]);
    
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      jwtSecret,
      { expiresIn: '8h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        name: user.name 
      }
    });
    
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ FIXED: Get reports - using correct column names
app.get('/api/reports', auth, async (req, res) => {
  try {
    console.log('Fetching reports for user:', req.user.email);
    
    // Using updated_at instead of created_at
    const result = await pool.query(
      'SELECT * FROM reports ORDER BY updated_at DESC LIMIT 100'
    );
    
    console.log(`Found ${result.rows.length} reports`);
    res.json({ reports: result.rows });
    
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ FIXED: Create report - using correct column names
app.post('/api/reports', auth, async (req, res) => {
  try {
    const body = req.body;
    console.log('Creating report for user:', req.user.email);
    
    // Using actual column names from your database
    const q = `INSERT INTO reports
      (faculty_name, class_name, week_of_reporting, date_of_lecture, 
       coursename, coursecode, lecturer, present, registered, venue, 
       scheduled_time, topic_taught, learning_outcomes, recommendations)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`;
    
    const vals = [
      body.faculty_name || '',
      body.class_name || '',
      body.week_of_reporting || '',
      body.date_of_lecture || '',
      body.coursename || '',
      body.coursecode || '',
      body.lecturer || '',
      body.present || 0,
      body.registered || 0,
      body.venue || '',
      body.scheduled_time || '',
      body.topic_taught || '',
      body.learning_outcomes || '',
      body.recommendations || ''
    ];
    
    const result = await pool.query(q, vals);
    res.json({ report: result.rows[0] });
    
  } catch (err) {
    console.error('Error creating report:', err);
    res.status(400).json({ error: err.message });
  }
});

// ✅ ADDED: Update report route
app.put('/api/reports/:id', auth, async (req, res) => {
  try {
    const reportId = req.params.id;
    const body = req.body;
    
    console.log('Updating report ID:', reportId);
    console.log('Update data:', body);

    // Check if report exists
    const existingReport = await pool.query(
      'SELECT * FROM reports WHERE id = $1',
      [reportId]
    );

    if (existingReport.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Update report with all possible fields
    const q = `UPDATE reports SET
      faculty_name = $1,
      class_name = $2,
      week_of_reporting = $3,
      date_of_lecture = $4,
      coursename = $5,
      coursecode = $6,
      lecturer = $7,
      present = $8,
      registered = $9,
      venue = $10,
      scheduled_time = $11,
      topic_taught = $12,
      learning_outcomes = $13,
      recommendations = $14,
      updated_at = CURRENT_TIMESTAMP
      WHERE id = $15 RETURNING *`;

    const vals = [
      body.faculty_name || '',
      body.class_name || '',
      body.week_of_reporting || '',
      body.date_of_lecture || '',
      body.coursename || '',
      body.coursecode || '',
      body.lecturer || '',
      body.present || 0,
      body.registered || 0,
      body.venue || '',
      body.scheduled_time || '',
      body.topic_taught || '',
      body.learning_outcomes || '',
      body.recommendations || '',
      reportId
    ];

    const result = await pool.query(q, vals);
    
    res.json({ 
      message: 'Report updated successfully', 
      report: result.rows[0] 
    });
    
  } catch (err) {
    console.error('Error updating report:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ ADDED: Delete report route
app.delete('/api/reports/:id', auth, async (req, res) => {
  try {
    const reportId = req.params.id;
    
    console.log('Deleting report ID:', reportId);

    // Check if report exists
    const existingReport = await pool.query(
      'SELECT * FROM reports WHERE id = $1',
      [reportId]
    );

    if (existingReport.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    await pool.query('DELETE FROM reports WHERE id = $1', [reportId]);
    
    res.json({ 
      message: 'Report deleted successfully' 
    });
    
  } catch (err) {
    console.error('Error deleting report:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ FIXED: Create sample report - using correct column names
app.post('/api/sample-report', auth, async (req, res) => {
  try {
    // Using actual column names from your database
    const q = `INSERT INTO reports 
      (coursename, coursecode, lecturer, present, registered, topic_taught) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    
    const sampleReport = await pool.query(q, [
      'Computer Science 101',  // coursename
      'CS101',                 // coursecode
      'Dr. Smith',             // lecturer
      25,                      // present
      30,                      // registered
      'Introduction to Programming' // topic_taught
    ]);
    
    res.json({ 
      message: 'Sample report created successfully', 
      report: sampleReport.rows[0] 
    });
  } catch (err) {
    console.error('Error creating sample report:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Simple fix endpoint
app.get('/api/fix-columns', async (req, res) => {
  try {
    // Try to add missing columns if they don't exist
    await pool.query(`
      DO $$ 
      BEGIN
        ALTER TABLE reports ADD COLUMN IF NOT EXISTS faculty_name TEXT;
        ALTER TABLE reports ADD COLUMN IF NOT EXISTS class_name TEXT;
        ALTER TABLE reports ADD COLUMN IF NOT EXISTS week_of_reporting TEXT;
        ALTER TABLE reports ADD COLUMN IF NOT EXISTS date_of_lecture DATE;
        ALTER TABLE reports ADD COLUMN IF NOT EXISTS venue TEXT;
        ALTER TABLE reports ADD COLUMN IF NOT EXISTS scheduled_time TEXT;
        ALTER TABLE reports ADD COLUMN IF NOT EXISTS topic_taught TEXT;
        ALTER TABLE reports ADD COLUMN IF NOT EXISTS learning_outcomes TEXT;
        ALTER TABLE reports ADD COLUMN IF NOT EXISTS recommendations TEXT;
      EXCEPTION
        WHEN others THEN null;
      END $$;
    `);
    res.json({ message: 'Column fix attempted' });
  } catch (err) {
    res.json({ message: 'Fix may not be needed', error: err.message });
  }
});

// ✅ Update Profile Endpoint
app.put('/api/auth/profile', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    // Check if email already exists (excluding current user)
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, userId]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Update user profile
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, name, email, role',
      [name, email, userId]
    );

    res.json({ 
      message: 'Profile updated successfully',
      user: result.rows[0]
    });

  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ Change Password Endpoint
app.put('/api/auth/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get current user with password
    const userResult = await pool.query(
      'SELECT password FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedNewPassword, userId]
    );

    res.json({ message: 'Password changed successfully' });

  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ Get user profile endpoint
app.get('/api/auth/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ Root endpoint
app.get('/', (req, res) => res.json({ 
  message: 'Backend server is running',
  endpoints: {
    health: '/api/health',
    register: '/api/auth/register',
    login: '/api/auth/login',
    reports: '/api/reports',
    updateReport: '/api/reports/:id (PUT)',
    deleteReport: '/api/reports/:id (DELETE)',
    sampleReport: '/api/sample-report',
    debug: '/api/debug-table',
    fix: '/api/fix-columns',
    profile: '/api/auth/profile'
  }
}));

// Server start
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Available endpoints:`);
  console.log(`   http://localhost:${PORT}/api/health`);
  console.log(`   http://localhost:${PORT}/api/auth/register`);
  console.log(`   http://localhost:${PORT}/api/auth/login`);
  console.log(`   http://localhost:${PORT}/api/reports`);
  console.log(`   http://localhost:${PORT}/api/reports/:id (PUT)`);
  console.log(`   http://localhost:${PORT}/api/reports/:id (DELETE)`);
  console.log(`   http://localhost:${PORT}/api/sample-report`);
  console.log(`   http://localhost:${PORT}/api/debug-table`);
  console.log(`   http://localhost:${PORT}/api/fix-columns`);
  console.log(`   http://localhost:${PORT}/api/auth/profile`);
});