import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const LOCK_FILE = '.bot.lock';

export class ProcessManager {
  static async isRunning() {
    try {
      const pid = await fs.readFile(LOCK_FILE, 'utf8');
      try {
        process.kill(parseInt(pid), 0);
        return true;
      } catch (e) {
        // Process not running, clean up stale lock file
        await fs.unlink(LOCK_FILE).catch(() => {});
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  static async createLock() {
    try {
      await fs.writeFile(LOCK_FILE, process.pid.toString());
      return true;
    } catch (error) {
      console.error('Failed to create lock file:', error);
      return false;
    }
  }

  static async removeLock() {
    try {
      await fs.unlink(LOCK_FILE);
      return true;
    } catch (error) {
      return false;
    }
  }

  static async killBot() {
    try {
      const isRunning = await this.isRunning();
      if (!isRunning) {
        console.log('Bot is not running');
        return true;
      }

      const pid = await fs.readFile(LOCK_FILE, 'utf8');
      try {
        process.kill(parseInt(pid));
        await this.removeLock();
        return true;
      } catch (e) {
        // If direct kill fails, try pkill
        await execAsync('pkill -f "node src/bot.js"');
        await this.removeLock();
        return true;
      }
    } catch (error) {
      console.error('Failed to kill bot process:', error);
      return false;
    }
  }
}