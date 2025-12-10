import mongoose from "mongoose";

const POLineSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  sku: String,
  brand: String,
  model: String,
  unitCost: { type: Number, required: true },
  qtyOrdered: { type: Number, required: true },
  qtyReceived: { type: Number, default: 0 }
});

const POSchema = new mongoose.Schema({
  supplierName: String,
  supplierContact: String,
  status: { type: String, enum: ["draft", "ordered", "received", "cancelled"], default: "draft" },
  lines: [POLineSchema],
  totalCost: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  receivedAt: Date,
  notes: String
});

export default mongoose.models.PurchaseOrder || mongoose.model("PurchaseOrder", POSchema);
