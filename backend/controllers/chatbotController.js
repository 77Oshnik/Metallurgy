const chatbotService = require("../services/chatbotService");
const { body, validationResult } = require("express-validator");

class ChatbotController {
  // Validation middleware
  static validateMessage = [
    body("message")
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage("Message must be between 1 and 1000 characters"),
    body("conversationHistory")
      .optional()
      .isArray({ max: 20 })
      .withMessage(
        "Conversation history must be an array with max 20 messages"
      ),
  ];

  static async sendMessage(req, res) {
    try {
      // Check validation results
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const { message, conversationHistory = [] } = req.body;

      // Generate AI response
      const result = await chatbotService.generateResponse(
        message,
        conversationHistory
      );

      if (result.success) {
        res.json({
          success: true,
          response: result.message,
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error,
          details: result.details,
        });
      }
    } catch (error) {
      console.error("Chatbot controller error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        details: error.message,
      });
    }
  }

  static async healthCheck(req, res) {
    try {
      // Test a simple API call
      const testResult = await chatbotService.generateResponse("Hello, this is a test message.");
      
      res.json({
        success: true,
        message: 'Chatbot service is running',
        apiConnectivity: testResult.success ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.json({
        success: true,
        message: 'Chatbot service is running (with fallback)',
        apiConnectivity: 'Disconnected',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = ChatbotController;
