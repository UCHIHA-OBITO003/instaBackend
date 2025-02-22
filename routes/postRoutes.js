// routes/postRoutes.js
const express = require('express');
const router = express.Router();
const { getExploreFeed } = require('../controllers/postController');
const upload = require('../middleware/cloudinaryMulter');
const {
  createPost,
  getPostsByUser,
  getHomeFeed,
  getExploreFeed,
  likePost,
  unlikePost,
  searchPosts,
} = require('../controllers/postController');

// Create post
router.post('/', upload.single('file'), createPost);

// Get feed
router.get('/home/:userId', getHomeFeed);
router.get('/explore', getExploreFeed);

// User's own posts for profile
router.get('/user/:userId', getPostsByUser);

// Like/unlike
router.post('/like', likePost);
router.post('/unlike', unlikePost);
router.get('/explore', getExploreFeed);

module.exports = router;
// Search posts
router.get('/search', searchPosts);

module.exports = router;
