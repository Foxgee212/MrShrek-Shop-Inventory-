import mongoose, { Document } from "mongoose";

export interface IAsset extends Document {
  name: string;
  category: string;
  PurchaseCost: number;
  PurchaseDate: Date;
  quantity: number;
  location: string;
  condition: string;
  supplier?: string;
  status?: string;
  usefulLifeMonths: number;
  salvageValue: number;
  createdby: mongoose.Types.ObjectId;
}

const AssetSchema = new mongoose.Schema<IAsset>({
  name: { type: String, required: true },
  category: { type: String, required: true },
  PurchaseCost: { type: Number, required: true },
  PurchaseDate: { type: Date, required: true },
  quantity: { type: Number, required: true },
  location: { type: String, required: true },
  condition: { type: String, required: true },
  supplier: { type: String },
  status: { type: String },
  usefulLifeMonths: { type: Number, required: true },
  salvageValue: { type: Number, required: true },
  createdby: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

export default mongoose.models.Asset || mongoose.model<IAsset>("Asset", AssetSchema);
