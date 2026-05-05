// Production logging and monitoring middleware
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const logFile = path.join(logsDir, 'app.log');

const log = (message, level = 'INFO') => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;
  
  if (process.env.NODE_ENV === 'production') {
    fs.appendFileSync(logFile, logMessage);
  }
  console.log(logMessage);
};

const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`;
    const level = res.statusCode >= 400 ? 'WARN' : 'INFO';
    log(message, level);
  });
  
  next();
};

const errorLogger = (err, req, res, next) => {
  log(`ERROR: ${err.message}\nStack: ${err.stack}`, 'ERROR');
  next(err);
};

module.exports = {
  log,
  requestLogger,
  errorLogger,
  logFile
};
