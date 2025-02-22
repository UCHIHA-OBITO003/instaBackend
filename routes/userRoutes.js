// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  searchUsers,
  getAllUsers,
} = require('../controllers/userController');

// GET user profile
router.get('/profile/:userId', getUserProfile);

// NEW: Search for users
router.get('/search', searchUsers);

// Optionally get all users
router.get('/all', getAllUsers);

module.exports = router;
