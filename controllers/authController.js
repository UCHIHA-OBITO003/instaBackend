// controllers/authController.js
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET;

// Register (email/password)
exports.registerUser = (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  bcrypt.hash(password, 10, (hashErr, hash) => {
    if (hashErr) return res.status(500).json({ error: 'Error hashing password' });

    db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hash],
      (err) => {
        if (err) {
          return res.status(400).json({ error: err.sqlMessage });
        }
        return res.status(201).json({ message: 'User registered successfully' });
      }
    );
  });
};

// Login (email/password)
exports.loginUser = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = results[0];
    bcrypt.compare(password, user.password || '', (compareErr, match) => {
      if (compareErr) return res.status(500).json({ error: 'Server error' });
      if (!match) return res.status(401).json({ error: 'Invalid email or password' });

      // create token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ message: 'Logged in successfully', token, userId: user.id });
    });
  });
};

// Google OAuth callback
exports.googleOAuthSuccess = (req, res) => {
  // If we reach here, user is in req.user
  // Create JWT
  const token = jwt.sign({ userId: req.user.id }, JWT_SECRET, { expiresIn: '1h' });
  // Redirect to your React app with the token
  return res.redirect(`http://localhost:3000/oauth-callback?token=${token}&userId=${req.user.id}`);
};
