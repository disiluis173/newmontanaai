'use client'

import React, { createContext, useState, useContext, useEffect } from 'react';

// Contexto simplificado que solo guarda las API keys en memoria
const ApiKeyContext = createContext(null);

export const ApiKeyProvider = ({ children }) => {
  // Cargar API keys desde localStorage al inicio
  const [apiKeys, setApiKeys] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedKeys = localStorage.getItem('apiKeys');
      if (savedKeys) {
        return JSON.parse(savedKeys);
      }
    }
    return {
      deepseek: 'sk-7c1abb9100884a24aea887ad44bd681e',
      xai: 'xai-BEXIv5uiCBXT4ugZIBl9Gt15Ymrx6JvRZDhuEuQJV4sSAD48pgtgAedES5zpmDvbdKzyqPBZ4HophYSB'
    };
  });

  // Guardar en localStorage cuando cambien las API keys
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('apiKeys', JSON.stringify(apiKeys));
    }
  }, [apiKeys]);

  const updateApiKey = (provider, key) => {
    try {
      console.log(`Actualizando ${provider} API Key:`, key.substring(0, 6) + '...');
      setApiKeys(prev => {
        const newKeys = {
          ...prev,
          [provider]: key
        };
        // Guardar inmediatamente en localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('apiKeys', JSON.stringify(newKeys));
        }
        return newKeys;
      });
      return true; // Indicar éxito
    } catch (error) {
      console.error('Error al actualizar API key:', error);
      return false; // Indicar fallo
    }
  };

  // Verificar que el contexto esté disponible
  if (!ApiKeyContext) {
    console.error('Error: El contexto de API Key no está disponible');
    return children;
  }

  return (
    <ApiKeyContext.Provider value={{ apiKeys, updateApiKey }}>
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKey = () => {
  const context = useContext(ApiKeyContext);
  if (!context) {
    console.error('Error: useApiKey debe ser usado dentro de un ApiKeyProvider');
    return { apiKeys: {}, updateApiKey: () => false };
  }
  return context;
}; 