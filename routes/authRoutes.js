// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const { registerUser, loginUser, googleOAuthSuccess } = require('../controllers/authController');

// Email/password register + login
router.post('/register', registerUser);
router.post('/login', loginUser);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login' }),
  googleOAuthSuccess
);

module.exports = router;
