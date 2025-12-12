import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["stock_purchase", "withdrawal", "misc"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // who recorded the expense
    },

    // Useful for daily / weekly / monthly filtering
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt
  }
);

export default mongoose.models.Expense ||
  mongoose.model("Expense", ExpenseSchema);
