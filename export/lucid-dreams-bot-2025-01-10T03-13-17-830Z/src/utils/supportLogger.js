import { promises as fs } from 'fs';

export class SupportLogger {
  constructor() {
    this.logFile = 'support_queries.json';
  }

  async loadQueries() {
    try {
      const data = await fs.readFile(this.logFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // If file doesn't exist, create it with empty array
        const emptyQueries = [];
        await fs.writeFile(this.logFile, JSON.stringify(emptyQueries, null, 2));
        return emptyQueries;
      }
      throw error;
    }
  }

  async saveQueries(queries) {
    await fs.writeFile(this.logFile, JSON.stringify(queries, null, 2));
  }

  async logQuery(msg, query) {
    try {
      const queries = await this.loadQueries();
      const queryData = {
        query_id: Date.now(),
        message_id: null,
        chat_id: msg.chat.id,
        user_id: msg.from.id,
        username: msg.from.username,
        query: query,
        status: 'pending',
        created_at: new Date().toISOString(),
        updates: [{
          status: 'pending',
          timestamp: new Date().toISOString(),
          note: 'Ticket created'
        }]
      };
      
      queries.push(queryData);
      await this.saveQueries(queries);
      return queryData;
    } catch (error) {
      console.error('Error logging support query:', error);
      return null;
    }
  }

  async getQueries() {
    try {
      return await this.loadQueries();
    } catch (error) {
      console.error('Error reading support queries:', error);
      return [];
    }
  }

  async getQueryById(queryId) {
    try {
      const queries = await this.getQueries();
      return queries.find(q => q.query_id === queryId);
    } catch (error) {
      console.error('Error getting query by ID:', error);
      return null;
    }
  }

  async updateTicketMessageId(queryId, messageId) {
    try {
      const queries = await this.getQueries();
      const queryIndex = queries.findIndex(q => q.query_id === queryId);
      
      if (queryIndex !== -1) {
        queries[queryIndex].message_id = messageId;
        await this.saveQueries(queries);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating ticket message ID:', error);
      return false;
    }
  }

  async updateQueryStatus(queryId, status) {
    try {
      const queries = await this.getQueries();
      const queryIndex = queries.findIndex(q => q.query_id === queryId);
      
      if (queryIndex !== -1) {
        queries[queryIndex].status = status;
        queries[queryIndex].updated_at = new Date().toISOString();
        queries[queryIndex].updates.push({
          status: status,
          timestamp: new Date().toISOString(),
          note: `Status updated to ${status}`
        });
        
        await this.saveQueries(queries);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating query status:', error);
      return false;
    }
  }
}