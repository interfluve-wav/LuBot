import { errorHandler } from './errorHandler.js';

export class ThreadExtractor {
  constructor(bot) {
    this.bot = bot;
  }

  async getThreadInfo(chatId) {
    try {
      console.log('Starting thread extraction for chat:', chatId);

      // Convert string chat ID to number if needed
      const numericChatId = typeof chatId === 'string' ? parseInt(chatId) : chatId;
      console.log('Using numeric chat ID:', numericChatId);

      // Get chat info first
      const chat = await this.bot.getChat(numericChatId);
      console.log('Retrieved chat info:', {
        id: chat.id,
        type: chat.type,
        title: chat.title,
        is_forum: chat.is_forum
      });

      // Check if chat is a forum
      if (!chat.is_forum) {
        console.log('Chat is not a forum, attempting to get messages directly');
        // Try to get messages even if not marked as forum
        const messages = await this.bot.getChat(numericChatId);
        console.log('Direct chat messages:', messages);
      }

      try {
        // Attempt to get forum topics
        console.log('Attempting to get forum topics...');
        const topics = await this.bot.getForumTopics(numericChatId);
        console.log('Retrieved forum topics:', topics);

        if (topics && topics.length > 0) {
          const threads = topics.map(topic => ({
            thread_id: topic.message_thread_id,
            name: topic.name,
            chat_id: numericChatId
          }));
          console.log('Extracted thread information:', threads);
          return threads;
        }
      } catch (topicError) {
        console.log('Error getting forum topics:', topicError.message);
      }

      // Fallback: Try to get updates
      console.log('Attempting fallback method...');
      const updates = await this.bot.getUpdates();
      console.log('Got updates:', updates);

      const threads = updates
        .filter(update => update.message && update.message.chat.id === numericChatId)
        .map(update => ({
          thread_id: update.message.message_thread_id,
          chat_id: update.message.chat.id,
          text: update.message.text
        }))
        .filter(thread => thread.thread_id);

      console.log('Extracted threads from updates:', threads);
      return threads;

    } catch (error) {
      console.error('Error in thread extraction:', error);
      errorHandler.handleError('Thread extraction error', error);
      throw error;
    }
  }
}