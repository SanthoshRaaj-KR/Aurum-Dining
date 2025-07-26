import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Table-Service MongoDB Connected ✅");
  } catch (err) {
    console.error("MongoDB connection error table ❌", err);
    process.exit(1);
  }
};

export default connectDB;
