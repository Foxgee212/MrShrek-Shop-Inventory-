import mongoose from "mongoose";

const ActivityLogSchema = new mongoose.Schema(
  {
    /* ---------------- Actor ---------------- */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* ---------------- Action ---------------- */
    action: {
      type: String,
      required: true,
      index: true,
      // examples:
      // "CREATE_SALE", "UPDATE_ITEM", "DELETE_EXPENSE", "LOGIN"
    },

    entityType: {
      type: String,
      enum: ["Item", "Sale", "Expense", "User", "Stock", "Auth", "CapitalTransaction","Asset"],
      index: true,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },

    /* ---------------- Context ---------------- */
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      // example:
      // { quantity: 3, amount: 15000, previousStock: 10 }
    },

    /* ---------------- Metadata ---------------- */
    ipAddress: String,
    userAgent: String,

    /* ---------------- Time ---------------- */
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ActivityLog ||
  mongoose.model("ActivityLog", ActivityLogSchema);
