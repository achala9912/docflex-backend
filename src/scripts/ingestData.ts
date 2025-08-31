import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import mongoose from 'mongoose';
import BNFData from '../models/bnfData.model';
import { getEmbedding } from '../services/localEmbeddings.service';

const mongoUri = process.env.MONGO_URI!;

async function ingestData() {
  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected for ingestion.");
    const pdfPath = path.resolve(__dirname, '../../data/BNF.pdf');
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found at: ${pdfPath}`);
    }
    const dataBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdf(dataBuffer);
    const chunkSize = 1000;
    const chunkOverlap = 200;
    const chunks: string[] = [];
    for (let i = 0; i < pdfData.text.length; i += chunkSize - chunkOverlap) {
      chunks.push(pdfData.text.substring(i, i + chunkSize));
    }
    console.log(`Found ${chunks.length} text chunks. Starting embedding...`);
    await BNFData.deleteMany({});
    for (const chunk of chunks) {
      try {
        const embedding = await getEmbedding(chunk);
        const newDoc = new BNFData({ text: chunk, embedding: embedding });
        await newDoc.save();
      } catch (error) {
        console.error("Error processing chunk:", error);
      }
    }
    console.log("Data ingestion complete!");
  } catch (error) {
    console.error("Error during data ingestion:", error);
  } finally {
    await mongoose.disconnect();
  }
}
ingestData();