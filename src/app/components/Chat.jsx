'use client'

import React, { useState, useRef, useEffect } from 'react';
import { 
  FaPaperPlane, 
  FaKey, 
  FaRobot, 
  FaUser, 
  FaArrowUp, 
  FaCog,
  FaCopy,
  FaDownload,
  FaTrash,
  FaCode,
  FaMarkdown,
  FaFilePdf,
  FaFileAlt,
  FaFileCode
} from 'react-icons/fa';
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
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { saveAs } from 'file-saver';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const Chat = () => {
  const apiKeyContext = useApiKey();
  
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentProvider, setCurrentProvider] = useState('deepseek');
  const [currentModel, setCurrentModel] = useState('deepseek-chat');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState('');
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const [hasApiKeyCheck, setHasApiKeyCheck] = useState(false);

  // Nuevo estado para las opciones de código
  const [codeOptions, setCodeOptions] = useState({
    show: false,
    content: '',
    language: 'javascript',
    position: { x: 0, y: 0 }
  });

  // Configuración de modelos disponibles
  const MODEL_CONFIG = {
    deepseek: {
      'deepseek-chat': {
        name: 'DeepSeek Chat',
        description: 'Modelo estándar de DeepSeek'
      }
    },
    xai: {
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
  };

  // Actualizar el modelo cuando cambie el proveedor
  useEffect(() => {
    setCurrentModel(MODEL_CONFIG[currentProvider]?.default || '');
  }, [currentProvider]);

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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages.filter(m => !m.isUser), userMessage].map(m => ({
            role: m.role || 'user',
            content: m.content
          })),
          provider: currentProvider,
          apiKey: apiKey,
          model: currentModel
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en la respuesta del servidor');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        try {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          setStreamingResponse(prev => prev + chunk);
        } catch (error) {
          console.error('Error al leer el stream:', error);
          throw new Error('Error al recibir la respuesta del servidor');
        }
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setStreamingResponse(`Error: ${error.message}. Por favor verifica tu API key e intenta nuevamente.`);
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

  // Función para copiar código
  const copyCode = (content, withMarkdown = false) => {
    const text = withMarkdown ? `\`\`\`${codeOptions.language}\n${content}\n\`\`\`` : content;
    navigator.clipboard.writeText(text);
  };

  // Función para descargar chat en PDF
  const downloadChatPDF = () => {
    const content = messages.map(msg => 
      `${msg.isUser ? 'Usuario' : 'Asistente'}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'chat-conversation.txt');
  };

  // Función para limpiar el chat
  const clearChat = () => {
    if (window.confirm('¿Estás seguro de que quieres borrar toda la conversación?')) {
      setMessages([]);
    }
  };

  // Función para detectar y formatear código
  const formatMessage = (content) => {
    const codeBlocks = content.match(/```([\s\S]*?)```/g);
    if (!codeBlocks) return content;

    let formattedContent = content;
    codeBlocks.forEach(block => {
      const language = block.match(/```(\w+)/)?.[1] || 'plaintext';
      const code = block.replace(/```\w*\n?/, '').replace(/```$/, '');
      formattedContent = formattedContent.replace(
        block,
        `<div class="code-block" data-language="${language}">${code}</div>`
      );
    });

    return formattedContent;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex-none p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent text-center sm:text-left">
              Montana AI
            </h1>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <div className="w-full sm:w-auto">
                <select
                  value={currentProvider}
                  onChange={(e) => setCurrentProvider(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                >
                  <option value="deepseek">DeepSeek</option>
                  <option value="xai">X.AI (Grok)</option>
                </select>
              </div>
              {currentProvider === 'xai' && (
                <div className="w-full sm:w-auto">
                  <div className="flex flex-col gap-1">
                    <select
                      value={currentModel}
                      onChange={(e) => setCurrentModel(e.target.value)}
                      className="w-full sm:w-auto px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    >
                      {Object.entries(MODEL_CONFIG.xai).map(([key, model]) => (
                        <option key={key} value={key}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                    {currentModel && MODEL_CONFIG.xai[currentModel]?.price && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
                        Precio: {MODEL_CONFIG.xai[currentModel].price.input} / {MODEL_CONFIG.xai[currentModel].price.output}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end mt-2 sm:mt-0">
            <button
              onClick={() => setShowApiKeyModal(true)}
              className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
              title="Configurar API Key"
            >
              <FaKey />
            </button>
            <button
              onClick={clearChat}
              className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
              title="Limpiar chat"
            >
              <FaTrash />
            </button>
            <button
              onClick={downloadChatPDF}
              className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white"
              title="Exportar chat"
            >
              <FaDownload />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 gap-6">
              <div className="p-6 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 shadow-xl">
                <FaRobot className="text-5xl text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold mb-2">¡Bienvenido a Montana AI!</p>
                <p className="max-w-md mx-auto">
                  Selecciona un proveedor, configura tu API Key y comienza a chatear 
                  con los modelos de IA más avanzados.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <Message
                key={index}
                message={message}
                isUser={message.role === 'user'}
                provider={currentProvider}
                isStreaming={false}
                onCodeBlockClick={copyCode}
              />
            ))
          )}
        </div>
      </div>

      <div className="flex-none p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Enviando...' : 'Enviar'}
            </button>
          </form>
        </div>
      </div>

      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        provider={currentProvider}
      />
    </div>
  );
};

export default Chat; 