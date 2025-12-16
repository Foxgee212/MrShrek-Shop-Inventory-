import mongoose from 'mongoose';

const AssetSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    PurchaseCost: { type: Number, required: true },
    PurchaseDate: { type: Date, required: true },
    quantity: { type: Number, required: true },
    location: { type: String, required: true },
    condition: { type: String, required: true },
    supplier: { type: String},
    status: { type: String},
    usefulLifeMonths: { type: Number, required: true },
    salvageValue: { type: Number, required: true },
    createdby: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
    timestamps: true,
});
export default mongoose.model('Asset', AssetSchema);

