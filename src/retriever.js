import dotenv from 'dotenv'
dotenv.config()
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase"
import { OpenAIEmbeddings } from '@langchain/openai'
import {createClient} from '@supabase/supabase-js'

const openAIApiKey = process.env.OPENAI_API_KEY

const embeddings = new OpenAIEmbeddings({openAIApiKey})
const supabaseApiKey = process.env.SUPABASE_API_KEY
const supabaseUrl = process.env.SUPABASE_URL
const client = createClient(supabaseUrl, supabaseApiKey)

const vectorStore = new SupabaseVectorStore(embeddings, {
    client,
    tableName: 'documents',
    queryName: 'match_documents'
})

const retriever = vectorStore.asRetriever()

export {retriever}