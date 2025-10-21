require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// 🌐 CORS CONFIGURATION
// ============================================================
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://reporting-wb3w.onrender.com' // your deployed frontend
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// ============================================================
// 🗄️ DATABASE CONNECTION
// ============================================================
console.log("DATABASE_URL:", process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const jwtSecret = process.env.JWT_SECRET || 'devsecret';

// ============================================================
// 🔐 AUTH MIDDLEWARE
// ============================================================
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing authorization token' });

  const token = authHeader.replace('Bearer ', '');
  try {
    const data = jwt.verify(token, jwtSecret);
    req.user = data;
    next();
  } catch (e) {
    console.error('Token verification failed:', e.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ============================================================
// ✅ BASIC HEALTH CHECK
// ============================================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Backend is running',
    timestamp: new Date().toISOString(),
    database: 'Connected'
  });
});

// ============================================================
// 🧍 USER AUTH ENDPOINTS
// ============================================================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, stream } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users(name,email,password,role,stream) VALUES($1,$2,$3,$4,$5) RETURNING id,email,role,name,stream',
      [name, email, hashed, role || 'student', stream || null]
    );
    res.status(201).json({ message: 'User registered', user: result.rows[0] });
  } catch (err) {
    console.error('Registration error:', err);
    if (err.code === '23505') return res.status(400).json({ error: 'Email already exists' });
    res.status(400).json({ error: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(400).json({ error: 'Invalid email or password' });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, stream: user.stream },
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
        name: user.name,
        stream: user.stream 
      } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// 📊 REPORTS ENDPOINTS - ENHANCED FOR PRL
// ============================================================

// Get all reports with role-based filtering
app.get('/api/reports', auth, async (req, res) => {
  try {
    let query = 'SELECT * FROM reports';
    let params = [];
    
    // Role-based filtering
    if (req.user.role === 'lecturer') {
      query += ' WHERE lecturer = $1';
      params = [req.user.name];
    } else if (req.user.role === 'principal_lecturer' && req.user.stream) {
      query += ' WHERE stream = $1';
      params = [req.user.stream];
    } else if (req.user.role === 'student') {
      // Assuming students have class_name field
      query += ' WHERE class_name = $1';
      params = [req.user.className || ''];
    }
    
    query += ' ORDER BY created_at DESC LIMIT 100';
    
    const result = await pool.query(query, params);
    res.json({ reports: result.rows });
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create new report
app.post('/api/reports', auth, async (req, res) => {
  try {
    const body = req.body;
    const q = `INSERT INTO reports
      (faculty_name, class_name, week_of_reporting, date_of_lecture, coursename, coursecode, lecturer, present, registered, venue, scheduled_time, topic_taught, learning_outcomes, recommendations, stream, teaching_methods, learning_materials, remarks)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING *`;
    
    const vals = [
      body.faculty_name || '', 
      body.class_name || '', 
      body.week_of_reporting || '', 
      body.date_of_lecture || '',
      body.coursename || '', 
      body.coursecode || '', 
      body.lecturer || req.user.name, // Default to current user if not specified
      body.present || 0,
      body.registered || 0, 
      body.venue || '', 
      body.scheduled_time || '', 
      body.topic_taught || '',
      body.learning_outcomes || '', 
      body.recommendations || '',
      body.stream || req.user.stream || null, // Include stream
      body.teaching_methods || '',
      body.learning_materials || '',
      body.remarks || ''
    ];
    
    const result = await pool.query(q, vals);
    res.status(201).json({ report: result.rows[0] });
  } catch (err) {
    console.error('Error creating report:', err);
    res.status(400).json({ error: err.message });
  }
});

// Update report
app.put('/api/reports/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    
    // Check if user can edit this report
    const existingReport = await pool.query('SELECT * FROM reports WHERE id = $1', [id]);
    if (existingReport.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    const report = existingReport.rows[0];
    
    // Authorization check
    if (req.user.role === 'lecturer' && report.lecturer !== req.user.name) {
      return res.status(403).json({ error: 'Not authorized to edit this report' });
    }
    
    if (req.user.role === 'principal_lecturer' && report.stream !== req.user.stream) {
      return res.status(403).json({ error: 'Not authorized to edit reports outside your stream' });
    }
    
    const q = `UPDATE reports SET
      faculty_name=$1, class_name=$2, week_of_reporting=$3, date_of_lecture=$4, coursename=$5,
      coursecode=$6, lecturer=$7, present=$8, registered=$9, venue=$10, scheduled_time=$11,
      topic_taught=$12, learning_outcomes=$13, recommendations=$14, stream=$15,
      teaching_methods=$16, learning_materials=$17, remarks=$18, updated_at=CURRENT_TIMESTAMP
      WHERE id=$19 RETURNING *`;
    
    const vals = [
      body.faculty_name, body.class_name, body.week_of_reporting, body.date_of_lecture,
      body.coursename, body.coursecode, body.lecturer, body.present, body.registered,
      body.venue, body.scheduled_time, body.topic_taught, body.learning_outcomes,
      body.recommendations, body.stream, body.teaching_methods, body.learning_materials,
      body.remarks, id
    ];
    
    const result = await pool.query(q, vals);
    res.json({ report: result.rows[0] });
  } catch (err) {
    console.error('Error updating report:', err);
    res.status(400).json({ error: err.message });
  }
});

// Delete report
app.delete('/api/reports/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if report exists and user has permission
    const existingReport = await pool.query('SELECT * FROM reports WHERE id = $1', [id]);
    if (existingReport.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    const report = existingReport.rows[0];
    
    // Authorization check
    if (req.user.role === 'lecturer' && report.lecturer !== req.user.name) {
      return res.status(403).json({ error: 'Not authorized to delete this report' });
    }
    
    if (req.user.role === 'principal_lecturer' && report.stream !== req.user.stream) {
      return res.status(403).json({ error: 'Not authorized to delete reports outside your stream' });
    }
    
    await pool.query('DELETE FROM reports WHERE id = $1', [id]);
    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    console.error('Error deleting report:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// 💬 REPORT FEEDBACK ENDPOINTS (PRL Feedback on Reports)
// ============================================================

// Add or update feedback on a report
app.post('/api/reports/:id/feedback', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    
    // Only PRL and Program Leaders can add feedback
    if (!['principal_lecturer', 'program_leader'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Only principal lecturers and program leaders can add feedback' });
    }
    
    // Check if report exists
    const existingReport = await pool.query('SELECT * FROM reports WHERE id = $1', [id]);
    if (existingReport.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    const report = existingReport.rows[0];
    
    // PRL can only add feedback to reports in their stream
    if (req.user.role === 'principal_lecturer' && report.stream !== req.user.stream) {
      return res.status(403).json({ error: 'Not authorized to add feedback to reports outside your stream' });
    }
    
    const result = await pool.query(
      'UPDATE reports SET feedback = $1, feedback_by = $2, feedback_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [feedback, req.user.name, id]
    );
    
    res.json({ 
      message: 'Feedback added successfully', 
      report: result.rows[0] 
    });
  } catch (err) {
    console.error('Error adding feedback:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get feedback for a specific report
app.get('/api/reports/:id/feedback', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT feedback, feedback_by, feedback_at FROM reports WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    res.json({ feedback: result.rows[0] });
  } catch (err) {
    console.error('Error fetching feedback:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// 🗒️ FEEDBACK ROUTES (PRL & PL Feedback System)
// ============================================================

// Create new feedback
app.post('/api/feedback', auth, async (req, res) => {
  try {
    const {
      recipientType, recipientId, recipientName, course, date,
      feedbackType, subject, message, priority, suggestions,
      followUpRequired, followUpDate
    } = req.body;

    if (!recipientId || !recipientName || !message)
      return res.status(400).json({ error: 'Missing required fields' });

    const result = await pool.query(
      `INSERT INTO feedbacks (
        sender_id, sender_name, recipient_type, recipient_id, recipient_name,
        course, date, feedback_type, subject, message, priority,
        suggestions, follow_up_required, follow_up_date
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING *`,
      [
        req.user.id, req.user.name, recipientType, recipientId, recipientName,
        course, date, feedbackType, subject, message, priority,
        suggestions, followUpRequired, followUpDate
      ]
    );

    res.status(201).json({ message: 'Feedback created successfully', feedback: result.rows[0] });
  } catch (err) {
    console.error('Error creating feedback:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all feedback (for admins/PRL)
app.get('/api/feedback', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM feedbacks ORDER BY created_at DESC LIMIT 100');
    res.json({ feedbacks: result.rows });
  } catch (err) {
    console.error('Error fetching feedbacks:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get feedback sent by logged-in user
app.get('/api/feedback/sent', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM feedbacks WHERE sender_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json({ feedbacks: result.rows });
  } catch (err) {
    console.error('Error fetching sent feedbacks:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get feedback received by specific user
app.get('/api/feedback/received/:recipientId', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM feedbacks WHERE recipient_id = $1 ORDER BY created_at DESC', [req.params.recipientId]);
    res.json({ feedbacks: result.rows });
  } catch (err) {
    console.error('Error fetching received feedbacks:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete feedback
app.delete('/api/feedback/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM feedbacks WHERE id = $1', [req.params.id]);
    res.json({ message: 'Feedback deleted successfully' });
  } catch (err) {
    console.error('Error deleting feedback:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// 👥 USER MANAGEMENT ENDPOINTS
// ============================================================

// Get all users (for PRL and Program Leaders)
app.get('/api/users', auth, async (req, res) => {
  try {
    if (!['principal_lecturer', 'program_leader'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized to view users' });
    }
    
    const result = await pool.query(
      'SELECT id, name, email, role, stream, created_at FROM users ORDER BY name'
    );
    res.json({ users: result.rows });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// 🧩 USER SETTINGS
// ============================================================
app.get('/api/user/settings', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT settings FROM user_settings WHERE user_id = $1', [req.user.id]);
    res.json({ settings: result.rows[0]?.settings || { theme: 'dark', language: 'english' } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/user/settings', auth, async (req, res) => {
  try {
    const settings = req.body;
    const exists = await pool.query('SELECT id FROM user_settings WHERE user_id = $1', [req.user.id]);
    if (exists.rows.length > 0)
      await pool.query('UPDATE user_settings SET settings = $1 WHERE user_id = $2', [settings, req.user.id]);
    else
      await pool.query('INSERT INTO user_settings (user_id, settings) VALUES ($1,$2)', [req.user.id, settings]);
    res.json({ message: 'Settings saved successfully', settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// 🌍 ROOT ENDPOINT
// ============================================================
app.get('/', (req, res) => res.json({
  message: 'Backend server is running',
  endpoints: {
    health: '/api/health',
    register: '/api/auth/register',
    login: '/api/auth/login',
    reports: '/api/reports',
    reportFeedback: '/api/reports/:id/feedback',
    feedback: '/api/feedback',
    sentFeedback: '/api/feedback/sent',
    receivedFeedback: '/api/feedback/received/:recipientId',
    users: '/api/users',
    settings: '/api/user/settings'
  }
}));

// ============================================================
// 🚀 START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Connected to PostgreSQL successfully`);
});






// ============================================================
// 📊 REPORTS ENDPOINTS - ENHANCED FOR PRL
// ============================================================

// Get all reports with role-based filtering
app.get('/api/reports', auth, async (req, res) => {
  try {
    let query = 'SELECT * FROM reports';
    let params = [];
    
    // Role-based filtering
    if (req.user.role === 'lecturer') {
      query += ' WHERE lecturer = $1';
      params = [req.user.name];
    } else if (req.user.role === 'principal_lecturer' && req.user.stream) {
      query += ' WHERE stream = $1';
      params = [req.user.stream];
    } else if (req.user.role === 'student') {
      // Assuming students have class_name field
      query += ' WHERE class_name = $1';
      params = [req.user.className || ''];
    }
    
    // Use id for ordering if created_at doesn't exist
    query += ' ORDER BY id DESC LIMIT 100';
    
    const result = await pool.query(query, params);
    
    // Ensure all reports have the required fields with defaults
    const reports = result.rows.map(report => ({
      ...report,
      stream: report.stream || 'General',
      feedback: report.feedback || '',
      teaching_methods: report.teaching_methods || '',
      learning_materials: report.learning_materials || '',
      remarks: report.remarks || '',
      created_at: report.created_at || new Date().toISOString()
    }));
    
    res.json({ reports });
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ error: err.message });
  }
});