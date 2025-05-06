// Configuración centralizada de modelos y capacidades
export const AI_PROVIDERS = {
  xai: {
    name: 'X.AI (Grok)',
    baseUrl: 'https://api.x.ai/v1',
    defaultModel: 'grok-3-mini-beta',
    models: [
      { 
        id: 'grok-3-beta', 
        name: 'Grok 3 Beta', 
        price: { input: '$3.00', output: '$15.00' }, 
        context: 131072,
        supportsReasoning: true
      },
      { 
        id: 'grok-3-mini-beta', 
        name: 'Grok 3 Mini Beta', 
        price: { input: '$0.30', output: '$0.50' }, 
        context: 131072,
        supportsReasoning: true
      },
      { 
        id: 'grok-3-fast-beta', 
        name: 'Grok 3 Fast Beta', 
        price: { input: '$5.00', output: '$25.00' }, 
        context: 131072,
        supportsReasoning: false
      },
      { 
        id: 'grok-3-mini-fast-beta', 
        name: 'Grok 3 Mini Fast Beta', 
        price: { input: '$0.60', output: '$4.00' }, 
        context: 131072,
        supportsReasoning: true
      },
      { 
        id: 'grok-2-vision-1212', 
        name: 'Grok 2 Vision 1212', 
        price: { input: '$2.00', output: '$10.00' }, 
        context: 32768,
        supportsReasoning: false
      },
      { 
        id: 'grok-2-image-1212', 
        name: 'Grok 2 Image 1212', 
        price: { input: '$0.07', output: '$0.07' }, 
        context: 131072,
        supportsReasoning: false
      },
    ],
    supportsStreaming: true
  },
  deepseek: {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    models: [
      { 
        id: 'deepseek-chat', 
        name: 'DeepSeek Chat', 
        price: { input: '$0.07', output: '$1.10' }, 
        context: 65536,
        supportsReasoning: false
      },
      { 
        id: 'deepseek-reasoner', 
        name: 'DeepSeek Reasoner (R1)', 
        price: { input: '$0.14', output: '$2.19' }, 
        context: 65536,
        supportsReasoning: true
      }
    ],
    // DeepSeek no soporta streaming como X.AI
    supportsStreaming: false
  }
};

// Obtener los modelos disponibles para un proveedor
export const getModelsForProvider = (provider) => {
  return AI_PROVIDERS[provider]?.models || [];
};

// Verificar si un modelo soporta razonamiento
export const modelSupportsReasoning = (provider, modelId) => {
  const models = getModelsForProvider(provider);
  const model = models.find(m => m.id === modelId);
  return model?.supportsReasoning || false;
};

// Obtener el modelo predeterminado para un proveedor
export const getDefaultModelForProvider = (provider) => {
  return AI_PROVIDERS[provider]?.defaultModel;
};

// Verificar si un modelo es válido para un proveedor
export const isValidModelForProvider = (provider, modelId) => {
  const models = getModelsForProvider(provider);
  return models.some(m => m.id === modelId);
};
