const db = require('../config/db');

// Example route handler for searching posts by hashtag
exports.searchByHashtag = (req, res) => {
  const { tag } = req.params;
  // 1. find hashtag in `hashtags` table
  // 2. find all `post_hashtags` referencing that hashtag
  // 3. return the posts or do your logic

  // Dummy / placeholder implementation:
  db.query(
    "SELECT * FROM posts WHERE content LIKE CONCAT('%', ?, '%') LIMIT 50",
    [tag],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.sqlMessage });
      res.json(results);
    }
  );
};
