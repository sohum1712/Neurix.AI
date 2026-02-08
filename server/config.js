require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  tavusApiKey: process.env.TAVUS_API_KEY || 'f355eaa4f55d4964ba6c04aef228620b',
  tavusApiUrl: process.env.TAVUS_API_URL || 'https://tavusapi.com/v2',
  replicaId: process.env.TAVUS_REPLICA_ID || 'r6ae5b6efc9d',
  defaultPersonaId: process.env.TAVUS_DEFAULT_PERSONA_ID,
  mongodbUri: process.env.MONGODB_URI,
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }
};
