/**
 * Production Lambda Handler for SIMISAI
 * Integrates Express server with AWS Lambda + API Gateway
 * System Architect - Production Deployment
 */

const { createServer } = require('http');
const { Server } = require('@vercel/node');

// Import your Express app (this will be the built server/index.js)
let app;

try {
  process.env.NODE_ENV = 'production';

  // Try to import the built Express server
  app = require('./index.js').default || require('./index.js');
  console.log('✅ Successfully imported built Express server');
} catch (error) {
  console.error('Failed to import Express app:', error);
  // Fallback to a simple Express app
  const express = require('express');
  app = express();
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  
  // Basic health check
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      service: 'simisai-production'
    });
  });
  
  // API routes placeholder
  app.get('/api/status', (req, res) => {
    res.json({
      service: 'SIMISAI Production Backend',
      status: 'running',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });
  
  // Chat endpoint
  app.post('/api/chat/ask', async (req, res) => {
    try {
      const { sessionId, question, language = 'en' } = req.body || {};
      
      // For now, return a simple response
      // In production, this would integrate with your Sealion LLM
      const response = {
        ok: true,
        message: {
          id: Date.now().toString(),
          sessionId: sessionId || 'default',
          message: `I received your question: "${question}". This is a production response from SIMISAI.`,
          isUser: false,
          language: language,
          createdAt: new Date().toISOString()
        }
      };
      
      res.json(response);
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ 
        ok: false, 
        error: 'Chat service temporarily unavailable' 
      });
    }
  });
  
  // CV endpoints removed - now handled directly by ALB
  // Frontend connects directly to: https://simis-cv-alb-578986465.us-west-2.elb.amazonaws.com/predict
  
  // Devices API
  app.get('/api/devices', async (req, res) => {
    try {
      // Placeholder device data
      const devices = [
        {
          id: 'thermometer-digital',
          name: 'Digital Thermometer',
          type: 'Vital Signs',
          brand: 'Omron',
          model: 'MC-246',
          description: 'Digital thermometer for oral temperature measurement'
        },
        {
          id: 'blood-pressure-monitor',
          name: 'Blood Pressure Monitor',
          type: 'Vital Signs',
          brand: 'Omron',
          model: 'HEM-7120',
          description: 'Automatic blood pressure monitor'
        }
      ];
      
      res.json(devices);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch devices' });
    }
  });
  
  // CORS middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });
  
  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({ 
      error: 'Not found',
      path: req.originalUrl,
      method: req.method
    });
  });
  
  // Error handler
  app.use((err, req, res, next) => {
    console.error('Express error:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
  });
}

// Create the Lambda handler
const handler = async (event, context) => {
  try {
    // Set up the serverless environment
    context.callbackWaitsForEmptyEventLoop = false;
    
    // Create a serverless handler
    const serverlessHandler = Server(app);
    
    // Handle the Lambda event
    const result = await serverlessHandler(event, context);
    
    return result;
  } catch (error) {
    console.error('Lambda handler error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Lambda handler failed',
        timestamp: new Date().toISOString()
      })
    };
  }
};

module.exports = { handler };
