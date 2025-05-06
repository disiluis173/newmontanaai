import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AI_PROVIDERS } from '../../config/models';

export async function POST(req) {
  try {
    const { prompt, n, response_format, apiKey } = await req.json();

    // Validación básica
    if (!apiKey) {
      return NextResponse.json({ error: 'API key no proporcionada' }, { status: 401 });
    }

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Se requiere un prompt válido' }, { status: 400 });
    }

    // Crear cliente de OpenAI específicamente para X.AI (Grok)
    const openai = new OpenAI({
      apiKey,
      baseURL: AI_PROVIDERS.xai.baseUrl
    });

    // Configurar parámetros para la generación de imágenes
    const params = {
      model: "grok-2-image", // Modelo específico para generación de imágenes
      prompt: prompt,
      n: n || 1, // Por defecto, generar 1 imagen
      response_format: response_format || "url" // Por defecto, devolver URL
    };

    // Llamar a la API para generar imágenes
    const response = await openai.images.generate(params);

    // Devolver la respuesta
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error en la generación de imágenes:', error);
    
    // Parsear errores de OpenAI 
    let errorMessage = 'Error al procesar la solicitud de imagen';
    let statusCode = 500;
    
    try {
      // Intentar obtener más detalles del error
      if (error.response) {
        errorMessage = error.response.data?.error?.message || errorMessage;
        statusCode = error.response.status || statusCode;
      } else if (error.status) {
        errorMessage = error.message || errorMessage;
        statusCode = error.status || statusCode;
      } else if (error.message) {
        errorMessage = error.message;
      }
    } catch (e) {
      console.error('Error adicional al procesar el error original:', e);
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
