import mongoose from "mongoose";

const CapitalExpenditureSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["asset_purchase"], // only asset purchases for now
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    referenceType: {
      type: String, // e.g., "Asset"
      required: true,
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "referenceType",
    },

    description: String, // e.g., "Purchased new POS machine"

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.CapitalExpenditure ||
  mongoose.model("CapitalExpenditure", CapitalExpenditureSchema);
