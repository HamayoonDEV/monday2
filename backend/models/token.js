import mongoose from "mongoose";

const { Schema } = mongoose;

const tokenSchema = Schema(
  {
    token: { type: String, required: true },
    userId: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("RefreshToken", tokenSchema, "token");
