import mongoose, { Document, Schema } from 'mongoose';

export interface ItemType extends Document {
  name: string;
  quantity: number;
}

const ItemSchema: Schema = new Schema({
  name: { type: String, required: true },
  quantity: { type: Number, default: 0 },
});

export default mongoose.model<ItemType>('Item', ItemSchema);
