import { pipeline } from '@xenova/transformers';

const EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2';
let embedder: any = null;

export async function getEmbedding(text: string): Promise<number[]> {
  try {
    if (!embedder) {
      console.log(`Loading local model: ${EMBEDDING_MODEL}`);
      embedder = await pipeline('feature-extraction', EMBEDDING_MODEL);
      console.log('Local model loaded.');
    }
    const result = await embedder(text, { pooling: 'mean', normalize: true });
    const embedding = Array.from(result.data);
    return embedding as number[];
  } catch (error) {
    console.error('Error getting local embedding:', error);
    throw new Error('Could not create local embedding.');
  }
}