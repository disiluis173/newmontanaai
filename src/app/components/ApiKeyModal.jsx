'use client'

import React, { useState, useEffect } from 'react';
import { useApiKey } from '../context/ApiKeyContext';
import { FaKey, FaTimes, FaSave, FaCheck } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ApiKeyModal = ({ isOpen, onClose, provider }) => {
  const apiKeyContext = useApiKey();
  const [apiKey, setApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Obtener API key actual al abrir
  useEffect(() => {
    if (isOpen && apiKeyContext?.apiKeys) {
      setApiKey(apiKeyContext.apiKeys[provider] || '');
    }
  }, [isOpen, apiKeyContext, provider]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Guardar API key 
    if (apiKeyContext?.updateApiKey) {
      apiKeyContext.updateApiKey(provider, apiKey);
      setSaved(true);
      
      // Cerrar el modal después de un breve retraso
      setTimeout(() => {
        onClose();
        setTimeout(() => {
          setIsSaving(false);
          setSaved(false);
        }, 300);
      }, 800);
    } else {
      setIsSaving(false);
      alert("No se pudo acceder al contexto de API Key. Inténtalo de nuevo.");
    }
  };

  const providerName = provider === 'deepseek' ? 'DeepSeek' : provider === 'xai' ? 'X.AI (Grok)' : provider;
  const providerColor = provider === 'deepseek' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700';
  const placeholder = provider === 'deepseek' ? 'sk-7c1abb9...' : provider === 'xai' ? 'xai-BEXIv5uiCBX...' : '';

  return (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <FaKey className={`text-2xl ${provider === 'deepseek' ? 'text-purple-500' : 'text-blue-500'}`} />
            <h2 className="text-xl font-bold dark:text-white">API Key: {providerName}</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white transition-colors"
            disabled={isSaving}
          >
            <FaTimes className="text-xl" />
          </button>
        </div>
        
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-200 text-sm">
          <p>
            {provider === 'deepseek' ? 
              'Las API keys de DeepSeek comienzan con "sk-..."' : 
              'Las API keys de X.AI comienzan con "xai-..."'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tu API Key
            </label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder={placeholder}
              disabled={isSaving || saved}
              required
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Esta API Key se guardará solo durante esta sesión.
            </p>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              disabled={isSaving || saved}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || !apiKey.trim() || saved}
              className={`px-4 py-2 ${providerColor} text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSaving ? (
                saved ? (
                  <>
                    <FaCheck className="text-green-200" /> Guardado
                  </>
                ) : (
                  <>Guardando...</>
                )
              ) : (
                <>
                  <FaSave /> Guardar
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ApiKeyModal; 