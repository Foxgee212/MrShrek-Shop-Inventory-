import mongoose from "mongoose";

const SaleSchema = new mongoose.Schema(
  {
    /* ---------------- Core Relations ---------------- */
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* ---------------- Snapshot (Immutable) ---------------- */
    itemName: { type: String, required: true },     // snapshot
    category: { type: String, required: true },     // snapshot
    brand: { type: String },                         // snapshot
    model: { type: String },                         // snapshot

    /* ---------------- Quantity & Pricing ---------------- */
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    costPrice: {
      type: Number,
      required: true,
    },

    sellingPrice: {
      type: Number,
      required: true,
    },

    /* ---------------- Financial Totals ---------------- */
    totalRevenue: {
      type: Number,
      required: true,
    },

    totalCost: {
      type: Number,
      required: true,
    },

    /* ---------------- Payment Tracking ---------------- */
    paymentMethod: {
      type: String,
      enum: ["cash", "transfer", "pos"],
      default: "cash",
      index: true,
    },

    reference: {
      type: String, // POS ref / bank ref
    },

    /* ---------------- Status Control ---------------- */
    status: {
      type: String,
      enum: ["completed", "refunded", "voided"],
      default: "completed",
      index: true,
    },

    /* ---------------- Date Control ---------------- */
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

export default mongoose.models.Sale || mongoose.model("Sale", SaleSchema);
