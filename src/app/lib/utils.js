import OpenAI from 'openai';

// Cliente para DeepSeek
export const createDeepSeekClient = (apiKey) => {
  return new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: apiKey,
  });
};

// Cliente para X.AI (Grok)
export const createXAIClient = (apiKey) => {
  return new OpenAI({
    baseURL: 'https://api.x.ai/v1',
    apiKey: apiKey,
  });
};

// Función para enviar un mensaje a DeepSeek
export const sendMessageToDeepSeek = async (apiKey, messages) => {
  try {
    const client = createDeepSeekClient(apiKey);
    const completion = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages,
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error al comunicarse con DeepSeek:', error);
    throw error;
  }
};

// Función para enviar un mensaje a X.AI (Grok)
export const sendMessageToXAI = async (apiKey, messages) => {
  try {
    const client = createXAIClient(apiKey);
    const completion = await client.chat.completions.create({
      model: 'grok-3-beta',
      messages,
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error al comunicarse con X.AI:', error);
    throw error;
  }
};

// Función para enviar un mensaje con streaming a DeepSeek
export const streamMessageFromDeepSeek = async (apiKey, messages, onChunk) => {
  try {
    const client = createDeepSeekClient(apiKey);
    const stream = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0].delta.content;
      if (content) {
        onChunk(content);
      }
    }
  } catch (error) {
    console.error('Error al hacer streaming con DeepSeek:', error);
    throw error;
  }
};

// Función para enviar un mensaje con streaming a X.AI (Grok)
export const streamMessageFromXAI = async (apiKey, messages, onChunk) => {
  try {
    const client = createXAIClient(apiKey);
    const stream = await client.chat.completions.create({
      model: 'grok-3-beta',
      messages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0].delta.content;
      if (content) {
        onChunk(content);
      }
    }
  } catch (error) {
    console.error('Error al hacer streaming con X.AI:', error);
    throw error;
  }
}; 