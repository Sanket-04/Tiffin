require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const providerRoutes = require('./routes/providerRoutes');

const app = express();

// SIMPLE CORS - ALLOW ALL FOR LOCAL DEVELOPMENT
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true }));

// serve uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to DB and clean up old indexes
connectDB().then(async () => {
  const mongoose = require('mongoose');
  
  // Clean up old indexes
  try {
    // Drop old username index from users collection
    await mongoose.connection.collection('users').dropIndex('username_1').catch(() => {});
    console.log('✅ Cleaned users collection indexes');
  } catch (err) {
    console.log('Users indexes already clean');
  }

  try {
    // Drop old email index from providers collection
    await mongoose.connection.collection('providers').dropIndex('email_1').catch(() => {});
    console.log('✅ Cleaned providers collection indexes');
  } catch (err) {
    console.log('Providers indexes already clean');
  }

  // Optional: Clear problematic documents
  try {
    await mongoose.connection.collection('providers').deleteMany({ email: null });
    console.log('✅ Removed invalid provider documents');
  } catch (err) {
    console.log('No invalid documents to remove');
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);

app.get('/', (req, res) => res.send('Tiffin Buddy API - fullstack'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));