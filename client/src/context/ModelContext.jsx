import React, { createContext, useContext, useState, useEffect } from 'react';

const ModelContext = createContext();

export const useModel = () => {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error('useModel must be used within a ModelProvider');
  }
  return context;
};

export const ModelProvider = ({ children }) => {
  const [selectedModel, setSelectedModel] = useState(() => {
    // Load from localStorage or default to ollama
    return localStorage.getItem('pharmalens_model') || 'ollama';
  });

  useEffect(() => {
    // Save to localStorage whenever model changes
    localStorage.setItem('pharmalens_model', selectedModel);
  }, [selectedModel]);

  const getModelConfig = () => {
    const configs = {
      ollama: {
        provider: 'ollama',
        displayName: 'Llama 3 (Secure)',
        description: 'HIPAA-compliant, runs locally',
        icon: '🔒',
        cost: 'Free'
      },
      openai: {
        provider: 'openai',
        displayName: 'GPT-4 (Cloud)',
        description: 'OpenAI\'s most advanced model',
        icon: '☁️',
        cost: '$0.01-0.03/1K tokens'
      }
    };

    return configs[selectedModel] || configs.ollama;
  };

  const value = {
    selectedModel,
    setSelectedModel,
    modelConfig: getModelConfig(),
    availableModels: ['ollama', 'openai']
  };

  return (
    <ModelContext.Provider value={value}>
      {children}
    </ModelContext.Provider>
  );
};
