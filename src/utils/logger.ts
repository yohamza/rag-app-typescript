import winston from 'winston';

export interface LoggerMetadata {
  [key: string]: any;
}

const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    const metaString = Object.keys(metadata).length ? JSON.stringify(metadata) : '';
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaString}`;
  })
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: customFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ],
  exitOnError: false,
});

class AppLogger {
  public logKnowledgeBase(message: string, metadata?: LoggerMetadata): void {
    logger.info(`KB: ${message}`, metadata);
  }

  public logModelResponse(message: string, metadata?: LoggerMetadata): void {
    logger.info(`Model: ${message}`, metadata);
  }

  public logExternalSearch(message: string, metadata?: LoggerMetadata): void {
    logger.info(`Search: ${message}`, metadata);
  }

  public logError(message: string, metadata?: LoggerMetadata): void {
    logger.error(message, metadata);
  }

  public logDebug(message: string, metadata?: LoggerMetadata): void {
    logger.debug(message, metadata);
  }

  public logInfo(message: string, metadata?: LoggerMetadata): void {
    logger.info(message, metadata);
  }

  public logVerbose(message: string, metadata?: LoggerMetadata): void {
    logger.verbose(message, metadata);
  }
}

export default new AppLogger();
