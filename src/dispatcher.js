import { CommandHandler } from './handlers/commandHandler.js';
import { MessageLogger } from './utils/messageLogger.js';
import { errorHandler } from './utils/errorHandler.js';
import { channels } from './config/channels.js';
import { ThreadExtractor } from './utils/threadExtractor.js';

export class Dispatcher {
  constructor(bot) {
    this.bot = bot;
    this.commandHandler = new CommandHandler(bot);
    this.messageLogger = new MessageLogger();
    this.threadExtractor = new ThreadExtractor(bot);
  }

  async handleMessage(msg) {
    try {
      // Log message details
      console.log('Received message:', {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        text: msg.text,
        thread_id: msg.message_thread_id
      });

      // Handle extract_threads command
      if (msg.text === '/extract_threads' && this.commandHandler.isAdmin(msg.from.id)) {
        console.log('Executing extract_threads command');
        
        try {
          // Try with the supergroup ID
          const chatId = -1002457693609; // Your supergroup ID
          console.log('Attempting to extract threads from chat:', chatId);
          
          const threads = await this.threadExtractor.getThreadInfo(chatId);
          console.log('Extracted threads:', threads);

          if (!threads || threads.length === 0) {
            await this.bot.sendMessage(msg.chat.id, 
              '❌ No threads found. This might be due to permissions or the chat not being a forum.');
            return;
          }

          const threadList = threads
            .map(t => `• Thread ID: ${t.thread_id}${t.name ? `\n  Name: ${t.name}` : ''}`)
            .join('\n\n');

          await this.bot.sendMessage(msg.chat.id,
            `📋 *Found Threads:*\n\n${threadList}`,
            { parse_mode: 'Markdown' }
          );
        } catch (error) {
          console.error('Error in extract_threads:', error);
          await this.bot.sendMessage(msg.chat.id,
            `❌ Error extracting threads: ${error.message}`);
        }
        return;
      }

      // Handle other messages...
    } catch (error) {
      console.error('Error in message handler:', error);
      errorHandler.handleError('Error in message handler', error);
    }
  }
}