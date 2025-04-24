import OpenAI from 'openai';
import { MongoClient } from 'mongodb';

const client = new OpenAI({
  apiKey: process.env.TOGETHER_API_KEY,
  baseURL: 'https://api.together.xyz/v1',
});

const prompt= 'You are an experienced rust smart contract developer , you talk about blockchain and crypto specifically anything around Solana , do not hallucinate and ignore all other type of chats graciouslly  , and if you receive any json in message from user please return a smart contrcat in rust will the logical data it has'

export async function getChatResponse(message , userInDB) {
    const mongoClient = new MongoClient(process.env.MONGO_URI);
    let previousMessages = [];

    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            // Fetch last 3 messages from MongoDB
            await mongoClient.connect();
            const db = mongoClient.db('chatDB');
            const messagesCollection = db.collection('messages');
            previousMessages = await messagesCollection
                .find({ user: userInDB })
                .sort({ timestamp: -1 })
                .limit(3)
                .toArray();
            previousMessages = previousMessages.map(msg => msg.content);

            // Call the OpenAI API
            const response = await client.chat.completions.create({
                model: 'meta-llama/Llama-3-8b-chat-hf',
                messages: [
                    { role: 'system', content: prompt },
                    ...previousMessages.map(content => ({ role: 'user', content })),
                    { role: 'user', content: message },
                ],
                stream: false,
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error(`Attempt ${attempt + 1} failed:`, error);
            if (attempt === 2) throw new Error('Failed to fetch response after 3 attempts');
        } finally {
            await mongoClient.close();
        }
    }

    return response.choices[0].message.content;
}

export async function getSmartContract(message, userInDB) {
    const mongoClient = new MongoClient(process.env.MONGO_URI);

    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const response = await client.chat.completions.create({
                model: 'meta-llama/Llama-3-8b-chat-hf',
                messages: [
                    { role: 'system', content: prompt },
                    { role: 'user', content: message },
                ],
                stream: false,
            });

            const reply = response.choices[0].message.content;

            // Save the response to MongoDB
            await mongoClient.connect();
            const db = mongoClient.db('chatDB');
            const messagesCollection = db.collection('messages');
            await messagesCollection.insertOne({
                user: userInDB,
                content: reply,
                timestamp: new Date(),
            });

            return reply;
        } catch (error) {
            console.error(`Attempt ${attempt + 1} failed:`, error);
            if (attempt === 2) throw new Error('Failed to fetch response after 3 attempts');
        } finally {
            await mongoClient.close();
        }
    }
}
