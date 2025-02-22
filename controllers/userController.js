const db = require('../config/db');

// 1) Get user profile
exports.getUserProfile = (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  db.query(
    'SELECT id, username, email, created_at, avatar_url FROM users WHERE id = ?',
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.sqlMessage });
      if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(results[0]);
    }
  );
};

// 2) Search for users
exports.searchUsers = (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  db.query(
    'SELECT id, username, avatar_url FROM users WHERE username LIKE ? LIMIT 50',
    [`%${query}%`],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.sqlMessage });
      res.json(results);
    }
  );
};

// 3) Optionally get all users
exports.getAllUsers = (req, res) => {
  db.query('SELECT id, username, avatar_url FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    res.json(results);
  });
};

// 4) Update user profile (including profile picture via Cloudinary)
exports.updateUserProfile = (req, res) => {
  const { userId } = req.params;
  const { username, email } = req.body;

  // Build the update data; if an avatar file is provided via multer, add its Cloudinary URL.
  let updateData = { username, email };
  if (req.file) {
    // CloudinaryStorage puts the image URL in req.file.path
    updateData.avatar_url = req.file.path;
  }

  db.query('UPDATE users SET ? WHERE id = ?', [updateData, userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    // Re-query the updated user profile to return the updated data
    db.query(
      'SELECT id, username, email, created_at, avatar_url FROM users WHERE id = ?',
      [userId],
      (err, results) => {
        if (err) return res.status(500).json({ error: err.sqlMessage });
        if (results.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }
        res.json(results[0]);
      }
    );
  });
};
