# Lucid Dreams Telegram Bot

A Telegram bot for managing community interactions and support tickets.

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with:
```
BOT_TOKEN=your_bot_token
ADMIN_IDS=id1,id2
TIMEZONE=UTC
```

4. Start the bot:
```bash
npm start
```

For development:
```bash
npm run dev
```

## Features

- Support ticket system with admin notifications
- Message logging and export
- Error handling and admin alerts
- Scheduled messages
- Community management
- Interactive menus and commands
- User support queries with ticket tracking
- Admin dashboard for ticket management

## Project Structure

```
├── src/
│   ├── bot.js              # Main bot file
│   ├── dispatcher.js       # Message dispatcher
│   ├── handlers/          
│   │   └── commandHandler.js
│   ├── utils/
│   │   ├── errorHandler.js
│   │   ├── messageLogger.js
│   │   ├── messageSender.js
│   │   ├── scheduler.js
│   │   └── supportLogger.js
│   └── content/           
│       ├── announcements.js
│       ├── bugReports.js
│       ├── projectInfo.js
│       └── rules.js
├── .env                    # Environment variables
└── package.json
```

## Important Notes

- The bot uses a ticket system for support queries
- Each ticket gets a unique ID and is tracked
- Admins receive notifications for new tickets
- Users get confirmation with ticket numbers
- Support history is maintained in JSON format
- Error logs are available for debugging

## License

MIT License