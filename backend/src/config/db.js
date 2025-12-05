const mongoose = require('mongoose');
const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not defined');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    dbName: process.env.MONGO_DB_NAME || 'church_management',
  });
  console.log('MongoDB connected');
};
module.exports = connectDB;