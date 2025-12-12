import mongoose from "mongoose";

const SaleSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quantity: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    total: { type: Number, required: true },

    // Useful for grouping sales by day/month/year
    date: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);

export default mongoose.models.Sale || mongoose.model("Sale", SaleSchema);
