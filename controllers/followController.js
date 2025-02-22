const db = require('../config/db');

// Follow a user
exports.followUser = (req, res) => {
  const { followerId, followedId } = req.body;
  if (followerId === followedId) {
    return res.status(400).json({ message: 'Cannot follow yourself' });
  }
  // Check if already following
  db.query(
    'SELECT * FROM follows WHERE follower_id = ? AND followed_id = ?',
    [followerId, followedId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.sqlMessage });
      if (results.length > 0) {
        return res.status(400).json({ message: 'Already following' });
      }
      db.query(
        'INSERT INTO follows (follower_id, followed_id) VALUES (?, ?)',
        [followerId, followedId],
        (err2) => {
          if (err2) return res.status(500).json({ error: err2.sqlMessage });
          res.json({ message: 'Followed successfully' });
        }
      );
    }
  );
};

// Unfollow
exports.unfollowUser = (req, res) => {
  const { followerId, followedId } = req.body;
  db.query(
    'DELETE FROM follows WHERE follower_id = ? AND followed_id = ?',
    [followerId, followedId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.sqlMessage });
      if (result.affectedRows === 0) {
        return res.status(400).json({ message: 'Not currently following' });
      }
      res.json({ message: 'Unfollowed successfully' });
    }
  );
};

// Get followers
exports.getFollowers = (req, res) => {
  const { userId } = req.params;
  const sql = `
    SELECT u.id, u.username, u.avatar_url
    FROM follows f
    JOIN users u ON f.follower_id = u.id
    WHERE f.followed_id = ?
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    res.json(results);
  });
};

// Get following
exports.getFollowing = (req, res) => {
  const { userId } = req.params;
  const sql = `
    SELECT u.id, u.username, u.avatar_url
    FROM follows f
    JOIN users u ON f.followed_id = u.id
    WHERE f.follower_id = ?
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    res.json(results);
  });
};
