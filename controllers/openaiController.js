/* import { Configuration, OpenAIApi } from 'openai';
import 'dotenv/config';

// Configurar cliente OpenAI
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Crear un nuevo hilo
export async function createThread() {
    try {
        console.log('Creating a new thread...');
        const response = await openai.createChatCompletion({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant. This is the start of a new thread.',
                },
            ],
        });
        console.log('Thread created:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating thread:', error.response?.data || error.message);
        throw error;
    }
}
 */