import mongoose from "mongoose";

const CapitalTransactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["injection", "withdrawal"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    source: {
      type: String, // personal, other business, loan, investor
    },

    description: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.CapitalTransaction ||
  mongoose.model("CapitalTransaction", CapitalTransactionSchema);
