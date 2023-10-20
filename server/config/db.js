// import mongoose from "mongoose";
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const { connection } = await mongoose.connect(process.env.MONGO_URL);
    console.log(`Mongodb connected at ${connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;