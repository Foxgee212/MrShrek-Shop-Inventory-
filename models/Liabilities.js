import mongoose from "mongoose";

const LiabilitySchema = new mongoose.Schema({
  type: { type: String, enum: ["loan", "credit"], required: true },
  amount: { type: Number, required: true },
  interestRate: { type: Number, default: 0 }, // annual %
  dueDate: { type: Date },
  lender: { type: String }, // bank or person
  description: String,
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

export default mongoose.models.Liability || mongoose.model("Liability", LiabilitySchema);
