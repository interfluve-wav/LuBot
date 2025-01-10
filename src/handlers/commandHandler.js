import { MessageSender } from '../utils/messageSender.js';
import { Scheduler } from '../utils/scheduler.js';
import { errorHandler } from '../utils/errorHandler.js';
import { MessageLogger } from '../utils/messageLogger.js';
import { SupportHandler } from './supportHandler.js';
import { BugReportHandler } from './bugReportHandler.js';
import { InlineMenuHandler } from './inlineMenuHandler.js';

export class CommandHandler {
  constructor(bot) {
    this.bot = bot;
    this.messageSender = new MessageSender(bot);
    this.scheduler = new Scheduler(bot);
    this.messageLogger = new MessageLogger();
    this.supportHandler = new SupportHandler(bot);
    this.bugReportHandler = new BugReportHandler(bot);
    this.inlineMenuHandler = new InlineMenuHandler(bot);
    this.adminIds = process.env.ADMIN_IDS ? 
      process.env.ADMIN_IDS.split(',').map(id => parseInt(id)) : 
      [];
  }

  async handleCommand(command, msg) {
    try {
      // Handle slash commands
      if (command) {
        switch (command) {
          case '/start':
            await this.handleStart(msg);
            return;
          case '/help':
            await this.handleHelp(msg);
            return;
          case '/support':
            await this.supportHandler.handleSupportStart(msg);
            return;
          case '/report':
            await this.bugReportHandler.handleBugReportStart(msg);
            return;
          case '/extract_threads':
            // Command is handled in dispatcher
            return;
        }

        // Handle admin resolve commands
        if (command.startsWith('/resolve_')) {
          if (this.isAdmin(msg.from.id)) {
            const queryId = parseInt(command.split('_')[1]);
            await this.supportHandler.resolveTicket(msg, queryId);
          }
          return;
        }
      }

      // Rest of the command handling...
    } catch (error) {
      console.error('Error handling command:', error);
      errorHandler.handleError(`Error handling command ${command}`, error);
    }
  }

  isAdmin(userId) {
    return this.adminIds.includes(userId);
  }

  // ... rest of the class implementation remains the same ...
}