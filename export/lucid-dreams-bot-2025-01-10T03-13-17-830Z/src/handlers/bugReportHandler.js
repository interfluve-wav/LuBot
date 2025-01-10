import { errorHandler } from '../utils/errorHandler.js';
import { links } from '../config/links.js';
import { channels } from '../config/channels.js';

export class BugReportHandler {
  constructor(bot) {
    this.bot = bot;
    this.adminIds = process.env.ADMIN_IDS ? 
      process.env.ADMIN_IDS.split(',').map(id => parseInt(id)) : 
      [];
    this.awaitingBugReport = new Set();
  }

  async handleBugReportStart(msg) {
    const template = `
🐞 *Submit Bug Report*

Please provide the following information:

*Device Information:*
• Device Type:
• OS Version:
• App Version:

*Bug Description:*
• What happened:
• Expected behavior:
• Steps to reproduce:

*Additional Information:*
• Screenshots (if applicable)
• Error messages

Reply to this message with your report.
`;

    await this.bot.sendMessage(msg.chat.id, template, {
      parse_mode: 'Markdown',
      reply_markup: {
        force_reply: true
      }
    });

    this.awaitingBugReport.add(msg.chat.id);
  }

  async handleBugReport(msg) {
    try {
      const reportId = Date.now();
      // Format the bug report
      const formattedReport = `
🐞 *New Bug Report*

*Report ID:* #${reportId}
*From:* ${msg.from.username ? '@' + msg.from.username : 'User ' + msg.from.id}
*Time:* ${new Date().toISOString()}

*Report:*
${msg.text}

---
Status: Under Review
`;

      // Send to bug reports channel
      const sentReport = await this.bot.sendMessage(channels.bug_reports_channel, formattedReport, {
        parse_mode: 'Markdown'
      });

      if (!sentReport) {
        throw new Error('Failed to send report to channel');
      }

      // Send confirmation to user
      await this.bot.sendMessage(msg.chat.id, `
✅ *Bug Report Submitted*

*Report ID:* #${reportId}

Thank you for your report! Our team will review it shortly.

You can view all bug reports in our channel:
${links.bugReports}
`, {
        parse_mode: 'Markdown'
      });

      // Notify admins
      for (const adminId of this.adminIds) {
        try {
          await this.bot.sendMessage(adminId, `
📢 *New Bug Report Received*

Report ID: #${reportId}
Channel: ${channels.bug_reports_channel}
`, {
            parse_mode: 'Markdown'
          });
        } catch (error) {
          console.error(`Failed to notify admin ${adminId}:`, error);
        }
      }

      return true;
    } catch (error) {
      console.error('Error handling bug report:', error);
      errorHandler.handleError('Error handling bug report', error);
      
      await this.bot.sendMessage(msg.chat.id, 
        '❌ Sorry, there was an error submitting your bug report. Please try again later.');
      
      return false;
    }
  }

  isAwaitingBugReport(chatId) {
    return this.awaitingBugReport.has(chatId);
  }

  clearAwaitingBugReport(chatId) {
    this.awaitingBugReport.delete(chatId);
  }
}