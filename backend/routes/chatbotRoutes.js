const express = require('express');
const ChatbotController = require('../controllers/chatbotController');

const router = express.Router();

// Health check endpoint
router.get('/health', ChatbotController.healthCheck);

// Send message to chatbot
router.post('/message', 
  ChatbotController.validateMessage,
  ChatbotController.sendMessage
);

module.exports = router;