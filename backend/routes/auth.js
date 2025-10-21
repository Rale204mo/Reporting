const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');

const router = express.Router();

// ✅ Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Query user by email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = result.rows[0];

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    return res.status(200).json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Example test route
router.get('/test', (req, res) => {
  res.send('Auth route is working');
});


// Route protection component
const ProtectedRoute = ({ role, requiredRole, children }) => {
  const normalizedRequired = requiredRole === 'principal_lecturer' ? 'principallecturer' : requiredRole;
  const normalizedUserRole = role === 'principal_lecturer' ? 'principallecturer' : role;
  
  if (normalizedUserRole !== normalizedRequired) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};
module.exports = router;
