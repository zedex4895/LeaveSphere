import mongoose from "mongoose";

const uri = "mongodb+srv://vivek:gerukatte%40123@cluster0.is8j86l.mongodb.net/leave_management?retryWrites=true&w=majority";

console.log("Testing Atlas connection...");
try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log("SUCCESS: MongoDB Atlas connected!");
  await mongoose.disconnect();
} catch (e) {
  console.log("FAILED:", e.message);
  process.exit(1);
}
