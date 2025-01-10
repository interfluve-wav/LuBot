import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { Dispatcher } from './dispatcher.js';
import { errorHandler } from './utils/errorHandler.js';
import { ProcessManager } from './utils/processManager.js';

// Load environment variables
dotenv.config();

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error('BOT_TOKEN is not set in environment variables');
  process.exit(1);
}

async function startBot() {
  try {
    // Check if bot is already running
    const isRunning = await ProcessManager.isRunning();
    if (isRunning) {
      console.error('Bot is already running');
      process.exit(1);
    }

    // Create lock file
    await ProcessManager.createLock();
    console.log('Bot lock created with PID:', process.pid);

    // Initialize bot with polling
    const bot = new TelegramBot(token, {
      polling: true,
      filepath: false
    });

    // Set error handler
    errorHandler.setBot(bot);

    // Initialize dispatcher
    const dispatcher = new Dispatcher(bot);

    // Register bot commands
    const commands = [
      { command: 'start', description: 'Start the bot' },
      { command: 'help', description: 'Show help message' },
      { command: 'support', description: 'Get support' },
      { command: 'report', description: 'Report a bug' }
    ];

    // Set bot commands
    await bot.setMyCommands(commands);

    // Handle incoming messages
    bot.on('message', async (msg) => {
      try {
        await dispatcher.handleMessage(msg);
      } catch (error) {
        console.error('Error handling message:', error);
        errorHandler.handleError('Message handling error', error);
      }
    });

    // Send startup message to admin
    const adminIds = process.env.ADMIN_IDS ? 
      process.env.ADMIN_IDS.split(',').map(id => parseInt(id)) : 
      [];

    const startupMessage = `
🤖 *Lucid Dreams Bot Started*

✅ *Status Check:*
• Bot Token: Valid
• Polling: Active
• Commands: Loaded
• Time: ${new Date().toISOString()}
• PID: ${process.pid}

The bot is now ready to receive commands!
`;

    for (const adminId of adminIds) {
      try {
        await bot.sendMessage(adminId, startupMessage, {
          parse_mode: 'Markdown'
        });
      } catch (error) {
        console.error(`Failed to send startup message to admin ${adminId}:`, error);
      }
    }

    console.log('Lucid Dreams Bot is running with long polling...');

  } catch (error) {
    console.error('Failed to start bot:', error);
    errorHandler.handleError('Bot startup error', error);
    await ProcessManager.removeLock();
    process.exit(1);
  }
}

// Start the bot
await startBot();

// Handle cleanup
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Cleaning up...');
  await ProcessManager.removeLock();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Cleaning up...');
  await ProcessManager.removeLock();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error);
  await ProcessManager.removeLock();
  process.exit(1);
});