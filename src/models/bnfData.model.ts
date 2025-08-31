import mongoose, { Schema, Document } from "mongoose";

export interface IBNFData extends Document {
  text: string;
  embedding: number[];
}

const BNFDataSchema: Schema = new Schema({
  text: {
    type: String,
    required: true,
  },
  embedding: {
    type: [Number],
    required: true,
  },
});

export default mongoose.model<IBNFData>("BNFData", BNFDataSchema);
