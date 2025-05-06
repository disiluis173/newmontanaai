'use client'

import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaKey, FaRobot, FaUser, FaArrowUp, FaCog } from 'react-icons/fa';
import { BiSend } from 'react-icons/bi';
import Message from './Message';
import ApiKeyModal from './ApiKeyModal';
import { useApiKey } from '../context/ApiKeyContext';
import { 
  sendMessageToDeepSeek, 
  sendMessageToXAI,
  streamMessageFromDeepSeek,
  streamMessageFromXAI
} from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const Chat = () => {
  const apiKeyContext = useApiKey();
  
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentProvider, setCurrentProvider] = useState('deepseek');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState('');
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const [hasApiKeyCheck, setHasApiKeyCheck] = useState(false);

  // Verificar si hay API key al iniciar o cambiar de proveedor, pero solo si no hay mensajes
  useEffect(() => {
    // Solo verificamos una vez al inicio o al cambiar de proveedor
    if (!hasApiKeyCheck || currentProvider) {
      const hasKey = apiKeyContext?.apiKeys?.[currentProvider];
      
      // Solo mostramos el modal si no hay API key y no hay mensajes
      if (!hasKey && messages.length === 0) {
        setShowApiKeyModal(true);
      }
      
      setHasApiKeyCheck(true);
    }
  }, [currentProvider, apiKeyContext, messages.length, hasApiKeyCheck]);

  // Scroll al final del chat cuando hay nuevos mensajes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, streamingResponse]);

  // Focus al input cuando se carga la página
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Manejar cambio de proveedor
  const handleProviderChange = (newProvider) => {
    setCurrentProvider(newProvider);
    
    // Solo verificamos si hay API key para el nuevo proveedor si hemos tenido interacción
    if (messages.length > 0 && apiKeyContext?.apiKeys && !apiKeyContext.apiKeys[newProvider]) {
      setShowApiKeyModal(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
    };

    // Verificar si hay una API key configurada
    const apiKey = apiKeyContext?.apiKeys?.[currentProvider];
    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }

    // Actualizar el chat con el mensaje del usuario
    setMessages(prev => [...prev, { ...userMessage, isUser: true }]);
    setInputMessage('');
    setIsLoading(true);
    setStreamingResponse('');

    try {
      // Array de mensajes para la API
      const apiMessages = [...messages.filter(m => !m.isUser), userMessage].map(m => ({
        role: m.role || 'user',
        content: m.content
      }));

      // Streaming de respuesta
      if (currentProvider === 'deepseek') {
        await streamMessageFromDeepSeek(
          apiKey,
          apiMessages,
          (chunk) => {
            setStreamingResponse(prev => prev + chunk);
          }
        );
      } else if (currentProvider === 'xai') {
        await streamMessageFromXAI(
          apiKey,
          apiMessages,
          (chunk) => {
            setStreamingResponse(prev => prev + chunk);
          }
        );
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setStreamingResponse('Error de conexión. Por favor verifica tu API key e intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Cuando termina el streaming, agregamos el mensaje al chat
  useEffect(() => {
    if (!isLoading && streamingResponse) {
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: streamingResponse, 
          provider: currentProvider 
        }
      ]);
      setStreamingResponse('');
    }
  }, [isLoading, streamingResponse, currentProvider]);

  const providerClass = currentProvider === 'deepseek' ? 'from-purple-600 to-indigo-600' : 'from-blue-600 to-blue-800';

  return (
    <div className="flex flex-col h-full">
      {/* Barra superior */}
      <div className={`bg-gradient-to-r ${providerClass} text-white p-4 flex justify-between items-center shadow-md`}>
        <div className="flex items-center gap-2">
          <FaRobot className="text-xl md:text-2xl" />
          <h1 className="text-lg md:text-xl font-bold">Montana AI Chat</h1>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <select
            value={currentProvider}
            onChange={(e) => handleProviderChange(e.target.value)}
            className="bg-white/20 text-white text-sm md:text-base backdrop-blur-sm p-2 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <option value="deepseek">DeepSeek AI</option>
            <option value="xai">X.AI (Grok)</option>
          </select>
          
          <button
            onClick={() => setShowApiKeyModal(true)}
            className="flex items-center gap-1 md:gap-2 bg-white/20 hover:bg-white/30 px-2 md:px-3 py-2 rounded-lg backdrop-blur-sm transition-all duration-200 text-sm md:text-base"
          >
            <FaKey /> <span className="hidden md:inline">API Key</span>
          </button>
        </div>
      </div>

      {/* Contenedor de mensajes */}
      <div 
        ref={chatContainerRef}
        className="flex-grow p-2 md:p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900 dark:text-gray-100"
      >
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div 
              className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className={`p-5 rounded-full bg-gradient-to-r ${providerClass} shadow-lg`}>
                <FaRobot className="text-4xl text-white" />
              </div>
              <div>
                <p className="text-xl md:text-2xl mb-2 font-bold">¡Bienvenido a Montana AI!</p>
                <p className="max-w-md mx-auto text-sm md:text-base">
                  Selecciona un proveedor, configura tu API Key y comienza a chatear 
                  con los modelos de IA más avanzados.
                </p>
              </div>
              <button
                onClick={() => setShowApiKeyModal(true)}
                className={`mt-4 px-4 py-2 bg-gradient-to-r ${providerClass} text-white rounded-lg flex items-center gap-2 hover:shadow-lg transition-all duration-200`}
              >
                <FaKey /> Configurar API Key
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4 py-2">
              {messages.map((message, index) => (
                <Message 
                  key={index} 
                  message={message} 
                  isUser={message.isUser}
                  provider={currentProvider}
                />
              ))}
              {streamingResponse && (
                <Message 
                  message={{ content: streamingResponse, provider: currentProvider }} 
                  isUser={false}
                  isStreaming={true}
                  provider={currentProvider}
                />
              )}
            </div>
          )}
        </AnimatePresence>
        
        {/* Indicador de escritura */}
        {isLoading && !streamingResponse && (
          <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 mt-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span>Pensando...</span>
          </div>
        )}
      </div>

      {/* Formulario de entrada */}
      <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="relative flex-grow">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-gray-700 dark:text-white transition-all"
                disabled={isLoading}
              />
              {inputMessage.length > 0 && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded">Enter ↵</kbd>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Enviar mensaje"
            >
              <BiSend className="text-xl" />
            </button>
          </div>
        </form>
      </div>

      {/* Modal de API key */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => {
          setShowApiKeyModal(false);
        }}
        provider={currentProvider}
      />
    </div>
  );
};

export default Chat; 