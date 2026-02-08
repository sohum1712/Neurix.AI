const mongoose = require('mongoose');
const config = require('../config');

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (!config.mongodbUri) {
      console.warn('MongoDB URI not configured. Running without database.');
      return;
    }
    const conn = await mongoose.connect(config.mongodbUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.warn('Server will continue without database connection.');
    // Don't exit, allow server to run without DB
  }
};

module.exports = connectDB;