import { promises as fs } from 'fs';
import path from 'path';

async function exportBot() {
  try {
    const exportDir = 'export';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportPath = path.join(exportDir, `lucid-dreams-bot-${timestamp}`);

    // Create export directory
    await fs.mkdir(exportPath, { recursive: true });

    // Files and directories to export
    const filesToCopy = [
      'package.json',
      'package-lock.json',
      'README.md',
      'nodemon.json',
      '.env.example'
    ];

    const dirsToCopy = [
      'src'
    ];

    // Copy individual files
    for (const file of filesToCopy) {
      try {
        const content = await fs.readFile(file, 'utf8');
        await fs.writeFile(path.join(exportPath, file), content);
      } catch (err) {
        console.log(`Skipping ${file}: ${err.message}`);
      }
    }

    // Create .env.example if it doesn't exist
    const envExample = `BOT_TOKEN=your_bot_token_here
ADMIN_IDS=id1,id2
TIMEZONE=UTC
SUPPORT_CHANNEL_ID=-1000000000000
BUG_REPORTS_CHANNEL_ID=-1000000000000`;

    await fs.writeFile(path.join(exportPath, '.env.example'), envExample);

    // Copy directories recursively
    for (const dir of dirsToCopy) {
      await copyDir(dir, path.join(exportPath, dir));
    }

    console.log(`✅ Bot exported successfully to: ${exportPath}`);
    return exportPath;
  } catch (error) {
    console.error('❌ Export failed:', error);
    throw error;
  }
}

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

// Run export if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  exportBot().catch(console.error);
}

export { exportBot };