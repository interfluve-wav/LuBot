import { promises as fs } from 'fs';

export class VerificationManager {
  constructor() {
    this.verificationFile = 'verified_users.json';
    this.pendingVerifications = new Map();
  }

  async loadVerifiedUsers() {
    try {
      const data = await fs.readFile(this.verificationFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await fs.writeFile(this.verificationFile, JSON.stringify([]));
        return [];
      }
      throw error;
    }
  }

  async saveVerifiedUsers(users) {
    await fs.writeFile(this.verificationFile, JSON.stringify(users, null, 2));
  }

  async isVerified(userId) {
    const verifiedUsers = await this.loadVerifiedUsers();
    return verifiedUsers.some(user => user.userId === userId);
  }

  async addVerifiedUser(userData) {
    const verifiedUsers = await this.loadVerifiedUsers();
    verifiedUsers.push({
      userId: userData.userId,
      username: userData.username,
      verifiedAt: new Date().toISOString()
    });
    await this.saveVerifiedUsers(verifiedUsers);
  }

  createVerificationCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  setPendingVerification(userId, code) {
    this.pendingVerifications.set(userId, {
      code,
      timestamp: Date.now()
    });
  }

  getPendingVerification(userId) {
    return this.pendingVerifications.get(userId);
  }

  clearPendingVerification(userId) {
    this.pendingVerifications.delete(userId);
  }
}