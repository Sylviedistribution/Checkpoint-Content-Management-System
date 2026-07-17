const app = require('./src/app');
const { testConnection } = require('./src/config/database');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await testConnection();
    logger.info('Base de donnees connectee');
  } catch (err) {
    logger.error(`Connexion base de donnees impossible : ${err.message}`);
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    logger.info(`EduCMS API demarre sur le port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });

  // Arret propre
  const shutdown = (signal) => {
    logger.info(`${signal} recu, arret du serveur...`);
    server.close(() => process.exit(0));
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
})();
