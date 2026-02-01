// Environment utility for managing API keys
export const getApiKeys = () => {
  return {
    gemini: process.env.GEMINI_API_KEY || process.env.API_KEY || '',
    groq: process.env.GROQ_API_KEY || '',
    autonoma: {
      clientId: process.env.AUTONOMA_CLIENT_ID || '',
      secretId: process.env.AUTONOMA_SECRET_ID || ''
    }
  };
};

export const validateApiKey = (key: string, type: 'gemini' | 'groq') => {
  if (!key || key.trim() === '') {
    return { valid: false, error: `${type.toUpperCase()} API key is required` };
  }
  
  // Basic validation for API key format
    if (type === 'gemini' && !key.startsWith('AIza')) {
    return { valid: false, error: 'Invalid Gemini API key format' };
  }
   
  if (type === 'groq' && !key.startsWith('sgk_')) {
    return { valid: false, error: 'Invalid Groq API key format' };
  }
  
  return { valid: true };
};


export const getEnvironmentStatus = () => {
  const keys = getApiKeys();  
   return {
    gemini: { configured: !!keys.gemini, valid: validateApiKey(keys.gemini, 'gemini').valid },
    groq: { configured: !!keys.groq, valid: validateApiKey(keys.groq, 'groq').valid },
    autonoma: { configured: !!keys.autonoma.clientId && !!keys.autonoma.secretId }
  };
};