const express = require('express');
const router = express.Router();
const {
  addComment,
  getCommentsByPostId,
  likeComment,
  unlikeComment
} = require('../controllers/commentController');

// Add a comment
router.post('/', addComment);

// Get comments for a post
router.get('/:postId', getCommentsByPostId);

// Like/unlike comment
router.post('/like', likeComment);
router.post('/unlike', unlikeComment);

module.exports = router;
