import fs from 'fs/promises';
import path from 'path';

export class MessageLogger {
  constructor() {
    this.logFile = 'messages_id.json';
    this.banFile = 'banned_users.json';
  }

  async logMessage(msg) {
    try {
      const messages = await this.getMessages();
      const messageData = {
        message_id: msg.message_id,
        chat_id: msg.chat.id,
        user_id: msg.from.id,
        username: msg.from.username,
        text: msg.text,
        date: msg.date,
        timestamp: new Date().toISOString()
      };
      
      messages.push(messageData);
      await fs.writeFile(this.logFile, JSON.stringify(messages, null, 2));
      return true;
    } catch (error) {
      console.error('Error logging message:', error);
      return false;
    }
  }

  async getMessages() {
    try {
      const data = await fs.readFile(this.logFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // If file doesn't exist, return empty array
        return [];
      }
      console.error('Error reading messages:', error);
      return [];
    }
  }

  async getUserMessages(userId) {
    try {
      const messages = await this.getMessages();
      return messages.filter(m => m.user_id === userId);
    } catch (error) {
      console.error('Error getting user messages:', error);
      return [];
    }
  }

  convertToCSV(messages) {
    const headers = ['message_id', 'chat_id', 'user_id', 'username', 'text', 'date', 'timestamp'];
    const rows = messages.map(msg => 
      headers.map(header => {
        const value = msg[header];
        // Escape commas and quotes in text fields
        return typeof value === 'string' ? 
          `"${value.replace(/"/g, '""')}"` : 
          value;
      }).join(',')
    );
    
    return [headers.join(','), ...rows].join('\n');
  }
}