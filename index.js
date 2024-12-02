/**
 * Code Editor Server
 * A modern web-based code editor with file management and integrated terminal
 */

const http = require('http');
const express = require('express');
const { Server: SocketServer } = require('socket.io');
const cors = require('cors');
const path = require('path');

// Import modules
const config = require('./config');
const fileRoutes = require('./routes/fileRoutes');
const healthRoutes = require('./routes/healthRoutes');
const { setupSocketHandlers } = require('./socket/socketHandlers');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

/**
 * Initialize the application
 */
function initializeApp() {
  // Initialize Express and HTTP server
  const app = express();
  const server = http.createServer(app);
  
  // Initialize Socket.io
  const io = new SocketServer({
    cors: '*'
  });
  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Static files (if needed)
  app.use(express.static(path.join(__dirname, 'public')));
  // Routes
  app.use('/files', fileRoutes);
  app.use('/health', healthRoutes);
  
  // Error handling middleware (must be after all routes)
  app.use(errorHandler);
  
  // Attach socket.io to the server
  io.attach(server);
  
  // Set up socket handlers
  setupSocketHandlers(io);
  
  // Helper function for generating IDs (kept for backwards compatibility)
  app.locals.id = () => Math.floor(Math.random() * 100000).toString();
  
  // Start the server
  server.listen(config.PORT, () => {
    logger.success(`Server running on port ${config.PORT}`);
  });
  
  // Error handling
  server.on('error', (error) => {
    logger.error('Server error:', error);
    process.exit(1);
  });
  
  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: shutting down gracefully');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
    
    // If server doesn't close in 5 seconds, force shutdown
    setTimeout(() => {
      logger.error('Server shutdown timed out, forcing exit');
      process.exit(1);
    }, 5000);
  });
}

// Initialize the application
initializeApp();


