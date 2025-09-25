const { GoogleGenerativeAI } = require('@google/generative-ai');

class ChatbotService {
  constructor() {
    // Validate API key
    const apiKey = process.env.GEMINI_CHATBOT_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_CHATBOT_API_KEY is not set in environment variables');
      throw new Error('Gemini API key is required');
    }

    console.log('Initializing Gemini AI with API key:', apiKey.substring(0, 10) + '...');
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: process.env.CHATBOT_MODEL || 'gemini-1.5-flash', // Changed to more stable model
      generationConfig: {
        temperature: parseFloat(process.env.CHATBOT_TEMPERATURE) || 0.7,
        maxOutputTokens: parseInt(process.env.CHATBOT_MAX_TOKENS) || 1000,
      }
    });
  }

  async generateResponse(message, conversationHistory = []) {
    try {
      console.log('Generating response for message:', message.substring(0, 50) + '...');
      
      // Build conversation context
      let prompt = `You are a helpful AI assistant for a Life Cycle Assessment (LCA) application. 
You help users understand environmental impact analysis, sustainability metrics, and project management.
Be concise, helpful, and professional in your responses.

User message: ${message}`;

      // Add conversation history for context (last 5 messages)
      if (conversationHistory.length > 0) {
        const recentHistory = conversationHistory.slice(-5);
        const historyText = recentHistory.map(msg => 
          `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
        ).join('\n');
        
        prompt = `Previous conversation:
${historyText}

Current user message: ${message}

Please respond helpfully and maintain conversation context.`;
      }

      console.log('Sending request to Gemini API...');
      
      // Add timeout to the request
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 30000); // 30 second timeout
      });
      
      const apiPromise = this.model.generateContent(prompt);
      
      const result = await Promise.race([apiPromise, timeoutPromise]);
      const response = await result.response;
      const text = response.text();

      console.log('Received response from Gemini API');
      return {
        success: true,
        message: text.trim()
      };
    } catch (error) {
      console.error('Chatbot service error:', error);
      
      // Handle specific error types
      if (error.message.includes('fetch failed')) {
        return {
          success: false,
          error: 'Network connection failed. Please check your internet connection and try again.',
          details: 'Unable to connect to Gemini API'
        };
      } else if (error.message.includes('API key')) {
        return {
          success: false,
          error: 'API configuration error. Please contact support.',
          details: 'Invalid API key'
        };
      } else if (error.message.includes('quota')) {
        return {
          success: false,
          error: 'Service temporarily unavailable. Please try again later.',
          details: 'API quota exceeded'
        };
      }
      
      // Fallback response if all else fails
      return this.getFallbackResponse(message);
    }
  }

  getFallbackResponse(message) {
    const fallbackResponses = [
      "I'm currently experiencing connectivity issues. However, I can help you with Life Cycle Assessment questions. Could you please try again in a moment?",
      "I'm having trouble connecting to my AI service right now. For LCA-related questions, you might want to check our documentation or try again shortly.",
      "Sorry, I'm temporarily unable to process your request. For immediate help with environmental impact analysis, please refer to our help section.",
    ];

    // Simple keyword-based responses for common LCA topics
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('lca') || lowerMessage.includes('life cycle')) {
      return {
        success: true,
        message: "Life Cycle Assessment (LCA) is a methodology to evaluate the environmental impacts of a product throughout its entire life cycle. I'm currently experiencing connectivity issues, but I'd be happy to help once the connection is restored."
      };
    } else if (lowerMessage.includes('carbon') || lowerMessage.includes('emission')) {
      return {
        success: true,
        message: "Carbon emissions are a key metric in LCA studies. They represent the amount of CO2 equivalent released during different life cycle stages. I'm having connectivity issues right now, but please try again shortly for more detailed assistance."
      };
    } else if (lowerMessage.includes('sustainability') || lowerMessage.includes('environmental')) {
      return {
        success: true,
        message: "Sustainability assessment involves evaluating environmental, social, and economic impacts. I'm currently offline but will be back shortly to provide more comprehensive guidance."
      };
    }

    return {
      success: true,
      message: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
    };
  }
}

module.exports = new ChatbotService();