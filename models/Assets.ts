import mongoose, { Document } from "mongoose";

export interface IAsset extends Document {
  name: string;
  category: string;
  purchaseCost: number;
  purchaseDate: Date;
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
  purchaseCost: { type: Number, required: true },
  purchaseDate: { type: Date },
  quantity: { type: Number, required: true },
  location: { type: String},
  condition: { type: String },
  supplier: { type: String },
  status: { type: String },
  usefulLifeMonths: { type: Number, required: true },
  salvageValue: { type: Number },
  createdby: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

export default mongoose.models.Asset || mongoose.model<IAsset>("Asset", AssetSchema);
