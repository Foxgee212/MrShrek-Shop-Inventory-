import mongoose  from "mongoose";

const ItemSchema = new mongoose.Schema({
    name: String,
    category: String,
    brand: String,
    type: String,
    model: String,
    costPrice: Number,
    sellingPrice: Number,
    photo: String,
    stock: { type: Number, default: 0},
    sku: { type: String, unique: true, sparse: true },
    description: String,

}, {timestamps: true});

export default mongoose.models.Item || mongoose.model("Item", ItemSchema);
