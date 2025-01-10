import { announcements } from '../content/announcements.js';
import { rules } from '../content/rules.js';
import { projectInfo } from '../content/projectInfo.js';
import { errorHandler } from './errorHandler.js';

export class MessageSender {
  constructor(bot) {
    this.bot = bot;
  }

  async sendInitialMessages(chatId) {
    try {
      // Send welcome message
      await this.bot.sendMessage(
        chatId,
        '🌟 *Welcome to Lucid Dreams!*\n\nSetting up your channel with initial information...',
        { parse_mode: 'Markdown' }
      );

      // Send announcements
      await this.bot.sendMessage(chatId, announcements, { 
        parse_mode: 'Markdown',
        disable_web_page_preview: true 
      });

      // Send rules
      const rulesMsg = await this.bot.sendMessage(chatId, rules, { 
        parse_mode: 'Markdown',
        disable_web_page_preview: true 
      });

      // Pin the rules message
      await this.bot.pinChatMessage(chatId, rulesMsg.message_id);

      return true;
    } catch (error) {
      errorHandler.handleError('Error sending initial messages', error);
      return false;
    }
  }

  async broadcastMessage(message, chatIds, options = {}) {
    const results = {
      successful: [],
      failed: []
    };

    const defaultOptions = {
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    };

    const messageOptions = { ...defaultOptions, ...options };

    for (const chatId of chatIds) {
      try {
        await this.bot.sendMessage(chatId, message, messageOptions);
        results.successful.push(chatId);
      } catch (error) {
        console.error(`Error sending broadcast to ${chatId}:`, error);
        results.failed.push(chatId);
      }
    }

    return results;
  }
}