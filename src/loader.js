import dotenv from 'dotenv'
dotenv.config()
// import { PDFLoader } from "langchain/document_loaders/fs/pdf"
import {PDFLoader} from "@langchain/community/document_loaders/fs/pdf"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase"
import { OpenAIEmbeddings } from "@langchain/openai"

try {
    const loader = new PDFLoader("src/documents/eth_white_paper.pdf");
    
    const docs = await loader.load();
    
    // splitter function 
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        separators: ['\n\n', '\n', ' ', ''], //default
        chunkOverlap: 50,
    })
    
    // chunks 
    const splittedDocs = await splitter.splitDocuments(docs)
    
    const supabaseApiKey = process.env.SUPABASE_API_KEY
    const supabaseUrl = process.env.SUPABASE_URL
    const openAIApiKey = process.env.OPENAI_API_KEY
    
    
    await SupabaseVectorStore.fromDocuments(
        splittedDocs,
        new OpenAIEmbeddings({openAIApiKey}),
        {
            client,
            tableName: 'documents',
        }
    )
    
    // const embeddings = new OpenAIEmbeddings({
    //     apiKey: openAIApiKey,
    //     batchSize: 512, // Default value if omitted is 512. Max is 2048
    //     model: "text-embedding-3-large",
    // });
    
    // console.log(docs)
} catch (error) {
    console.log(error)
}
