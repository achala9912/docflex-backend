import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IChatHistory extends Document {
  userId: string; 
  messages: IMessage[];
}

const ChatHistorySchema: Schema = new Schema({
  userId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  messages: { 
    type: [
      {
        role: { 
          type: String, 
          enum: ['user', 'assistant'], 
          required: true 
        },
        content: { 
          type: String, 
          required: true 
        },
        timestamp: { 
          type: Date, 
          default: Date.now 
        },
      },
    ], 
    default: [] 
  },
});

export default mongoose.model<IChatHistory>('ChatHistory', ChatHistorySchema);