'use client'

import React, { createContext, useState, useContext } from 'react';

// Contexto simplificado que solo guarda las API keys en memoria
const ApiKeyContext = createContext(null);

export const ApiKeyProvider = ({ children }) => {
  // Valores predeterminados (puedes poner tus claves API aquí si quieres)
  const [apiKeys, setApiKeys] = useState({
    deepseek: '',  // sk-7c1abb9......
    xai: '',       // xai-BEXIv5uiCBX
  });

  const updateApiKey = (provider, key) => {
    console.log(`Actualizando ${provider} API Key:`, key.substring(0, 6) + '...');
    setApiKeys(prev => ({
      ...prev,
      [provider]: key
    }));
  };

  return (
    <ApiKeyContext.Provider value={{ apiKeys, updateApiKey }}>
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKey = () => useContext(ApiKeyContext); 