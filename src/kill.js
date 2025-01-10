import { ProcessManager } from './utils/processManager.js';

console.log('Attempting to kill bot process...');
const success = await ProcessManager.killBot();
console.log(success ? '✅ Bot process killed successfully' : '❌ Failed to kill bot process');