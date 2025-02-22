const db = require('../config/db');

// Add a comment (supports parent comment if you want nested threading)
exports.addComment = (req, res) => {
  const { userId, postId, parentCommentId, commentText } = req.body;
  db.query(
    'INSERT INTO comments (user_id, post_id, parent_comment_id, comment_text) VALUES (?, ?, ?, ?)',
    [userId, postId, parentCommentId || null, commentText],
    (error) => {
      if (error) return res.status(500).json({ error: error.sqlMessage });
      res.status(201).json({ message: 'Comment added' });
    }
  );
};

// Get nested comments by post
exports.getCommentsByPostId = (req, res) => {
  const { postId } = req.params;
  const sql = `
    SELECT c.*, users.username,
      (SELECT COUNT(*) FROM comment_likes WHERE comment_likes.comment_id = c.id) as commentLikeCount
    FROM comments c
    JOIN users ON c.user_id = users.id
    WHERE c.post_id = ?
    ORDER BY c.created_at ASC
  `;
  db.query(sql, [postId], (err, results) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    res.json(results);
  });
};

// Like a comment
exports.likeComment = (req, res) => {
  const { userId, commentId } = req.body;
  db.query(
    'SELECT * FROM comment_likes WHERE user_id = ? AND comment_id = ?',
    [userId, commentId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.sqlMessage });
      if (rows.length > 0) {
        return res.status(400).json({ message: 'Comment already liked' });
      }
      db.query(
        'INSERT INTO comment_likes (user_id, comment_id) VALUES (?, ?)',
        [userId, commentId],
        (error2) => {
          if (error2) return res.status(500).json({ error: error2.sqlMessage });
          res.status(201).json({ message: 'Comment liked' });
        }
      );
    }
  );
};

// Unlike a comment
exports.unlikeComment = (req, res) => {
  const { userId, commentId } = req.body;
  db.query(
    'DELETE FROM comment_likes WHERE user_id = ? AND comment_id = ?',
    [userId, commentId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.sqlMessage });
      if (result.affectedRows === 0) {
        return res.status(400).json({ message: 'You have not liked this comment' });
      }
      res.json({ message: 'Comment unliked' });
    }
  );
};
