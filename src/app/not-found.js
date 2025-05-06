import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Página no encontrada</h1>
      <p className="text-lg mb-6">No pudimos encontrar la página que estás buscando.</p>
      <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Volver al inicio
      </Link>
    </div>
  );
} 