const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const dataIngestionRoutes = require('./routes/dataIngestion');
require('dotenv').config();

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/xeno-crm', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // frontend URL
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport Google OAuth 2.0 Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => {
  // Here you would find or create the user in your DB
  // For demo, just return profile
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Routes
app.get('/', (req, res) => {
  res.send('Mini CRM Backend is running');
});

// Auth routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/failure' }),
  (req, res) => {
    // Successful authentication, redirect to frontend dashboard
    res.redirect('http://localhost:3000/create-campaign');
  });

app.get('/auth/failure', (req, res) => {
  res.send('Failed to authenticate..');
});

app.get('/auth/logout', (req, res) => {
  req.logout(() => {
    res.redirect('http://localhost:3000/login');
  });
});

// Auth check route for frontend
app.get('/auth/check', (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Data ingestion routes
app.use('/api', dataIngestionRoutes);

// Campaign routes
const campaignRoutes = require('./routes/campaign');
app.use('/api', campaignRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

module.exports = app;
