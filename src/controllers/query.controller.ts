import { Request, Response } from "express";
import { BadRequestError, NotFoundError } from '../types/errors.types';
import { queryService } from '../services/query.service';
import { getAICompletion } from '../utils/ai-completion';
import { promptTemplate } from '../utils/prompt-template';
import logger from '../utils/logger';

export const queryDocument = async (req: Request, res: Response) => {
  
  const { query } = req.body;

  if (!query) throw new BadRequestError('Field prompt cannot be empty or missing');

  /**
   * This queryService performs a query on the Pinecone index.
   * It first embeds the query and then searches for the most relevant documents.
   * If no relevant documents are found, it uses the OpenAI API to determine if the query can be answered directly.
   * If the query cannot be answered directly, it fetches external search results and uses them as context.
   */
  const input = query.replace(/\n/g, ' ');
  let {contextText, contextSource} = await queryService.performQuery(input);

  const prompt = promptTemplate(contextText, query, contextSource);

  logger.logInfo("Generating response based on context...", { prompt });

  const completionResponse = await getAICompletion(prompt);
  const answer = completionResponse.choices[0].message;

  if (answer.content === "-1")
    throw new NotFoundError("No relevant context found. We couldn't find an answer for your question in the knowledge base, AI model, or external sources.");

  logger.logInfo("Final response generated.", { query, response: answer });

  return res.ok(answer, "Query executed successfully");
};