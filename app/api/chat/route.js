import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import openai from "openai";

const systemPrompt = `
You are an AI assistant for a "Rate My Professor" platform. Your primary function is to help students find the most suitable professors based on their queries using a RAG (Retrieval-Augmented Generation) system.

For each user query, you will:

1. Analyze the student's question or requirements.
2. Use the RAG system to retrieve relevant information from the professor review database.
3. Present the top 3 most relevant professors based on the query.
4. For each professor, provide:
   - Name
   - Subject
   - Average star rating
   - A brief summary of their strengths and any potential concerns based on reviews
   - One or two short, representative quotes from student reviews

Your responses should be informative, concise, and tailored to the student's specific needs. If the query is vague or could be interpreted in multiple ways, ask for clarification before providing recommendations.

Remember to maintain a neutral tone and present both positive and negative aspects of each professor's reviews when relevant. Do not show bias towards any particular professor or subject.

If there aren't enough professors in the database matching the query, inform the user and provide the best alternatives available.

Always encourage students to read more reviews and make their own informed decisions, as individual experiences may vary.

If asked about the specifics of the RAG system or the database, explain that you don't have access to that information and can only provide results based on the available data.

Begin each response by restating or summarizing the student's query to ensure you've understood it correctly.
`;

export async function POST(req) {
    const data = await req.json();
    const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
    });

    const index = pc.index("rag").namespace("ns1");
    
    const client = new openai({
        apiKey: process.env.OPEN_API_KEY,
    });

    const text = data[data.length - 1].content;
    const embeddingResponse = await client.embeddings.create({
        model: "text-embedding-ada-002",
        input: text,
    });

    const embedding = embeddingResponse.data[0].embedding;

    const results = await index.query({
        topK: 3,
        includeMetadata: true,
        vector: embedding,
    });

    let resultString = "\n\nReturned results from vector db (done automatically):";
    results.matches.forEach((match) => {
        resultString += `\n
        Professor: ${match.id}
        Review: ${match.metadata.review}
        Subject: ${match.metadata.subject}
        Stars: ${match.metadata.stars}
        \n\n`;
    });

    const lastMessage = data[data.length - 1];
    const lastMessageContent = lastMessage.content + resultString;

    const completion = await client.chat.completions.create({
        model: "gpt-4",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: lastMessageContent },
        ],
        stream: true,
    });

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            try {
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content;
                    if (content) {
                        const text = encoder.encode(content);
                        controller.enqueue(text);
                    }
                }
            } catch (err) {
                controller.error(err);
            } finally {
                controller.close();
            }
        },
    });

    return new NextResponse(stream);
}
