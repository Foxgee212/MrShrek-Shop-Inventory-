import mongoose from "mongoose";

const LogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: String,
  meta: Object,
  date: { type: Date, default: Date.now }
});

export default mongoose.models.ActivityLog || mongoose.model("ActivityLog", LogSchema);
