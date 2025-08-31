import { getAnswerFromLLM } from './groq.service';
import { getEmbedding } from './localEmbeddings.service';
import BNFData, { IBNFData } from '../models/bnfData.model';

export const getRAGAnswer = async (userQuestion: string): Promise<string> => {
  try {
    const questionEmbedding = await getEmbedding(userQuestion);
    const relevantDocs = await BNFData.aggregate<IBNFData>([
      {
        $vectorSearch: {
          queryVector: questionEmbedding,
          path: 'embedding',
          numCandidates: 100,
          limit: 5,
          index: 'bnf_vector_index',
        },
      },
      {
        $project: {
          _id: 0,
          text: 1,
        },
      },
    ]);
    const context = relevantDocs.map(doc => doc.text).join('\n\n---\n\n');
    const prompt = `You are a medical assistant. Use the following context to answer the user's question. If the answer is not in the context, state that you cannot provide an answer based on the available information.
    Context:
    ${context}
    User's question: ${userQuestion}`;
    const answer = await getAnswerFromLLM(prompt);
    return answer;
  } catch (error) {
    console.error("Error in RAG process:", error);
    throw new Error('Could not retrieve an answer.');
  }
};