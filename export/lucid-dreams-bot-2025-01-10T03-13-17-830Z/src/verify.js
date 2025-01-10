import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { ProcessManager } from './utils/processManager.js';

dotenv.config();

const token = process.env.BOT_TOKEN;

async function checkBotStatus() {
  console.log('Checking bot status...');

  try {
    // Check if bot is running
    const isRunning = await ProcessManager.isRunning();
    if (isRunning) {
      const pid = await fs.readFile('.bot.lock', 'utf8');
      console.log(`🟢 Bot is running with PID: ${pid}`);
    } else {
      console.log('🔴 Bot is not running');
    }

    // Verify bot token
    if (!token) {
      console.error('❌ BOT_TOKEN is not set in environment variables');
      process.exit(1);
    }

    console.log('\nVerifying bot token...');
    const bot = new TelegramBot(token, { polling: false });
    const botInfo = await bot.getMe();
    
    console.log('✅ Bot token is valid!');
    console.log('Bot Info:', botInfo);
  } catch (error) {
    if (error.code === 'ETELEGRAM') {
      console.error('❌ Bot token is invalid. Please check your .env file and update BOT_TOKEN');
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  }
}

checkBotStatus().catch(console.error);