import { errorHandler } from '../utils/errorHandler.js';
import { SupportLogger } from '../utils/supportLogger.js';
import { channels } from '../config/channels.js';

export class SupportHandler {
  constructor(bot) {
    this.bot = bot;
    this.supportLogger = new SupportLogger();
    this.adminIds = process.env.ADMIN_IDS ? 
      process.env.ADMIN_IDS.split(',').map(id => parseInt(id)) : 
      [];
    this.awaitingSupportQuery = new Set();
  }

  async handleSupportStart(msg) {
    try {
      const supportMessage = `
📝 *New Support Ticket*

Please describe your issue or question in detail. Include:
• What you need help with
• Any relevant details
• Steps to reproduce (if reporting an issue)

Your ticket will be assigned to our support team.`;

      await this.bot.sendMessage(msg.chat.id, supportMessage, {
        parse_mode: 'Markdown',
        reply_markup: {
          force_reply: true
        }
      });

      this.awaitingSupportQuery.add(msg.chat.id);
    } catch (error) {
      console.error('Error in handleSupportStart:', error);
      errorHandler.handleError('Error in handleSupportStart', error);
    }
  }

  async handleSupportQuery(msg) {
    try {
      console.log('Creating new support ticket...');
      
      // Log the support query
      const queryData = await this.supportLogger.logQuery(msg, msg.text);
      console.log('Support ticket created:', queryData);

      // Format ticket for support channel
      const ticketMessage = `
🎫 *New Support Ticket*

*Ticket ID:* #${queryData.query_id}
*From:* ${msg.from.username ? '@' + msg.from.username : 'User ' + msg.from.id}
*Status:* Pending
*Created:* ${new Date(queryData.created_at).toLocaleString()}

*Message:*
${msg.text}

Use /resolve\\_${queryData.query_id} to mark as resolved`;

      console.log('Sending ticket to support channel:', channels.support_tickets);
      
      // Send to support channel and store the message ID
      const sentMessage = await this.bot.sendMessage(channels.support_tickets, ticketMessage, {
        parse_mode: 'Markdown'
      });

      console.log('Ticket sent to channel, message ID:', sentMessage.message_id);

      // Update the ticket with the message ID
      await this.supportLogger.updateTicketMessageId(queryData.query_id, sentMessage.message_id);

      // Send confirmation to user
      const confirmationMessage = `
✅ *Support Ticket Created*

*Ticket ID:* #${queryData.query_id}
*Status:* Pending
*Created:* ${new Date(queryData.created_at).toLocaleString()}

We'll notify you when there's an update.`;

      await this.bot.sendMessage(msg.chat.id, confirmationMessage, {
        parse_mode: 'Markdown'
      });

      return true;
    } catch (error) {
      console.error('Error handling support query:', error);
      errorHandler.handleError('Error handling support query', error);
      
      // Notify user of error
      await this.bot.sendMessage(msg.chat.id, 
        '❌ Sorry, there was an error processing your support request. Please try again later.');
      
      // Notify admins of the error
      for (const adminId of this.adminIds) {
        try {
          await this.bot.sendMessage(adminId, 
            `⚠️ Error processing support ticket:\n${error.message}`);
        } catch (notifyError) {
          console.error(`Failed to notify admin ${adminId}:`, notifyError);
        }
      }
      
      return false;
    }
  }

  async resolveTicket(msg, queryId) {
    try {
      console.log('Resolving ticket:', queryId);
      
      // Get the ticket data
      const ticket = await this.supportLogger.getQueryById(queryId);
      console.log('Found ticket:', ticket);
      
      if (!ticket) {
        console.log('Ticket not found:', queryId);
        await this.bot.sendMessage(msg.chat.id, 
          '❌ Ticket not found. Please check the ticket ID and try again.');
        return false;
      }

      // Update ticket status
      await this.supportLogger.updateQueryStatus(queryId, 'resolved');
      console.log('Ticket status updated to resolved');

      // Send resolution message as a reply to the original ticket in the support channel
      const resolutionMessage = `
🎯 *=== TICKET RESOLVED ===*

*Ticket ID:* #${queryId}
*Resolved by:* ${msg.from.username ? '@' + msg.from.username : 'Admin'}
*Resolution Time:* ${new Date().toLocaleString()}

✅ This support ticket has been marked as resolved.
━━━━━━━━━━━━━━━━━━━━━━`;

      console.log('Sending resolution message to channel');
      console.log('Original message ID:', ticket.message_id);
      
      // Send as reply if we have the original message ID
      if (ticket.message_id) {
        await this.bot.sendMessage(channels.support_tickets, resolutionMessage, {
          parse_mode: 'Markdown',
          reply_to_message_id: ticket.message_id
        });
      } else {
        // Fallback to regular message if no message ID is stored
        await this.bot.sendMessage(channels.support_tickets, resolutionMessage, {
          parse_mode: 'Markdown'
        });
      }

      console.log('Resolution message sent to channel');

      // Notify the user that their ticket was resolved
      const userNotification = `
✨ *Support Ticket Resolution*

Great news! Your support ticket has been resolved.

*Ticket Details:*
• Ticket ID: #${queryId}
• Resolution Time: ${new Date().toLocaleString()}

Thank you for using our support system! If you need further assistance, feel free to open a new ticket.`;

      console.log('Sending notification to user:', ticket.chat_id);

      try {
        await this.bot.sendMessage(ticket.chat_id, userNotification, {
          parse_mode: 'Markdown'
        });
        console.log('User notification sent successfully');
      } catch (notifyError) {
        console.error('Failed to send user notification:', notifyError);
        errorHandler.handleError('Failed to send resolution notification to user', notifyError);
        
        // Notify admin of failed user notification
        await this.bot.sendMessage(msg.chat.id,
          `⚠️ Ticket resolved but failed to notify user: ${notifyError.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error resolving ticket:', error);
      errorHandler.handleError('Error resolving ticket', error);
      
      await this.bot.sendMessage(msg.chat.id, 
        '❌ Error resolving ticket. Please try again later.');
      
      return false;
    }
  }

  isAwaitingSupport(chatId) {
    return this.awaitingSupportQuery.has(chatId);
  }

  clearAwaitingSupport(chatId) {
    this.awaitingSupportQuery.delete(chatId);
  }
}