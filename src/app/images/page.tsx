'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
import { 
  FaImage, 
  FaKey, 
  FaSpinner, 
  FaDownload, 
  FaPlus, 
  FaMinus, 
  FaCog,
  FaArrowLeft
} from 'react-icons/fa';
import { saveAs } from 'file-saver';
import Link from 'next/link';
import Image from 'next/image';
import ApiKeyModal from '../components/ApiKeyModal';
import UnlockModal from '../components/UnlockModal';

export default function ImagesPage() {
  const [prompt, setPrompt] = useState('');
  const [imageCount, setImageCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<Array<{url?: string, b64_json?: string, revised_prompt?: string}>>([]);
  const [error, setError] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [responseFormat, setResponseFormat] = useState<'url' | 'b64_json'>('url');
  const [showSettings, setShowSettings] = useState(false);
  const [apiStatus, setApiStatus] = useState(false);
  const [dailyGenerations, setDailyGenerations] = useState(0);
  const [unlimitedMode, setUnlimitedMode] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [blockUntil, setBlockUntil] = useState<number | null>(null);
  const [blockDuration, setBlockDuration] = useState(12); // Horas iniciales de bloqueo
  
  // Límite diario de generaciones
  const DAILY_LIMIT = 10;
  const BLOCK_INCREMENT = 12; // Incremento en horas por cada intento adicional

  // Verificar si hay API key al iniciar y cargar contadores
  useEffect(() => {
    // Verificar API key
    const hasKey = localStorage.getItem('xai_api_key');
    if (!hasKey) {
      setShowApiKeyModal(true);
    } else {
      // Verificar API status
      checkApiStatus();
    }
    
    // Cargar contadores de generación
    loadGenerationCounters();
  }, []);
  
  // Función para cargar los contadores de generación
  const loadGenerationCounters = () => {
    try {
      // Obtener fecha actual en formato YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().getTime();
      
      // Obtener datos almacenados
      const storedData = localStorage.getItem('image_generation_data');
      if (storedData) {
        const data = JSON.parse(storedData);
        
        // Si los datos son de hoy, cargar contador
        if (data.date === today) {
          setDailyGenerations(data.count);
        } else {
          // Si son de otro día, reiniciar contador
          setDailyGenerations(0);
          localStorage.setItem('image_generation_data', JSON.stringify({
            date: today,
            count: 0,
            unlimited: data.unlimited || false,
            blockUntil: data.blockUntil || null,
            blockDuration: data.blockDuration || 12
          }));
        }
        
        // Cargar estado de modo ilimitado
        setUnlimitedMode(data.unlimited || false);
        
        // Cargar tiempo de bloqueo si existe
        if (data.blockUntil) {
          // Si ya pasó el tiempo de bloqueo, resetear
          if (data.blockUntil < now) {
            setBlockUntil(null);
            setBlockDuration(12); // Reiniciar duración de bloqueo
          } else {
            setBlockUntil(data.blockUntil);
            setBlockDuration(data.blockDuration || 12);
          }
        }
      } else {
        // Inicializar datos si no existen
        localStorage.setItem('image_generation_data', JSON.stringify({
          date: today,
          count: 0,
          unlimited: false,
          blockUntil: null,
          blockDuration: 12
        }));
      }
    } catch (error) {
      console.error('Error al cargar contadores de generación:', error);
    }
  };
  
  // Función para actualizar el tiempo de bloqueo
  const increaseBlockTime = () => {
    try {
      const now = new Date().getTime();
      const newDuration = blockDuration + BLOCK_INCREMENT;
      const newBlockUntil = now + (newDuration * 60 * 60 * 1000); // Convertir horas a milisegundos
      
      setBlockDuration(newDuration);
      setBlockUntil(newBlockUntil);
      
      // Actualizar localStorage
      const storedData = localStorage.getItem('image_generation_data');
      const data = storedData ? JSON.parse(storedData) : {};
      const today = new Date().toISOString().split('T')[0];
      
      localStorage.setItem('image_generation_data', JSON.stringify({
        ...data,
        date: today,
        blockUntil: newBlockUntil,
        blockDuration: newDuration
      }));
      
      return newBlockUntil;
    } catch (error) {
      console.error('Error al actualizar tiempo de bloqueo:', error);
      return null;
    }
  };
  
  // Función para formatear el tiempo restante de bloqueo
  const formatTimeRemaining = (blockUntilTime: number) => {
    const now = new Date().getTime();
    const diff = blockUntilTime - now;
    
    if (diff <= 0) return 'Desbloqueado';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours} hora${hours !== 1 ? 's' : ''} y ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
  };
  
  // Función para actualizar el contador de generaciones
  const updateGenerationCount = (count: number) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const newCount = dailyGenerations + count;
      setDailyGenerations(newCount);
      
      // Actualizar localStorage
      const storedData = localStorage.getItem('image_generation_data');
      const data = storedData ? JSON.parse(storedData) : { 
        unlimited: false,
        blockUntil: null,
        blockDuration: 12
      };
      
      // Si alcanzó el límite, establecer bloqueo inicial de 12 horas
      let newBlockUntil = data.blockUntil;
      let newBlockDuration = data.blockDuration;
      
      if (newCount >= DAILY_LIMIT && !blockUntil) {
        const now = new Date().getTime();
        newBlockUntil = now + (12 * 60 * 60 * 1000); // 12 horas en milisegundos
        newBlockDuration = 12;
        setBlockUntil(newBlockUntil);
        setBlockDuration(newBlockDuration);
      }
      
      localStorage.setItem('image_generation_data', JSON.stringify({
        date: today,
        count: newCount,
        unlimited: data.unlimited || false,
        blockUntil: newBlockUntil,
        blockDuration: newBlockDuration
      }));
    } catch (error) {
      console.error('Error al actualizar contador de generaciones:', error);
    }
  };
  
  // Función para desbloquear modo ilimitado
  const unlockUnlimitedMode = () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      setUnlimitedMode(true);
      setBlockUntil(null); // Eliminar bloqueo actual si existe
      
      // Actualizar localStorage
      const storedData = localStorage.getItem('image_generation_data');
      const data = storedData ? JSON.parse(storedData) : { 
        count: dailyGenerations,
        blockDuration: 12 
      };
      
      localStorage.setItem('image_generation_data', JSON.stringify({
        date: today,
        count: data.count,
        unlimited: true,
        blockUntil: null,
        blockDuration: data.blockDuration
      }));
    } catch (error) {
      console.error('Error al desbloquear modo ilimitado:', error);
    }
  };

  // Función para verificar estado de la API
  const checkApiStatus = async () => {
    try {
      const apiKey = localStorage.getItem('xai_api_key');
      if (!apiKey) {
        setApiStatus(false);
        return;
      }
      
      // Hacer una pequeña solicitud para validar que la API key funciona
      const response = await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: "test",
          n: 1,
          apiKey
        })
      });
      
      setApiStatus(response.ok);
    } catch {
      // Ignoramos el error específico pero marcamos la API como no disponible
      setApiStatus(false);
    }
  };

  // Función para generar imágenes
  const generateImages = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Por favor ingresa un prompt para generar imágenes');
      return;
    }
    
    // Verificar si está bloqueado por tiempo
    const now = new Date().getTime();
    if (!unlimitedMode && blockUntil && blockUntil > now) {
      setError(`Generador bloqueado por ${formatTimeRemaining(blockUntil)}. Introduce la contraseña para desbloquear.`);
      setShowUnlockModal(true);
      return;
    }
    
    // Verificar límite diario
    if (!unlimitedMode && dailyGenerations >= DAILY_LIMIT) {
      // Si ya está en el límite pero no hay bloqueo activo, activar bloqueo inicial
      if (!blockUntil) {
        const newBlockUntil = increaseBlockTime();
        setError(`Límite alcanzado. Generador bloqueado por ${formatTimeRemaining(newBlockUntil!)}. Introduce la contraseña para desbloquear.`);
      } else {
        // Si ya hay bloqueo, incrementar el tiempo
        const newBlockUntil = increaseBlockTime();
        setError(`Intento de generar durante bloqueo. Tiempo incrementado a ${formatTimeRemaining(newBlockUntil!)}. Introduce la contraseña para desbloquear.`);
      }
      
      setShowUnlockModal(true);
      return;
    }
    
    setIsLoading(true);
    setError('');
    setImages([]);
    
    try {
      const apiKey = localStorage.getItem('xai_api_key');
      if (!apiKey) {
        setShowApiKeyModal(true);
        setIsLoading(false);
        return;
      }
      
      const response = await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          n: imageCount,
          response_format: responseFormat,
          apiKey
        })
      });
      
      if (!response.ok) {
        let errorMsg = 'Error al generar imágenes';
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch {
          // Ignoramos errores al intentar parsear la respuesta de error
        }
        
        setError(errorMsg);
        setIsLoading(false);
        return;
      }
      
      const data = await response.json();
      setImages(data.data || []);
      
      // Actualizar contador de generaciones
      if (!unlimitedMode) {
        updateGenerationCount(imageCount);
      }
    } catch (error: any) {
      // Ya tenemos deshabilitado el eslint para any en la parte superior del archivo
      setError(error?.message || 'Ocurrió un error al generar las imágenes');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para descargar una imagen
  const downloadImage = async (imageUrl: string, index: number) => {
    try {
      if (responseFormat === 'b64_json' && images[index]?.b64_json) {
        // Descargar directamente desde base64
        const byteString = atob(images[index].b64_json!.split(',')[1]);
        const mimeString = images[index].b64_json!.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        
        const blob = new Blob([ab], { type: mimeString });
        saveAs(blob, `grok-image-${index+1}.jpg`);
      } else {
        // Usar nuestro proxy para evitar problemas de CORS
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(imageUrl)}`;
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
          throw new Error('Error al descargar la imagen');
        }
        
        const blob = await response.blob();
        saveAs(blob, `grok-image-${index+1}.jpg`);
      }
    } catch (error) {
      console.error('Error al descargar imagen:', error);
      setError('No se pudo descargar la imagen');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex-none p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center sm:justify-start">
            <Link 
              href="/"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-2 sm:mb-0"
            >
              <FaArrowLeft /> <span>Volver al Chat</span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent text-center sm:text-left truncate">
              Montana AI - Generador de Imágenes
            </h1>
          </div>
          
          <div className="flex items-center gap-2 mt-3 sm:mt-0">
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-1"
                title="Configuración"
              >
                <FaCog />
                <span className="text-xs hidden sm:inline">Configuración</span>
              </button>
              {showSettings && (
                <div className="absolute right-0 sm:right-0 top-full mt-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 w-64 max-w-[calc(100vw-2rem)]">
                  <h3 className="font-semibold mb-2">Configuración</h3>
                  <div className="mb-3">
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Formato de respuesta:
                    </label>
                    <select
                      value={responseFormat}
                      onChange={(e) => setResponseFormat(e.target.value as 'url' | 'b64_json')}
                      className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                    >
                      <option value="url">URL (más rápido)</option>
                      <option value="b64_json">Base64 (más seguro)</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${apiStatus ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-sm">
                        {apiStatus ? 'API conectada' : 'API no conectada'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowApiKeyModal(true)}
                    className="w-full px-3 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Configurar API Key
                  </button>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowApiKeyModal(true)}
              className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1"
              title="Configurar API Key"
            >
              <FaKey />
              <span className="text-xs hidden sm:inline">API Key</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 px-2 sm:px-4">
          {/* Formulario de generación */}
          <form onSubmit={generateImages} className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md image-form">
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium text-center sm:text-left">
                Describe la imagen que quieres generar:
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ej: Un gato siamés durmiendo en una canasta bajo la luz del sol..."
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24 sm:min-h-32"
                rows={4}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
              <div className="w-full sm:w-auto">
                <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm text-center sm:text-left">
                  Número de imágenes (1-10):
                </label>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={() => setImageCount(prev => Math.max(1, prev - 1))}
                    className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                    disabled={imageCount <= 1}
                  >
                    <FaMinus />
                  </button>
                  <span className="w-8 text-center font-medium">{imageCount}</span>
                  <button
                    type="button"
                    onClick={() => setImageCount(prev => Math.min(10, prev + 1))}
                    className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                    disabled={imageCount >= 10}
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
              
              <div className="w-full sm:w-auto sm:ml-auto mt-4 sm:mt-0">
                <button
                  type="submit"
                  disabled={isLoading || !prompt.trim()}
                  className="w-full sm:w-auto px-4 sm:px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Generando...</span>
                    </>
                  ) : (
                    <>
                      <FaImage />
                      <span>Generar {imageCount > 1 ? `${imageCount} imágenes` : 'imagen'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200">
                {error}
              </div>
            )}
          </form>
          
          {/* Galería de imágenes generadas */}
          {images.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 text-center sm:text-left">
                Imágenes Generadas ({images.length})
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {images.map((image, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="relative aspect-square">
                      <Image
                        src={image.url || image.b64_json || ''}
                        alt={`Imagen generada ${index + 1}`}
                        className="w-full h-full object-cover"
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        priority={index < 2}
                      />
                      <div className="absolute bottom-2 right-2 flex gap-2">
                        <button
                          onClick={() => downloadImage(image.url || image.b64_json || '', index)}
                          className="p-2 rounded-full bg-gray-800 bg-opacity-70 text-white hover:bg-opacity-90"
                          title="Descargar imagen"
                        >
                          <FaDownload />
                        </button>
                      </div>
                    </div>
                    {image.revised_prompt && (
                      <div className="p-3 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 break-words">
                        <p className="font-medium mb-1">Prompt revisado:</p>
                        <p>{image.revised_prompt}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Mensaje de bienvenida cuando no hay imágenes */}
          {!isLoading && images.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500 dark:text-gray-400 gap-4 sm:gap-6 px-4">
              <div className="p-4 sm:p-6 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 shadow-xl">
                <FaImage className="text-4xl sm:text-5xl text-white" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold mb-2">¡Bienvenido al Generador de Imágenes!</p>
                <p className="max-w-md mx-auto text-sm sm:text-base">
                  Utiliza el poder de Grok 2 Image para crear imágenes asombrosas a partir de tus descripciones.
                  Cada imagen generada cuesta $0.07.
                </p>
                <div className="mt-4 text-center">
                  {unlimitedMode ? (
                    <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs sm:text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                      </svg>
                      <span className="whitespace-nowrap">Modo Ilimitado Activado</span>
                    </span>
                  ) : blockUntil && blockUntil > new Date().getTime() ? (
                    <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs sm:text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                      <span className="whitespace-nowrap">Bloqueado por {formatTimeRemaining(blockUntil)}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-xs sm:text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                      <span className="whitespace-nowrap">{dailyGenerations} de {DAILY_LIMIT} imágenes generadas hoy</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal para API Key */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => {
          setShowApiKeyModal(false);
          checkApiStatus();
        }}
        provider="xai"
      />
      
      {/* Modal para desbloqueo */}
      <UnlockModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        onUnlock={unlockUnlimitedMode}
      />
    </div>
  );
}
