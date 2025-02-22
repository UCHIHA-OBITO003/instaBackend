// config/passportGoogleStrategy.js
require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');

// Setting up Google strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      // If using sessionless JWT approach, we can also set { passReqToCallback: true }
    },
    (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        db.query(
          'SELECT * FROM users WHERE google_id = ?',
          [profile.id],
          (err, results) => {
            if (err) return done(err);

            if (results.length > 0) {
              // User exists
              return done(null, results[0]);
            } else {
              // Create new user
              const username = profile.displayName.replace(/\s+/g, '');
              const google_id = profile.id;
              const email = profile.emails?.[0]?.value || null;

              db.query(
                'INSERT INTO users (username, google_id, email) VALUES (?, ?, ?)',
                [username, google_id, email],
                (insertErr, insertRes) => {
                  if (insertErr) return done(insertErr);

                  db.query(
                    'SELECT * FROM users WHERE id = ?',
                    [insertRes.insertId],
                    (selErr, newUser) => {
                      if (selErr) return done(selErr);
                      return done(null, newUser[0]);
                    }
                  );
                }
              );
            }
          }
        );
      } catch (e) {
        return done(e);
      }
    }
  )
);

// Optional: For session-based usage
passport.serializeUser((user, done) => {
  done(null, user.id); // store userId in session
});
passport.deserializeUser((id, done) => {
  db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    if (err) return done(err);
    done(null, results[0]);
  });
});
