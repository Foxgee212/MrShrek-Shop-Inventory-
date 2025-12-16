import mongoose from "mongoose";


const InventoryTransactionSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  type: { type: String, enum: ["purchase", "sale", "adjustment", "return"], required: true },
  quantity: { type: Number, required: true },
  costPrice: Number, // for purchase or cost adjustments
  relatedId: { type: mongoose.Schema.Types.ObjectId }, // link to PO, Sale, or Expense
  date: { type: Date, default: Date.now },
  notes: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" } // who made the change
});

export default mongoose.models.InventoryTransaction ||
  mongoose.model("InventoryTransaction", InventoryTransactionSchema);