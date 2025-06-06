'use client'

import React, { useState, useEffect } from 'react';
import { FaKey, FaEye, FaEyeSlash } from 'react-icons/fa';

const ApiKeyModal = ({ isOpen, onClose, provider }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const savedKey = localStorage.getItem(`${provider}_api_key`);
      if (savedKey) {
        setApiKey(savedKey);
      }
    }
  }, [isOpen, provider]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!apiKey.trim()) {
      setError('Por favor ingresa una API key');
      return;
    }

    try {
      localStorage.setItem(`${provider}_api_key`, apiKey);
      onClose();
    } catch (error) {
      setError('Error al guardar la API key');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Configurar API Key - {provider === 'xai' ? 'Grok' : 'DeepSeek'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`Ingresa tu API key de ${provider === 'xai' ? 'Grok' : 'DeepSeek'}`}
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
            >
              {showKey ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyModal; 