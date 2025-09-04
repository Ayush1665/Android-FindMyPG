const mongoose = require('mongoose');
const dotenv = require('dotenv');

const connectDB = async () => {
  try {
    // Use a fallback URI if environment variable is not set
    const mongoURI = process.env.MONGODB_URI ;
    
    const conn = await mongoose.connect(mongoURI);
    
    console.log(`MongoDB Connected`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;