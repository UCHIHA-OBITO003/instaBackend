// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session'); // needed for Google OAuth if using sessions
const passport = require('passport');       // passport main
require('./config/passportGoogleStrategy'); // your Google Strategy file

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const followRoutes = require('./routes/followRoutes');
const hashtagRoutes = require('./routes/hashtagRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// 1) If using sessions for Passport:
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'some_secret_key',
    resave: false,
    saveUninitialized: false,
  })
);

// 2) Initialize Passport with session
app.use(passport.initialize());
app.use(passport.session());

// 3) Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/hashtags', hashtagRoutes);

// Example root endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the Social Media API');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
