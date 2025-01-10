import winston from 'winston';
import { promises as fs } from 'fs';

class ErrorHandler {
  constructor() {
    this.logger = winston.createLogger({
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'error.log' })
      ]
    });

    this.adminIds = process.env.ADMIN_IDS ? 
      process.env.ADMIN_IDS.split(',').map(id => parseInt(id)) : 
      [];
    this.bot = null;
  }

  setBot(bot) {
    this.bot = bot;
  }

  async handleError(context, error) {
    const errorMessage = {
      context,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };

    // Log error
    this.logger.error(errorMessage);

    // Notify admins if bot instance is available
    if (this.bot && this.adminIds.length > 0) {
      const adminMessage = `🚨 *Error Alert*\n\n*Context:* ${context}\n*Error:* ${error.message}\n\nCheck error.log for details.`;
      
      for (const adminId of this.adminIds) {
        try {
          await this.bot.sendMessage(adminId, adminMessage, {
            parse_mode: 'Markdown'
          });
        } catch (notifyError) {
          this.logger.error({
            context: 'Failed to notify admin',
            adminId,
            error: notifyError.message
          });
        }
      }
    }
  }

  async getErrorLogs(limit = 10) {
    try {
      const logContent = await fs.readFile('error.log', 'utf-8');
      const logs = logContent
        .split('\n')
        .filter(Boolean)
        .map(line => JSON.parse(line))
        .slice(-limit);
      
      return logs;
    } catch (error) {
      this.logger.error({
        context: 'Failed to read error logs',
        error: error.message
      });
      return [];
    }
  }

  async clearErrorLogs() {
    try {
      await fs <boltAction type="file" filePath="src/utils/errorHandler.js">      await fs.writeFile('error.log', '');
      return true;
    } catch (error) {
      this.logger.error({
        context: 'Failed to clear error logs',
        error: error.message
      });
      return false;
    }
  }
}

export const errorHandler = new ErrorHandler();