// controllers/postController.js
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET;

// Create new post
exports.createPost = (req, res) => {
  const { content, userId } = req.body;
  let imageUrl = null;
  let videoUrl = null;

  if (req.file && req.file.path) {
    if (req.file.mimetype.startsWith('image')) {
      imageUrl = req.file.path;
    } else if (req.file.mimetype.startsWith('video')) {
      videoUrl = req.file.path;
    }
  }

  db.query(
    'INSERT INTO posts (user_id, content, image_url, video_url) VALUES (?, ?, ?, ?)',
    [userId, content, imageUrl, videoUrl],
    (error, results) => {
      if (error) {
        return res.status(500).json({ error: error.sqlMessage });
      }
      const postId = results.insertId;
      return res.status(201).json({ message: 'Post created', postId });
    }
  );
};

// controllers/postController.js
exports.getExploreFeed = (req, res) => {
  const { sort } = req.query;

  let orderByClause = 'posts.created_at DESC'; // Default: Latest posts first

  if (sort === 'most_liked') {
    orderByClause = '(SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) DESC';
  } else if (sort === 'least_liked') {
    orderByClause = '(SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) ASC';
  } else if (sort === 'most_commented') {
    orderByClause = '(SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id) DESC';
  } else if (sort === 'least_commented') {
    orderByClause = '(SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id) ASC';
  } else if (sort === 'oldest') {
    orderByClause = 'posts.created_at ASC';
  } else if (sort === 'newest') {
    orderByClause = 'posts.created_at DESC';
  } else if (sort === 'media_only') {
    orderByClause = 'posts.created_at DESC';
  }

  let mediaFilter = '';
  if (sort === 'media_only') {
    mediaFilter = 'WHERE posts.image_url IS NOT NULL OR posts.video_url IS NOT NULL';
  }

  const sql = `
    SELECT posts.*, users.username,
      (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) AS likeCount,
      (SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id) AS commentCount
    FROM posts
    JOIN users ON users.id = posts.user_id
    ${mediaFilter}
    ORDER BY ${orderByClause}
    LIMIT 20
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    res.json(results);
  });
};


// Get posts for a specific user (for profile page)
exports.getPostsByUser = (req, res) => {
  const { userId } = req.params;
  const sql = `
    SELECT posts.*, users.username, users.avatar_url,
      (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) AS likeCount,
      (SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id) AS commentCount,
      EXISTS (
        SELECT 1 FROM follows WHERE follower_id = ? AND followed_id = posts.user_id
      ) AS isFollowing,
      (SELECT COUNT(*) FROM follows WHERE followed_id = posts.user_id) AS followerCount,
      (SELECT COUNT(*) FROM follows WHERE follower_id = posts.user_id) AS followingCount
    FROM posts
    JOIN users ON users.id = posts.user_id
    ${mediaFilter}
    ORDER BY ${orderByClause}
    LIMIT 20
  `;


  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    res.json(results);
  });
};

// Home feed (followed users)
exports.getHomeFeed = (req, res) => {
  const { userId } = req.params;
  const sql = `
    SELECT posts.*, users.username,
      (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) AS likeCount,
      (SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id) AS commentCount
    FROM posts
    JOIN users ON users.id = posts.user_id
    WHERE user_id IN (SELECT followed_id FROM follows WHERE follower_id = ?)
    ORDER BY posts.created_at DESC
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    res.json(results);
  });
};

// Explore feed (random)
exports.getExploreFeed = (req, res) => {
  const sql = `
    SELECT posts.*, users.username,
      (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) AS likeCount,
      (SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id) AS commentCount
    FROM posts
    JOIN users ON users.id = posts.user_id
    ORDER BY RAND()
    LIMIT 20
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    res.json(results);
  });
};

// Like post
exports.likePost = (req, res) => {
  const { userId, postId } = req.body;
  db.query(
    'SELECT * FROM likes WHERE user_id = ? AND post_id = ?',
    [userId, postId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.sqlMessage });
      if (results.length > 0) {
        return res.status(400).json({ message: 'Already liked' });
      }
      db.query(
        'INSERT INTO likes (user_id, post_id) VALUES (?, ?)',
        [userId, postId],
        (err2) => {
          if (err2) return res.status(500).json({ error: err2.sqlMessage });
          res.status(201).json({ message: 'Post liked' });
        }
      );
    }
  );
};

// Unlike post
exports.unlikePost = (req, res) => {
  const { userId, postId } = req.body;
  db.query(
    'DELETE FROM likes WHERE user_id = ? AND post_id = ?',
    [userId, postId],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.sqlMessage });
      if (result.affectedRows === 0) {
        return res.status(400).json({ message: 'You have not liked this post yet' });
      }
      res.json({ message: 'Post unliked' });
    }
  );
};

// Search posts by content
exports.searchPosts = (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Search query parameter is required' });
  }
  // Searching `content`
  db.query(
    `SELECT posts.id, posts.content, posts.image_url, posts.created_at, users.username
     FROM posts
     JOIN users ON users.id = posts.user_id
     WHERE posts.content LIKE ?
     ORDER BY posts.created_at DESC
     LIMIT 50`,
    [`%${query}%`],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.sqlMessage });
      res.json(results);
    }
  );
};
