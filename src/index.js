import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
import { retriever } from './retriever.js';
import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import { createRetrieverTool } from 'langchain/tools/retriever';
import { ChatOpenAI } from '@langchain/openai';
import { pull } from 'langchain/hub';
import { createOpenAIFunctionsAgent } from 'langchain/agents';
import { AgentExecutor } from 'langchain/agents';
import { ChatMessageHistory } from 'langchain/memory';
import { RunnableWithMessageHistory } from '@langchain/core/runnables';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

const llm = new ChatOpenAI({
    model: "gpt-3.5-turbo",
    temperature: 0,
});

const messageHistory = new ChatMessageHistory();

const prompt = await pull("hwchase17/openai-functions-agent");

const searchTool = new TavilySearchResults();

const retrieverTool = createRetrieverTool(retriever, {
    name: "ethereum_white_paper",
    description: "Get to know about Ethereum blockchain. For any question about Ethereum blockchain, you must use this tool",
});

const tools = [searchTool, retrieverTool];

const agent = await createOpenAIFunctionsAgent({
    llm,
    tools,
    prompt,
});

const agentExecutor = new AgentExecutor({
    agent,
    tools,
});

const agentWithChatHistory = new RunnableWithMessageHistory({
    runnable: agentExecutor,
    getMessageHistory: (_sessionId) => messageHistory,
    inputMessagesKey: "input",
    historyMessagesKey: "chat_history",
});

app.post('/api/chat', async (req, res) => {
    const { input } = req.body;

    try {
        const result = await agentWithChatHistory.invoke(
            { input },
            { configurable: { sessionId: "foo" } }
        );
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});




































// import dotenv from 'dotenv';
// dotenv.config();
// import { ChatOpenAI } from "@langchain/openai";
// import { StringOutputParser } from "@langchain/core/output_parsers";
// import { PromptTemplate } from "@langchain/core/prompts";
// import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
// import { retriever } from './retriever.js';
// import { formatDocumentsAsString } from 'langchain/util/document';
// import {
//     ChatPromptTemplate,
//     MessagesPlaceholder,
// } from "@langchain/core/prompts";

// const openAIApiKey = process.env.OPENAI_API_KEY;

// const llm = new ChatOpenAI({openAIApiKey});

// function combineDocuments(docs) {
//     return docs.map((doc) => doc.pageContent).join('\n\n');
// }

// const contextualizeQSystemPrompt = `Given a chat history and the latest user question
// which might reference context in the chat history, formulate a standalone question
// which can be understood without the chat history. Do NOT answer the question,
// just reformulate it if needed and otherwise return it as is.`;

// const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
//     ["system", contextualizeQSystemPrompt],
//     new MessagesPlaceholder("chat_history"),
//     ["human", "{question}"],
// ]);

// const contextualizeQChain = RunnableSequence.from([
//     contextualizeQPrompt,
//     llm,
//     new StringOutputParser()
// ]);

// const qaSystemPrompt = `You are an assistant for question-answering tasks.
// Use the following pieces of retrieved context to answer the question.
// If you don't know the answer, just say that you don't know.
// Keep the answer concise and to the point.
// {context}`;

// const qaPrompt = ChatPromptTemplate.fromMessages([
//     ["system", qaSystemPrompt],
//     new MessagesPlaceholder("chat_history"),
//     ["human", "{question}"],
// ]);

// const contextualizedQuestion = (input) => {
//     if (typeof(input) === 'object' && "chat_history" in input) {
//       return contextualizeQChain;
//     }
//     return input.question;
// };

// const ragChain = RunnableSequence.from([
//     // Assign context and question before invoking qaPrompt
//     RunnablePassthrough.assign({
//         context: async (input) => {
//             if (input && "chat_history" in input) {
//                 const chain = contextualizedQuestion(input);
//                 return chain.pipe(retriever).pipe(formatDocumentsAsString);
//             }
//             return "";
//         },
//         question: ({ question }) => question,
//     }),
//     qaPrompt,
//     llm,
// ]);

// const chat_history = [];

// const standAloneQuestionTemplate = `Given some conversation history (if any) and a question, convert the question 
// to a standalone question.
// question: {question} 
// standalone question:`;

// const standaloneQuestionPrompt = PromptTemplate.fromTemplate(standAloneQuestionTemplate);

// const answerTemplate = `You are a helpful and enthusiastic support bot who can answer a given question 
// about Ethereum blockchain based on the context provided and the conversation history. Try to find the 
// answer in the context. If the answer is not given in the context, find the answer in the conversation
// history if possible. If you really don't know the answer, say "I'm sorry, I don't know the answer to that."
// And show url of Ethereum discord server https://discord.com/invite/ethereum-org for asking doubt. Don't try to 
// make up an answer. Always speak as if you were chatting to a friend.
// context: {context}
// question: {question}
// answer:`;

// const answerPrompt = PromptTemplate.fromTemplate(answerTemplate);

// const standaloneQuestionPromptChain = RunnableSequence.from([
//     standaloneQuestionPrompt,
//     llm,
//     new StringOutputParser(),
// ]);

// const retrieverChain = RunnableSequence.from([
//     (prevResult) => prevResult.standalone_question,
//     retriever,
//     combineDocuments,
// ]);

// const answerChain = RunnableSequence.from([
//     answerPrompt,
//     llm,
//     new StringOutputParser(),
// ]);

// const chain = RunnableSequence.from([
//     RunnablePassthrough.assign({
//         ragChain,
//         original_input: (input) => input,
//     }),
//     RunnablePassthrough.assign({
//         standalone_question: standaloneQuestionPromptChain,
//         original_input: (input) => input,
//     }),
//     RunnablePassthrough.assign({
//         context: retrieverChain,
//         question: ({ original_input }) => original_input.question,
//     }),
//     answerChain,
// ]);

// async function EthMentor(question) {
//     const response = await chain.invoke({
//         question,
//         chat_history,
//     });
//     console.log(response);
// }

// EthMentor('Hi! my name is Aarv. Can you tell me something about ethereum and tell me what is my name?');

