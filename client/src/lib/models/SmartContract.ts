import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISmartContract extends Document {
  name: string;
  description: string;
  code: string;
  blocklyXml?: string;
  language: string; // e.g., "rust", "solidity"
  network: string; // e.g., "solana", "ethereum"
  deployedAddress?: string;
  createdBy: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SmartContractSchema: Schema<ISmartContract> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    code: {
      type: String,
      required: true,
    },
    blocklyXml: {
      type: String,
      required: false, // Optional, for storing Blockly workspace state
    },
    language: {
      type: String,
      required: true,
      enum: ["rust", "solidity", "other"],
      default: "rust",
    },
    network: {
      type: String,
      required: true,
      enum: ["solana", "ethereum", "polygon", "arbitrum", "optimism"],
      default: "solana",
    },
    deployedAddress: {
      type: String,
      required: false, // Optional, filled after deployment
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const SmartContract: Model<ISmartContract> =
  mongoose.models.SmartContract || mongoose.model<ISmartContract>("SmartContract", SmartContractSchema);

export default SmartContract;