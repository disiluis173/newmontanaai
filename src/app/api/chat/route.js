import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Configuración de modelos disponibles
const MODEL_CONFIG = {
  deepseek: {
    default: 'deepseek-chat',
    models: {
      'deepseek-chat': {
        name: 'DeepSeek Chat',
        description: 'Modelo estándar de DeepSeek'
      }
    }
  },
  xai: {
    default: 'grok-3-beta',
    models: {
      'grok-3-beta': {
        name: 'Grok 3 Beta',
        description: 'Modelo estándar de Grok',
        price: { input: '$3.00', output: '$15.00' }
      },
      'grok-3-mini-beta': {
        name: 'Grok 3 Mini Beta',
        description: 'Modelo económico de Grok',
        price: { input: '$0.30', output: '$0.50' }
      },
      'grok-3-fast-beta': {
        name: 'Grok 3 Fast Beta',
        description: 'Modelo rápido de Grok',
        price: { input: '$5.00', output: '$25.00' }
      },
      'grok-3-mini-fast-beta': {
        name: 'Grok 3 Mini Fast Beta',
        description: 'Modelo rápido y económico de Grok',
        price: { input: '$0.60', output: '$4.00' }
      }
    }
  }
};

// Esta API será principalmente para pruebas ya que en producción usaremos
// las API keys del cliente, pero puede servir para pruebas en desarrollo
export async function POST(request) {
  try {
    const { messages, provider, apiKey, model } = await request.json();

    // Validaciones básicas
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key no proporcionada' },
        { status: 400 }
      );
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Los mensajes deben ser un array' },
        { status: 400 }
      );
    }

    let client;
    let selectedModel = model || MODEL_CONFIG[provider]?.default;

    if (provider === 'deepseek') {
      client = new OpenAI({
        baseURL: 'https://api.deepseek.com/v1',
        apiKey: apiKey,
      });
    } else if (provider === 'xai') {
      client = new OpenAI({
        baseURL: 'https://api.x.ai/v1',
        apiKey: apiKey,
      });
    } else {
      return NextResponse.json(
        { error: 'Proveedor no válido' },
        { status: 400 }
      );
    }

    const completion = await client.chat.completions.create({
      model: selectedModel,
      messages: messages,
      stream: true,
      temperature: 0.7, // Ajuste de temperatura para respuestas más naturales
      max_tokens: 2000, // Límite de tokens para la respuesta
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            controller.enqueue(content);
          }
        } catch (error) {
          console.error('Error en el streaming:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error en la API:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Error al procesar la solicitud',
        details: error.response?.data || null
      },
      { status: error.status || 500 }
    );
  }
} 