const express = require('express');
const router = express.Router();
const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
} = require('../controllers/followController');

// Follow/unfollow
router.post('/follow', followUser);
router.post('/unfollow', unfollowUser);

// Get followers/following
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);

module.exports = router;
