import schedule from 'node-schedule';
import { errorHandler } from './errorHandler.js';

export class Scheduler {
  constructor(bot) {
    this.bot = bot;
    this.jobs = new Map();
    this.timezone = process.env.TIMEZONE || 'UTC';
  }

  async scheduleMessage(chatId, message, date, options = {}) {
    try {
      const jobId = `${chatId}_${Date.now()}`;

      // Cancel existing job with same ID if exists
      if (this.jobs.has(jobId)) {
        this.jobs.get(jobId).cancel();
      }

      const defaultOptions = {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      };

      const messageOptions = { ...defaultOptions, ...options };

      const job = schedule.scheduleJob(date, async () => {
        try {
          await this.bot.sendMessage(chatId, message, messageOptions);
          this.jobs.delete(jobId);
        } catch (error) {
          errorHandler.handleError('Failed to send scheduled message', error);
        }
      });

      this.jobs.set(jobId, job);
      return jobId;
    } catch (error) {
      errorHandler.handleError('Failed to schedule message', error);
      return null;
    }
  }

  async scheduleRecurringMessage(chatId, message, rule, options = {}) {
    try {
      const jobId = `recurring_${chatId}_${Date.now()}`;

      if (this.jobs.has(jobId)) {
        this.jobs.get(jobId).cancel();
      }

      const defaultOptions = {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      };

      const messageOptions = { ...defaultOptions, ...options };

      const job = schedule.scheduleJob(rule, async () => {
        try {
          await this.bot.sendMessage(chatId, message, messageOptions);
        } catch (error) {
          errorHandler.handleError('Failed to send recurring message', error);
        }
      });

      this.jobs.set(jobId, job);
      return jobId;
    } catch (error) {
      errorHandler.handleError('Failed to schedule recurring message', error);
      return null;
    }
  }

  cancelJob(jobId) {
    if (this.jobs.has(jobId)) {
      this.jobs.get(jobId).cancel();
      this.jobs.delete(jobId);
      return true;
    }
    return false;
  }

  cancelAllJobs() {
    for (const [jobId, job] of this.jobs) {
      job.cancel();
      this.jobs.delete(jobId);
    }
  }

  getActiveJobs() {
    return Array.from(this.jobs.keys());
  }
}