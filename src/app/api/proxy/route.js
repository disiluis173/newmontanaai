import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    // Obtener la URL de la imagen de la consulta
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get('url');
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'URL de imagen no proporcionada' }, { status: 400 });
    }
    
    // Verificar que la URL sea válida
    if (!imageUrl.startsWith('http')) {
      return NextResponse.json({ error: 'URL de imagen inválida' }, { status: 400 });
    }
    
    // Descargar la imagen del servidor externo
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: 'No se pudo descargar la imagen' }, { status: response.status });
    }
    
    // Obtener el tipo de contenido y los bytes de la imagen
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();
    
    // Devolver la imagen como respuesta
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error en el proxy de imagen:', error);
    return NextResponse.json({ error: 'Error al procesar la imagen' }, { status: 500 });
  }
}
