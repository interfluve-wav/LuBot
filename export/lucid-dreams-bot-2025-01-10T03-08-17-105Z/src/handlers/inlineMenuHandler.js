import { links } from '../config/links.js';

export class InlineMenuHandler {
  constructor(bot) {
    this.bot = bot;
  }

  async handleStartHere(msg) {
    const message = `
🚀 *Welcome to Lucid Dreams!*

Choose a section to explore:
`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '📢 Announcements', url: links.announcements },
          { text: '🐞 Bug Reports', url: links.bugReports }
        ],
        [
          { text: '💬 General Chat', url: links.general },
          { text: 'ℹ️ Project Info', url: links.projectInfo }
        ],
        [
          { text: '📋 Rules', url: links.rules }
        ]
      ]
    };

    await this.bot.sendMessage(msg.chat.id, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  }

  async handleCommunity(msg) {
    const message = `
👥 *Join Our Community*

Click below to join the main Lucid Dreams community:
`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🌟 Join Lucid Dreams Community', url: links.community }
        ]
      ]
    };

    await this.bot.sendMessage(msg.chat.id, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  }

  async handleWebApp(msg) {
    const message = `
🌐 *Lucid Dreams Web App*

Click below to access our web application:
`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🚀 Launch Web App', url: links.webApp }
        ]
      ]
    };

    await this.bot.sendMessage(msg.chat.id, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  }
}