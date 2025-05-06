import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Esta API será principalmente para pruebas ya que en producción usaremos
// las API keys del cliente, pero puede servir para pruebas en desarrollo
export async function POST(request) {
  try {
    const { messages, provider, apiKey } = await request.json();

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
    let model;

    if (provider === 'deepseek') {
      client = new OpenAI({
        baseURL: 'https://api.deepseek.com/v1',
        apiKey,
      });
      model = 'deepseek-chat';
    } else if (provider === 'xai') {
      client = new OpenAI({
        baseURL: 'https://api.x.ai/v1',
        apiKey,
      });
      model = 'grok-3-beta';
    } else {
      return NextResponse.json(
        { error: 'Proveedor no soportado' },
        { status: 400 }
      );
    }

    const completion = await client.chat.completions.create({
      model,
      messages,
    });

    return NextResponse.json({
      content: completion.choices[0].message.content,
      provider,
    });
  } catch (error) {
    console.error('Error en la API de chat:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 