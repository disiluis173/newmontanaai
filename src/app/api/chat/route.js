import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AI_PROVIDERS, isValidModelForProvider, getDefaultModelForProvider } from '../../config/models';

// Esta API será principalmente para pruebas ya que en producción usaremos
// las API keys del cliente, pero puede servir para pruebas en desarrollo
export async function POST(req) {
  try {
    const { messages, provider, model, reasoningLevel, stream, apiKey, max_tokens } = await req.json();

    // Verificación básica de datos
    if (!apiKey) {
      return NextResponse.json({ error: 'API key no proporcionada' }, { status: 401 });
    }
    
    if (!provider || !AI_PROVIDERS[provider]) {
      return NextResponse.json({ error: 'Proveedor no válido' }, { status: 400 });
    }

    // Asegurar que usemos el modelo correcto para cada proveedor
    let modelToUse = model;
    
    // Si el modelo no está en la lista de modelos admitidos para este proveedor, usar el predeterminado
    if (!isValidModelForProvider(provider, modelToUse)) {
      modelToUse = getDefaultModelForProvider(provider);
    }

    // Configuración específica de cada proveedor
    const providerConfig = AI_PROVIDERS[provider];
    
    const openai = new OpenAI({
      apiKey,
      baseURL: providerConfig.baseUrl
    });

    // Verificar si el proveedor soporta streaming
    const useStream = providerConfig.supportsStreaming ? stream : false;

    // Parámetros básicos para ambos proveedores
    const params = {
      model: modelToUse,
      messages,
      stream: useStream
    };

    // Parámetros específicos para X.AI (Grok)
    if (provider === 'xai') {
      // Solo agregar reasoning_effort si está activado
      if (reasoningLevel) {
        params.reasoning_effort = reasoningLevel;
      }
      // Solo agregar max_tokens si está especificado
      if (max_tokens) {
        params.max_tokens = max_tokens;
      }
    }
    
    // No hay parámetros adicionales específicos para DeepSeek por ahora

    const response = await openai.chat.completions.create(params);

    // Solo manejamos streaming para X.AI
    if (useStream && provider === 'xai') {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of response) {
              const data = JSON.stringify(chunk);
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          } catch (error) {
            console.error('Error en streaming:', error);
            // Enviar error al cliente
            const errorData = JSON.stringify({ error: error.message });
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          } finally {
            controller.close();
          }
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error en la API:', error);
    return NextResponse.json(
      { error: error.message || 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
} 