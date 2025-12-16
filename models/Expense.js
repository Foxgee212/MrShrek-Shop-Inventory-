import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    /* ---------------- Classification ---------------- */
    type: {
      type: String,
      enum: [ "rent", "electricity", "internet", "withdrawal", "misc", "business_setup", "transport", "supplier_payment", "salary", "taxes" ],
      required: true,
      index: true,
    },

    category: {
      type: String, // transport, rent, electricity, supplier, etc
      index: true,
    },

    /* ---------------- Financial ---------------- */
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "transfer", "pos"],
      default: "cash",
      index: true,
    },

    reference: {
      type: String, // bank ref / POS ref
    },

    /* ---------------- Relations ---------------- */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    supplier: {
      type: String, // optional but very useful for stock purchases
    },

    linkedItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item", // optional: for stock purchases
    },

    /* ---------------- Control ---------------- */
    status: {
      type: String,
      enum: ["approved", "pending", "cancelled"],
      default: "approved",
      index: true,
    },

    description: {
      type: String,
      default: "",
    },

    /* ---------------- Date ---------------- */
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

export default mongoose.models.Expense ||
  mongoose.model("Expense", ExpenseSchema);
