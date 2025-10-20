const { handleCors } = require('./_helpers/cors');

async function handler(req, res) {
  return res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
}

module.exports = (req, res) => handleCors(req, res, handler);